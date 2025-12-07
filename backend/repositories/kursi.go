package repositories

import (
	"errors"

	"github.com/fitranmei/Mooove-/backend/models"
	"gorm.io/gorm"
)

type KursiRepo interface {
	Buat(k *models.Kursi) error
	BuatBatch(kursis []models.Kursi) error
	GetByID(id uint) (*models.Kursi, error)
	GetByNomor(gerbongID uint, nomor string) (*models.Kursi, error)
	ListByGerbong(gerbongID uint) ([]models.Kursi, error)
	Delete(id uint) error
	DeleteByGerbong(gerbongID uint) error
	CountByGerbong(gerbongID uint) (int64, error)
}

type kursiRepo struct {
	db *gorm.DB
}

func NewKursiRepo(db *gorm.DB) KursiRepo {
	return &kursiRepo{db: db}
}

func (r *kursiRepo) Buat(k *models.Kursi) error {
	return r.db.Create(k).Error
}

func (r *kursiRepo) BuatBatch(kursis []models.Kursi) error {
	if len(kursis) == 0 {
		return nil
	}
	return r.db.Create(&kursis).Error
}

func (r *kursiRepo) GetByID(id uint) (*models.Kursi, error) {
	var k models.Kursi
	if err := r.db.First(&k, id).Error; err != nil {
		return nil, err
	}
	return &k, nil
}

func (r *kursiRepo) GetByNomor(gerbongID uint, nomor string) (*models.Kursi, error) {
	var k models.Kursi
	if err := r.db.Where("gerbong_id = ? AND nomor_kursi = ?", gerbongID, nomor).First(&k).Error; err != nil {
		return nil, err
	}
	return &k, nil
}

func (r *kursiRepo) ListByGerbong(gerbongID uint) ([]models.Kursi, error) {
	var list []models.Kursi
	if err := r.db.Where("gerbong_id = ?", gerbongID).Order("nomor_kursi asc").Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *kursiRepo) Delete(id uint) error {
	res := r.db.Delete(&models.Kursi{}, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("kursi tidak ditemukan")
	}
	return nil
}

func (r *kursiRepo) DeleteByGerbong(gerbongID uint) error {
	return r.db.Where("gerbong_id = ?", gerbongID).Delete(&models.Kursi{}).Error
}

func (r *kursiRepo) CountByGerbong(gerbongID uint) (int64, error) {
	var cnt int64
	if err := r.db.Model(&models.Kursi{}).Where("gerbong_id = ?", gerbongID).Count(&cnt).Error; err != nil {
		return 0, err
	}
	return cnt, nil
}
