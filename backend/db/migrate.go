package db

import (
	"log"

	"github.com/fitranmei/Mooove-/backend/models"
	"gorm.io/gorm"
)

func RunMigrations(db *gorm.DB) {
	// Bersihkan data orphan (penumpang dengan seat_id tidak valid) sebelum migrasi
	// agar tidak error Foreign Key Constraint 1452
	if db.Migrator().HasTable("penumpangs") && db.Migrator().HasTable("kursis") {
		db.Exec("DELETE FROM penumpangs WHERE seat_id NOT IN (SELECT id FROM kursis)")
	}

	if err := db.AutoMigrate(
		&models.User{},
		&models.Stasiun{},
		&models.Kereta{},
		&models.Jadwal{},
		&models.Gerbong{},
		&models.Kursi{},
		&models.KetersediaanKursi{},
		&models.Booking{},
		&models.Penumpang{},
		&models.Payment{},
	); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("Migration complete (User)")
}
