package repositories

import (
        "strconv"
        "time"

        "github.com/fitranmei/Mooove-/backend/models"
        "gorm.io/gorm"
)

type JadwalRepo interface {
        Buat(j *models.Jadwal) (*models.Jadwal, error)
        GetByID(id uint) (*models.Jadwal, error)
        Hapus(id uint) error
        CariJadwal(asal, tujuan, tanggal string, kelas string) ([]models.Jadwal, error)
        ListSemua() ([]models.Jadwal, error)
}

type jadwalRepo struct {
        db *gorm.DB
}

func NewJadwalRepo(db *gorm.DB) JadwalRepo {
        return &jadwalRepo{db: db}
}

// Buat jadwal berdasarkan satu kelas
// Buat menyimpan jadwal baru, menginisialisasi ketersediaan kursi untuk kelas jadwal,
// lalu mengembalikan record lengkap (dengan preload relasi).
func (r *jadwalRepo) Buat(j *models.Jadwal) (*models.Jadwal, error) {
        // jalankan dalam satu transaksi agar jadwal + inventori konsisten
        err := r.db.Transaction(func(tx *gorm.DB) error {
                // 1) simpan jadwal
                if err := tx.Create(j).Error; err != nil {
                        return err
                }

                // 2) ambil semua kursi yang berada pada gerbong milik kereta dan kelas yg sama
                var kursiList []models.Kursi
                if err := tx.
                        Joins("JOIN gerbongs ON gerbongs.id = kursis.gerbong_id").
                        Where("gerbongs.kereta_id = ? AND gerbongs.kelas = ?", j.KeretaID, j.Kelas).
                        Find(&kursiList).Error; err != nil {
                        return err
                }

                // 3) buat entries KetersediaanKursi untuk tiap kursi
                if len(kursiList) > 0 {
                        now := time.Now()
                        inventories := make([]models.KetersediaanKursi, 0, len(kursiList))
                        for _, s := range kursiList {
                                inventories = append(inventories, models.KetersediaanKursi{
                                        TrainScheduleID:   j.ID,
                                        SeatID:            s.ID,
                                        Status:            "available",
                                        ReservedByBooking: 0,
                                        ReservedUntil:     nil,
                                        UpdatedAt:         now,
                                })
                        }
                        // batch insert
                        if err := tx.Create(&inventories).Error; err != nil {
                                return err
                        }
                }

                return nil
        })

        if err != nil {
                return nil, err
        }

        // 4) reload jadwal lengkap (dengan Kereta.Gerbongs, Asal, Tujuan)
        var out models.Jadwal
        if err := r.db.
                Preload("Kereta.Gerbongs").
                Preload("Asal").
                Preload("Tujuan").
                First(&out, j.ID).Error; err != nil {
                return nil, err
        }
        return &out, nil
}

func (r *jadwalRepo) GetByID(id uint) (*models.Jadwal, error) {
        var j models.Jadwal
        if err := r.db.
                Preload("Kereta.Gerbongs").
                Preload("Asal").
                Preload("Tujuan").
                First(&j, id).Error; err != nil {
                return nil, err
        }
        return &j, nil
}

func (r *jadwalRepo) Hapus(id uint) error {
        return r.db.Delete(&models.Jadwal{}, id).Error
}

func (r *jadwalRepo) ListSemua() ([]models.Jadwal, error) {
        var list []models.Jadwal
        if err := r.db.
                Preload("Kereta.Gerbongs").
                Preload("Asal").
                Preload("Tujuan").
                Order("tanggal asc, waktu_berangkat asc").
                Find(&list).Error; err != nil {
                return nil, err
        }
        return list, nil
}

// Cari jadwal berdasarkan asal, tujuan, tanggal, dan kelas
func (r *jadwalRepo) CariJadwal(asal, tujuan, tanggal string, kelas string) ([]models.Jadwal, error) {
        var result []models.Jadwal

        q := r.db.
                Preload("Kereta.Gerbongs").
                Preload("Asal").
                Preload("Tujuan").
                Where("tanggal = ?", tanggal)

        if kelas != "" {
                q = q.Where("kelas = ?", kelas)
        }

        // Handle Asal (ID or Name)
        if asal != "" {
                if _, err := strconv.Atoi(asal); err == nil {
                        q = q.Where("asal_id = ?", asal)
                } else {
                        // Look up station by name or code
                        var stasiun models.Stasiun
                        if err := r.db.Where("nama = ? OR kode = ?", asal, asal).First(&stasiun).Error; err == nil {
                                q = q.Where("asal_id = ?", stasiun.ID)
                        } else {
                                // Station not found, return empty
                                return []models.Jadwal{}, nil
                        }
                }
        }

        // Handle Tujuan (ID or Name)
        if tujuan != "" {
                if _, err := strconv.Atoi(tujuan); err == nil {
                        q = q.Where("tujuan_id = ?", tujuan)
                } else {
                        var stasiun models.Stasiun
                        if err := r.db.Where("nama = ? OR kode = ?", tujuan, tujuan).First(&stasiun).Error; err == nil {
                                q = q.Where("tujuan_id = ?", stasiun.ID)
                        } else {
                                return []models.Jadwal{}, nil
                        }
                }
        }

        if err := q.Order("waktu_berangkat asc").Find(&result).Error; err != nil {
                return nil, err
        }

        return result, nil
}
