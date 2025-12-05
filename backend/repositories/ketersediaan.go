package repositories

import (
	"errors"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/fitranmei/Mooove-/backend/models"
)

type KetersediaanRepo interface {
	// Ambil dan kunci baris KetersediaanKursi untuk seatIDs pada schedule tertentu (harus dipanggil di dalam tx)
	FindAndLockBySchedule(tx *gorm.DB, scheduleID uint, seatIDs []uint) ([]models.KetersediaanKursi, error)

	// Tandai ketersediaan sebagai reserved (menggunakan tx)
	MarkReserved(tx *gorm.DB, inventoryIDs []uint, bookingID uint) error

	// Melepaskan semua ketersediaan kursi yang di-reserved oleh booking tertentu
	ReleaseByBooking(tx *gorm.DB, bookingID uint) error
}

type ketersediaanRepo struct {
	db *gorm.DB
}

func NewKetersediaanRepo(db *gorm.DB) KetersediaanRepo {
	return &ketersediaanRepo{db: db}
}

func (r *ketersediaanRepo) FindAndLockBySchedule(tx *gorm.DB, scheduleID uint, seatIDs []uint) ([]models.KetersediaanKursi, error) {
	var inv []models.KetersediaanKursi
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("train_schedule_id = ? AND seat_id IN ?", scheduleID, seatIDs).
		Find(&inv).Error; err != nil {
		return nil, err
	}
	if len(inv) != len(seatIDs) {
		return nil, errors.New("beberapa kursi tidak ditemukan di inventory")
	}
	return inv, nil
}

func (r *ketersediaanRepo) MarkReserved(tx *gorm.DB, inventoryIDs []uint, bookingID uint) error {
	now := time.Now()
	reservedUntil := now.Add(1 * time.Hour)

	return tx.Model(&models.KetersediaanKursi{}).
		Where("id IN ?", inventoryIDs).
		Updates(map[string]interface{}{
			"status":              "reserved",
			"reserved_by_booking": bookingID,
			"reserved_until":      &reservedUntil,
			"updated_at":          now,
		}).Error
}

// ReleaseByBooking: melepaskan semua ketersediaan kursi yang di-reserved oleh booking tertentu
// Men-set status='available', reserved_by_booking=0, reserved_until=NULL, updated_at = now
func (r *ketersediaanRepo) ReleaseByBooking(tx *gorm.DB, bookingID uint) error {
	now := time.Now()
	res := tx.Model(&models.KetersediaanKursi{}).
		Where("reserved_by_booking = ? AND status = ?", bookingID, "reserved").
		UpdateColumns(map[string]interface{}{
			"status":              "available",
			"reserved_by_booking": 0,
			"reserved_until":      gorm.Expr("NULL"),
			"updated_at":          now,
		})
	return res.Error
}
