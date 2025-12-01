package repositories

import (
	"errors"

	"github.com/fitranmei/Mooove-/backend/models"
	"gorm.io/gorm"
)

// KeretaRepo menyediakan operasi CRUD untuk tabel kereta
type KeretaRepo interface {
	Buat(k *models.Kereta) error
	GetByID(id uint) (*models.Kereta, error)
	ListSemua() ([]models.Kereta, error)
	Update(k *models.Kereta) error
	Delete(id uint) error
}

type keretaRepo struct {
	db *gorm.DB
}

func NewKeretaRepo(db *gorm.DB) KeretaRepo {
	return &keretaRepo{db: db}
}

func (r *keretaRepo) Buat(k *models.Kereta) error {
	return r.db.Create(k).Error
}

func (r *keretaRepo) GetByID(id uint) (*models.Kereta, error) {
	var k models.Kereta
	if err := r.db.First(&k, id).Error; err != nil {
		return nil, err
	}
	return &k, nil
}

func (r *keretaRepo) ListSemua() ([]models.Kereta, error) {
	var list []models.Kereta
	if err := r.db.Order("id asc").Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *keretaRepo) Update(k *models.Kereta) error {
	var ex models.Kereta
	if err := r.db.First(&ex, k.ID).Error; err != nil {
		return err
	}
	return r.db.Model(&ex).Updates(k).Error
}

func (r *keretaRepo) Delete(id uint) error {
	res := r.db.Delete(&models.Kereta{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("kereta tidak ditemukan")
	}
	return nil
}
