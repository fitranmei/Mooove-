package repositories

import (
	"gorm.io/gorm"

	"github.com/fitranmei/Mooove-/backend/models"
)

type TiketRepo struct {
	db *gorm.DB
}

type TiketRepoInterface interface {
	GetByID(id uint) (*models.Tiket, error)
	GetByBookingID(bookingID uint) ([]models.Tiket, error)
	GetByUserID(userID uint) ([]models.Tiket, error)
	Create(tx *gorm.DB, t *models.Tiket) error
}

func NewTiketRepo(db *gorm.DB) *TiketRepo {
	return &TiketRepo{db: db}
}

func (r *TiketRepo) Create(tx *gorm.DB, t *models.Tiket) error {
	if tx != nil {
		return tx.Create(t).Error
	}
	return r.db.Create(t).Error
}

func (r *TiketRepo) GetByID(id uint) (*models.Tiket, error) {
	var t models.Tiket
	err := r.db.First(&t, id).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TiketRepo) GetByBookingID(bookingID uint) ([]models.Tiket, error) {
	var t []models.Tiket
	err := r.db.Where("booking_id = ?", bookingID).Find(&t).Error
	return t, err
}

func (r *TiketRepo) GetByUserID(userID uint) ([]models.Tiket, error) {
	var t []models.Tiket
	/*
	   JOIN:
	   tiket -> booking -> user_id
	*/
	err := r.db.
		Joins("JOIN bookings ON bookings.id = tiket.booking_id").
		Where("bookings.user_id = ?", userID).
		Find(&t).Error

	return t, err
}
