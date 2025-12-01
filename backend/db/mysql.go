package db

import (
	"log"
	"time"

	"github.com/fitranmei/Mooove-/backend/config"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func ConnectMySQL(cfg *config.Config) *gorm.DB {
	db, err := gorm.Open(mysql.Open(cfg.DSN), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to mysql: %v", err)
	}

	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(50)
		sqlDB.SetConnMaxLifetime(30 * time.Minute)
	}

	log.Printf("Connected to MySQL with DSN: %s", cfg.DSN)
	return db
}
