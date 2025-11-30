package db

import (
	"log"

	"github.com/fitranmei/Mooove-/backend/config"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func ConnectMySQL(cfg *config.Config) *gorm.DB {
	db, err := gorm.Open(mysql.Open(cfg.DSN), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect DB:", err)
	}
	return db
}
