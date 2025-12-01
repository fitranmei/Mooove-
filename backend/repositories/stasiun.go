package repositories

import (
	"errors"

	"github.com/fitranmei/Mooove-/backend/models"
	"gorm.io/gorm"
)

type StasiunRepo interface {
	Buat(stasiun *models.Stasiun) error
	GetByID(id uint) (*models.Stasiun, error)
	GetByKode(kode string) (*models.Stasiun, error)
	ListSemua() ([]models.Stasiun, error)
	Update(stasiun *models.Stasiun) error
	Delete(id uint) error
}

type stasiunRepo struct {
	db *gorm.DB
}

func NewStasiunRepo(db *gorm.DB) StasiunRepo {
	return &stasiunRepo{db: db}
}

func (r *stasiunRepo) Buat(s *models.Stasiun) error {
	return r.db.Create(s).Error
}

func (r *stasiunRepo) GetByID(id uint) (*models.Stasiun, error) {
	var s models.Stasiun
	if err := r.db.First(&s, id).Error; err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *stasiunRepo) GetByKode(kode string) (*models.Stasiun, error) {
	var s models.Stasiun
	if err := r.db.Where("kode = ?", kode).First(&s).Error; err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *stasiunRepo) ListSemua() ([]models.Stasiun, error) {
	var list []models.Stasiun
	if err := r.db.Order("kode asc").Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *stasiunRepo) Update(s *models.Stasiun) error {
	// Pastikan stasiun ada
	var ex models.Stasiun
	if err := r.db.First(&ex, s.ID).Error; err != nil {
		return err
	}
	return r.db.Model(&ex).Updates(s).Error
}

func (r *stasiunRepo) Delete(id uint) error {
	res := r.db.Delete(&models.Stasiun{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("stasiun tidak ditemukan")
	}
	return nil
}
