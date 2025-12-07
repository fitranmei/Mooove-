package services

import (
	"context"
	"log"
	"time"

	"gorm.io/gorm"

	"github.com/fitranmei/Mooove-/backend/models"
)

func StartReservedCleanup(ctx context.Context, db *gorm.DB, interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		defer ticker.Stop()
		log.Printf("[cleanup] reserved-cleaner started, interval=%v", interval)
		for {
			select {
			case <-ctx.Done():
				log.Println("[cleanup] reserved-cleaner stopped by context")
				return
			case <-ticker.C:
				cleanupOnce(db)
			}
		}
	}()
}

func cleanupOnce(db *gorm.DB) {
	now := time.Now()

	res := db.Model(&models.KetersediaanKursi{}).
		Where("status = ? AND reserved_until IS NOT NULL AND reserved_until < ?", "reserved", now).
		Updates(map[string]interface{}{
			"status":              "available",
			"reserved_by_booking": 0,
			"reserved_until":      gorm.Expr("NULL"),
			"updated_at":          now,
		})

	if res.Error != nil {
		log.Printf("[cleanup] gagal cleanup kursi: %v", res.Error)
		return
	}
	if res.RowsAffected > 0 {
		log.Printf("[cleanup] me-release %d kursi expired", res.RowsAffected)
	}

	var pendingBookings []models.Booking
	if err := db.Where("status = ?", "pending").Find(&pendingBookings).Error; err != nil {
		log.Printf("[cleanup] gagal mengambil booking pending: %v", err)
		return
	}

	for _, b := range pendingBookings {
		var countReserved int64
		err := db.Model(&models.KetersediaanKursi{}).
			Where("reserved_by_booking = ?", b.ID).
			Where("status = ?", "reserved").
			Count(&countReserved).Error

		if err != nil {
			log.Printf("[cleanup] gagal cek kursi booking %d: %v", b.ID, err)
			continue
		}

		if countReserved == 0 {
			err := db.Model(&models.Booking{}).
				Where("id = ? AND status = ?", b.ID, "pending").
				Updates(map[string]interface{}{
					"status":     "cancelled",
					"updated_at": now,
				}).Error

			if err != nil {
				log.Printf("[cleanup] gagal cancel booking %d: %v", b.ID, err)
				continue
			}

			log.Printf("[cleanup] booking %d otomatis dibatalkan (kursi expired)", b.ID)
		}
	}
}
