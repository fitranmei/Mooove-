package db

import (
	"log"

	"github.com/fitranmei/Mooove-/backend/models"
	"gorm.io/gorm"
)

func RunMigrations(db *gorm.DB) {
	if err := db.AutoMigrate(
		&models.User{},
	); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("Migration complete (User)")
}
