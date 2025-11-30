package repositories

import (
	"context"
	"errors"

	"github.com/fitranmei/Mooove-/backend/models"
	"gorm.io/gorm"
)

type TiketRepository interface {
	CreateTiket(ctx context.Context, tiket *models.Tiket) error
	GetTiketByID(ctx context.Context, id uint) (*models.Tiket, error)
	GetTiketByNomorTiket(ctx context.Context, nomor string) (*models.Tiket, error)
	GetTiketByPemesananID(ctx context.Context, pemesananID uint) ([]models.Tiket, error)
	GetTiketByPenumpangID(ctx context.Context, penumpangID uint) ([]models.Tiket, error)
	GetTiketByJadwalID(ctx context.Context, jadwalID uint) ([]models.Tiket, error)
	GetAllTiket(ctx context.Context) ([]models.Tiket, error)
	UpdateTiket(ctx context.Context, tiket *models.Tiket) error
	DeleteTiket(ctx context.Context, id uint) error
}

type tiketRepository struct {
	db *gorm.DB
}

func NewTiketRepository(db *gorm.DB) TiketRepository {
	return &tiketRepository{db: db}
}

// ----------------------------------------------
// CREATE
// ----------------------------------------------
func (r *tiketRepository) CreateTiket(ctx context.Context, tiket *models.Tiket) error {
	return r.db.WithContext(ctx).Create(tiket).Error
}

// ----------------------------------------------
// GET Tiket by ID
// ----------------------------------------------
func (r *tiketRepository) GetTiketByID(ctx context.Context, id uint) (*models.Tiket, error) {
	var tiket models.Tiket
	result := r.db.WithContext(ctx).First(&tiket, id)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &tiket, result.Error
}

// ----------------------------------------------
// GET Tiket by Nomor Tiket
// ----------------------------------------------
func (r *tiketRepository) GetTiketByNomorTiket(ctx context.Context, nomor string) (*models.Tiket, error) {
	var tiket models.Tiket
	result := r.db.WithContext(ctx).Where("nomor_tiket = ?", nomor).First(&tiket)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &tiket, result.Error
}

// ----------------------------------------------
// GET Tiket by PemesananID (1 Book = banyak tiket)
// ----------------------------------------------
func (r *tiketRepository) GetTiketByPemesananID(ctx context.Context, pemesananID uint) ([]models.Tiket, error) {
	var tikets []models.Tiket
	err := r.db.WithContext(ctx).Where("pemesanan_id = ?", pemesananID).Find(&tikets).Error
	return tikets, err
}

// ----------------------------------------------
// GET Tiket by PenumpangID
// ----------------------------------------------
func (r *tiketRepository) GetTiketByPenumpangID(ctx context.Context, penumpangID uint) ([]models.Tiket, error) {
	var tikets []models.Tiket
	err := r.db.WithContext(ctx).Where("penumpang_id = ?", penumpangID).Find(&tikets).Error
	return tikets, err
}

// ----------------------------------------------
// GET Tiket by JadwalID
// ----------------------------------------------
func (r *tiketRepository) GetTiketByJadwalID(ctx context.Context, jadwalID uint) ([]models.Tiket, error) {
	var tikets []models.Tiket
	err := r.db.WithContext(ctx).Where("jadwal_id = ?", jadwalID).Find(&tikets).Error
	return tikets, err
}

// ----------------------------------------------
// GET All Tiket
// ----------------------------------------------
func (r *tiketRepository) GetAllTiket(ctx context.Context) ([]models.Tiket, error) {
	var tikets []models.Tiket
	err := r.db.WithContext(ctx).Find(&tikets).Error
	return tikets, err
}

// ----------------------------------------------
// UPDATE Tiket
// ----------------------------------------------
func (r *tiketRepository) UpdateTiket(ctx context.Context, tiket *models.Tiket) error {
	return r.db.WithContext(ctx).Save(tiket).Error
}

// ----------------------------------------------
// DELETE Tiket
// ----------------------------------------------
func (r *tiketRepository) DeleteTiket(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Tiket{}, id).Error
}
