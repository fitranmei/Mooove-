package repositories

import (
	"time"

	"github.com/fitranmei/Mooove-/backend/models"
	"gorm.io/gorm"
)

// JadwalRepo menyediakan fungsi untuk mengelola jadwal dan pencarian jadwal
type JadwalRepo interface {
	Buat(j *models.Jadwal) error
	GetByID(id uint) (*models.Jadwal, error)
	Hapus(id uint) error
	CariJadwal(kodeAsal, kodeTujuan string, tanggal time.Time) ([]models.Jadwal, error)
	ListSemua() ([]models.Jadwal, error)
}

type jadwalRepo struct {
	db *gorm.DB
}

func NewJadwalRepo(db *gorm.DB) JadwalRepo {
	return &jadwalRepo{db: db}
}

func (r *jadwalRepo) Buat(j *models.Jadwal) error {
	return r.db.Create(j).Error
}

func (r *jadwalRepo) GetByID(id uint) (*models.Jadwal, error) {
	var j models.Jadwal
	if err := r.db.Preload("Kereta").Preload("Asal").Preload("Tujuan").First(&j, id).Error; err != nil {
		return nil, err
	}
	return &j, nil
}

func (r *jadwalRepo) Hapus(id uint) error {
	return r.db.Delete(&models.Jadwal{}, id).Error
}

func (r *jadwalRepo) ListSemua() ([]models.Jadwal, error) {
	var list []models.Jadwal
	if err := r.db.Preload("Kereta").Preload("Asal").Preload("Tujuan").
		Order("tanggal asc, waktu_berangkat asc").
		Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

// CariJadwal mencari jadwal berdasarkan kode stasiun asal & tujuan dan tanggal (YYYY-MM-DD)
// tanggal parameter hanya menggunakan bagian date; jam diabaikan.
func (r *jadwalRepo) CariJadwal(kodeAsal, kodeTujuan string, tanggal time.Time) ([]models.Jadwal, error) {
	var hasil []models.Jadwal
	dateStr := tanggal.Format("2006-01-02")

	// GORM joins: sesuaikan nama tabel jika kamu men-override TableName pada model
	err := r.db.
		Preload("Kereta").
		Preload("Asal").
		Preload("Tujuan").
		Joins("JOIN stasiuns AS s_asal ON s_asal.id = jadwals.asal_id").
		Joins("JOIN stasiuns AS s_tujuan ON s_tujuan.id = jadwals.tujuan_id").
		Where("s_asal.kode = ? AND s_tujuan.kode = ? AND DATE(jadwals.tanggal) = ?", kodeAsal, kodeTujuan, dateStr).
		Order("jadwals.waktu_berangkat asc").
		Find(&hasil).Error

	if err != nil {
		return nil, err
	}
	return hasil, nil
}
