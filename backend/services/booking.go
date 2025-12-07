package services

import (
	"context"
	"fmt"
	"path/filepath"
	"time"

	"gorm.io/gorm"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/fitranmei/Mooove-/backend/repositories"
	"github.com/fitranmei/Mooove-/backend/utils"
)

type BookingService struct {
	db               *gorm.DB
	bookingRepo      repositories.BookingRepo
	ketersediaanRepo repositories.KetersediaanRepo
}

func NewBookingService(db *gorm.DB, br repositories.BookingRepo, kr repositories.KetersediaanRepo) *BookingService {
	return &BookingService{db: db, bookingRepo: br, ketersediaanRepo: kr}
}

func (s *BookingService) CreateBookingWithReserve(ctx context.Context, userID *uint, scheduleID uint, seatIDs []uint, penumpangs []models.Penumpang, total int64) (*models.Booking, error) {
	if len(seatIDs) == 0 || len(seatIDs) != len(penumpangs) {
		return nil, fmt.Errorf("jumlah kursi dan penumpang tidak sesuai")
	}

	var booking models.Booking

	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		booking = models.Booking{
			UserID:          userID,
			TrainScheduleID: scheduleID,
			Status:          "pending",
			TotalPrice:      total,
			CreatedAt:       now,
			UpdatedAt:       now,
		}
		if err := s.bookingRepo.Create(tx, &booking); err != nil {
			return err
		}

		inv, err := s.ketersediaanRepo.FindAndLockBySchedule(tx, scheduleID, seatIDs)
		if err != nil {
			return err
		}

		for _, r := range inv {
			if r.Status != "available" {
				return fmt.Errorf("kursi %d tidak tersedia", r.SeatID)
			}
		}

		var invIDs []uint
		for _, r := range inv {
			invIDs = append(invIDs, r.ID)
		}
		if err := s.ketersediaanRepo.MarkReserved(tx, invIDs, booking.ID); err != nil {
			return err
		}

		now2 := time.Now()
		for i := range penumpangs {
			penumpangs[i].BookingID = booking.ID
			penumpangs[i].SeatID = seatIDs[i]
			penumpangs[i].CreatedAt = now2
			if err := tx.Create(&penumpangs[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &booking, nil
}

func (s *BookingService) CompleteBookingAndIssueTickets(ctx context.Context, bookingID uint) error {
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		booking, err := s.bookingRepo.GetByID(bookingID)
		if err != nil {
			return err
		}

		if booking.Status == "paid" {
			return nil
		}

		now := time.Now()

		if err := tx.Model(&models.KetersediaanKursi{}).
			Where("reserved_by_booking = ? AND status = ?", bookingID, "reserved").
			Updates(map[string]interface{}{
				"status":         "booked",
				"reserved_until": nil,
				"updated_at":     now,
			}).Error; err != nil {
			return err
		}

		var penumpangs []models.Penumpang
		if err := tx.Where("booking_id = ?", bookingID).Find(&penumpangs).Error; err != nil {
			return err
		}

		for i, p := range penumpangs {
			noTiket := fmt.Sprintf("T-%d-%03d", bookingID, i+1)

			tiket := models.Tiket{
				BookingID:   bookingID,
				PenumpangID: p.ID,
				SeatID:      p.SeatID,
				NoTiket:     noTiket,
				IssuedAt:    &now,
				CreatedAt:   now,
				UpdatedAt:   now,
			}

			if err := tx.Create(&tiket).Error; err != nil {
				return err
			}

			qrFile := filepath.Join("storage", "qr", fmt.Sprintf("tiket_%d_%d.png", bookingID, tiket.ID))

			qrText := tiket.NoTiket

			if err := utils.GenerateQR(qrText, qrFile); err != nil {
				return err
			}

			tiket.QRPath = qrFile
			if err := tx.Save(&tiket).Error; err != nil {
				return err
			}

			if err := tx.Model(&models.Penumpang{}).
				Where("id = ?", p.ID).
				Updates(map[string]interface{}{"no_tiket": noTiket}).Error; err != nil {
				return err
			}
		}

		booking.Status = "paid"
		booking.UpdatedAt = now
		if err := s.bookingRepo.SimpanUpdate(tx, booking); err != nil {
			return err
		}

		return nil
	})
}

func (s *BookingService) ReleaseBookingReservation(ctx context.Context, bookingID uint) error {
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		booking, err := s.bookingRepo.GetByID(bookingID)
		if err != nil {
			return err
		}

		if booking.Status == "cancelled" {
			return nil
		}

		if err := tx.Model(&models.KetersediaanKursi{}).
			Where("reserved_by_booking = ? AND status = ?", bookingID, "reserved").
			Updates(map[string]interface{}{
				"status":              "available",
				"reserved_by_booking": 0,
				"reserved_until":      nil,
				"updated_at":          time.Now(),
			}).Error; err != nil {
			return err
		}

		booking.Status = "cancelled"
		booking.UpdatedAt = time.Now()
		if err := s.bookingRepo.SimpanUpdate(tx, booking); err != nil {
			return err
		}

		return nil
	})
}
