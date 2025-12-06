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

// CreateBookingWithReserve: buat booking + reserve kursi secara atomic
func (s *BookingService) CreateBookingWithReserve(ctx context.Context, userID *uint, scheduleID uint, seatIDs []uint, penumpangs []models.Penumpang, total int64) (*models.Booking, error) {
	if len(seatIDs) == 0 || len(seatIDs) != len(penumpangs) {
		return nil, fmt.Errorf("jumlah kursi dan penumpang tidak sesuai")
	}

	var booking models.Booking

	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// buat booking
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

		// ambil id inventory dan mark reserved (repository harus set reserved_until = now + 1 jam)
		var invIDs []uint
		for _, r := range inv {
			invIDs = append(invIDs, r.ID)
		}
		if err := s.ketersediaanRepo.MarkReserved(tx, invIDs, booking.ID); err != nil {
			return err
		}

		// simpan penumpang (pakai tx)
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

// CompleteBookingAndIssueTickets: dipanggil setelah payment sukses (settlement/capture)
// - ubah kursi reserved -> booked
// - buat tiket untuk tiap penumpang (NoTiket di-generate)
// - update booking -> paid
func (s *BookingService) CompleteBookingAndIssueTickets(ctx context.Context, bookingID uint) error {
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// ambil booking
		booking, err := s.bookingRepo.GetByID(bookingID)
		if err != nil {
			return err
		}

		// bila sudah paid -> idempotent
		if booking.Status == "paid" {
			return nil
		}

		now := time.Now()

		// ubah ketersediaan kursi reserved -> booked (biarkan reserved_by_booking untuk rekam jejak)
		if err := tx.Model(&models.KetersediaanKursi{}).
			Where("reserved_by_booking = ? AND status = ?", bookingID, "reserved").
			Updates(map[string]interface{}{
				"status":         "booked",
				"reserved_until": nil,
				"updated_at":     now,
			}).Error; err != nil {
			return err
		}

		// ambil penumpang yg terkait booking
		var penumpangs []models.Penumpang
		if err := tx.Where("booking_id = ?", bookingID).Find(&penumpangs).Error; err != nil {
			return err
		}

		// buat tiket untuk tiap penumpang
		for i, p := range penumpangs {
			// generate nomor tiket sederhana, bisa disesuaikan
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

			// simpan record dulu agar punya ID
			if err := tx.Create(&tiket).Error; err != nil {
				return err
			}

			// tentukan path file QR
			// contoh: storage/qr/tiket_12_3.png (booking 12, tiket id 3)
			qrFile := filepath.Join("storage", "qr", fmt.Sprintf("tiket_%d_%d.png", bookingID, tiket.ID))

			// text QR bisa hanya nomor tiket, atau token yang di-sign
			qrText := tiket.NoTiket

			// generate QR PNG
			if err := utils.GenerateQR(qrText, qrFile); err != nil {
				return err
			}

			// update path QR ke DB
			tiket.QRPath = qrFile
			if err := tx.Save(&tiket).Error; err != nil {
				return err
			}

			// simpan NoTiket juga ke tabel Penumpang jika kamu ingin agar penumpang punya referensi
			if err := tx.Model(&models.Penumpang{}).
				Where("id = ?", p.ID).
				Updates(map[string]interface{}{"no_tiket": noTiket}).Error; err != nil {
				return err
			}
		}

		// update status booking -> paid
		booking.Status = "paid"
		booking.UpdatedAt = now
		if err := s.bookingRepo.SimpanUpdate(tx, booking); err != nil {
			return err
		}

		return nil
	})
}

// ReleaseBookingReservation: melepaskan semua reservasi untuk booking (dipanggil saat payment expired/cancel)
func (s *BookingService) ReleaseBookingReservation(ctx context.Context, bookingID uint) error {
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// ambil booking
		booking, err := s.bookingRepo.GetByID(bookingID)
		if err != nil {
			return err
		}

		// idempotent: kalau sudah cancelled/do nothing
		if booking.Status == "cancelled" {
			return nil
		}

		// ubah ketersediaan kursi -> available
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

		// update booking -> cancelled
		booking.Status = "cancelled"
		booking.UpdatedAt = time.Now()
		if err := s.bookingRepo.SimpanUpdate(tx, booking); err != nil {
			return err
		}

		return nil
	})
}
