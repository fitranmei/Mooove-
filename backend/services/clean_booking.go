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

// cleanupOnce melakukan 1 kali update: ubah status reserved -> available
// untuk semua baris yang reserved_until < NOW()
func cleanupOnce(db *gorm.DB) {
	result := db.Model(&models.KetersediaanKursi{}).
		Where("status = ? AND reserved_until IS NOT NULL AND reserved_until < ?", "reserved", time.Now()).
		Updates(map[string]interface{}{
			"status":              "available",
			"reserved_by_booking": 0,
			"reserved_until":      gorm.Expr("NULL"),
			"updated_at":          time.Now(),
		})

	if result.Error != nil {
		log.Printf("[cleanup] gagal menjalankan cleanup: %v", result.Error)
		return
	}

	if result.RowsAffected > 0 {
		log.Printf("[cleanup] reclaim %d kursi kadaluarsa", result.RowsAffected)
	}
}
