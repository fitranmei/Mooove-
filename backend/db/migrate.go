package db

import (
	"log"

	"github.com/fitranmei/Mooove-/models"
	"gorm.io/gorm"
)

func RunMigration(db *gorm.DB) {
	err := db.AutoMigrate(
		&models.User{},
	)
	if err != nil {
		log.Fatal("migration failed:", err)
	}
}
