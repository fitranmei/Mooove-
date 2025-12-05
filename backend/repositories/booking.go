package repositories

import (
	"gorm.io/gorm"

	"github.com/fitranmei/Mooove-/backend/models"
)

type BookingRepo interface {
	Create(tx *gorm.DB, b *models.Booking) error
	GetByID(id uint) (*models.Booking, error)
	SimpanUpdate(tx *gorm.DB, b *models.Booking) error
}

type bookingRepo struct {
	db *gorm.DB
}

func NewBookingRepo(db *gorm.DB) BookingRepo {
	return &bookingRepo{db: db}
}

func (r *bookingRepo) Create(tx *gorm.DB, b *models.Booking) error {
	return tx.Create(b).Error
}

func (r *bookingRepo) GetByID(id uint) (*models.Booking, error) {
	var b models.Booking
	if err := r.db.Preload("Penumpangs").First(&b, id).Error; err != nil {
		return nil, err
	}
	return &b, nil
}

// Tambahkan method Save untuk menyimpan perubahan booking di dalam tx
func (r *bookingRepo) SimpanUpdate(tx *gorm.DB, b *models.Booking) error {
	// jika tx != nil gunakan tx, kalau nil gunakan r.db
	if tx != nil {
		return tx.Save(b).Error
	}
	return r.db.Save(b).Error
}
