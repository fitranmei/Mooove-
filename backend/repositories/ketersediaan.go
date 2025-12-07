package repositories

import (
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

	// Ambil semua data KetersediaanKursi untuk schedule tertentu
	GetBySchedule(scheduleID uint) ([]models.KetersediaanKursi, error)
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

	// Jika jumlah tidak sama, berarti ada yang belum ada record-nya (lazy init)
	if len(inv) != len(seatIDs) {
		existingMap := make(map[uint]bool)
		for _, item := range inv {
			existingMap[item.SeatID] = true
		}

		for _, sid := range seatIDs {
			if !existingMap[sid] {
				newInv := models.KetersediaanKursi{
					TrainScheduleID: scheduleID,
					SeatID:          sid,
					Status:          "available",
					UpdatedAt:       time.Now(),
				}
				if err := tx.Create(&newInv).Error; err != nil {
					return nil, err
				}
				inv = append(inv, newInv)
			}
		}
	}

	return inv, nil
}

func (r *ketersediaanRepo) MarkReserved(tx *gorm.DB, inventoryIDs []uint, bookingID uint) error {
	now := time.Now()
	reservedUntil := now.Add(10 * time.Second)

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
	// Hapus filter status='reserved' agar bisa release status='booked' juga
	res := tx.Model(&models.KetersediaanKursi{}).
		Where("reserved_by_booking = ?", bookingID).
		UpdateColumns(map[string]interface{}{
			"status":              "available",
			"reserved_by_booking": 0,
			"reserved_until":      gorm.Expr("NULL"),
			"updated_at":          now,
		})

	if res.Error != nil {
		return res.Error
	}
	return nil
} // GetBySchedule mengambil semua data ketersediaan untuk jadwal tertentu (tanpa locking)
func (r *ketersediaanRepo) GetBySchedule(scheduleID uint) ([]models.KetersediaanKursi, error) {
	var list []models.KetersediaanKursi
	if err := r.db.Where("train_schedule_id = ?", scheduleID).Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}
