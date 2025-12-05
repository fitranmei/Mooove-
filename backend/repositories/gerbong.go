package repositories

import (
	"errors"

	"github.com/fitranmei/Mooove-/backend/models"
	"gorm.io/gorm"
)

type GerbongRepo interface {
	Buat(g *models.Gerbong) error
	GetByID(id uint) (*models.Gerbong, error)
	ListByKereta(keretaID uint) ([]models.Gerbong, error)
	ListSemua() ([]models.Gerbong, error)
	Update(g *models.Gerbong) error
	Delete(id uint) error
}

type gerbongRepo struct {
	db *gorm.DB
}

func NewGerbongRepo(db *gorm.DB) GerbongRepo {
	return &gerbongRepo{db: db}
}

func (r *gerbongRepo) Buat(g *models.Gerbong) error {
	return r.db.Create(g).Error
}

func (r *gerbongRepo) GetByID(id uint) (*models.Gerbong, error) {
	var g models.Gerbong
	if err := r.db.Preload("Kursis").First(&g, id).Error; err != nil {
		return nil, err
	}
	return &g, nil
}

// ListByKereta mengembalikan semua gerbong untuk kereta tertentu, diurutkan berdasarkan nomor gerbong
func (r *gerbongRepo) ListByKereta(keretaID uint) ([]models.Gerbong, error) {
	var list []models.Gerbong
	if err := r.db.Where("kereta_id = ?", keretaID).
		Order("nomor_gerbong asc").
		Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *gerbongRepo) ListSemua() ([]models.Gerbong, error) {
	var list []models.Gerbong
	if err := r.db.Preload("Kursis").Order("kereta_id asc, nomor_gerbong asc").Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *gerbongRepo) Update(g *models.Gerbong) error {
	var ex models.Gerbong
	if err := r.db.First(&ex, g.ID).Error; err != nil {
		return err
	}
	return r.db.Model(&ex).Updates(g).Error
}

func (r *gerbongRepo) Delete(id uint) error {
	res := r.db.Delete(&models.Gerbong{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("gerbong tidak ditemukan")
	}
	return nil
}
