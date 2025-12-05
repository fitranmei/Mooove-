package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/fitranmei/Mooove-/backend/repositories"
)

type BookingService struct {
	db               *gorm.DB
	bookingRepo      repositories.BookingRepo
	ketersediaanRepo repositories.KetersediaanRepo
}

func NewBookingService(db *gorm.DB, br repositories.BookingRepo, kr repositories.KetersediaanRepo) *BookingService {
	return &BookingService{db: db, bookingRepo: br, ketersediaanRepo: kr}
}

// CreateBookingWithReserve: buat booking + reserve kursi secara atomic
func (s *BookingService) CreateBookingWithReserve(ctx context.Context, userID *uint, scheduleID uint, seatIDs []uint, penumpangs []models.Penumpang, total int64) (*models.Booking, error) {
	if len(seatIDs) == 0 || len(seatIDs) != len(penumpangs) {
		return nil, errors.New("jumlah kursi dan penumpang tidak sesuai")
	}

	var booking models.Booking

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// buat booking
		booking = models.Booking{
			UserID:          userID,
			TrainScheduleID: scheduleID,
			Status:          "pending",
			TotalPrice:      total,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}
		if err := s.bookingRepo.Create(tx, &booking); err != nil {
			return err
		}

		// lock ketersediaan kursi
		inv, err := s.ketersediaanRepo.FindAndLockBySchedule(tx, scheduleID, seatIDs)
		if err != nil {
			return err
		}

		// cek semua available
		for _, r := range inv {
			if r.Status != "available" {
				return fmt.Errorf("kursi %d tidak tersedia", r.SeatID)
			}
		}

		// ambil id inventory dan mark reserved
		var invIDs []uint
		for _, r := range inv {
			invIDs = append(invIDs, r.ID)
		}
		if err := s.ketersediaanRepo.MarkReserved(tx, invIDs, booking.ID); err != nil {
			return err
		}

		// simpan penumpang
		now := time.Now()
		for i := range penumpangs {
			penumpangs[i].BookingID = booking.ID
			penumpangs[i].SeatID = seatIDs[i]
			penumpangs[i].CreatedAt = now
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
