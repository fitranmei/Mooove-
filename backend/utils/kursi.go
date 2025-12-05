package utils

import (
	"fmt"

	"github.com/fitranmei/Mooove-/backend/models"
	"gorm.io/gorm"
)

func GenerateKursiUntukGerbong(db *gorm.DB, gerbong *models.Gerbong) error {
	capacity := gerbong.KapasitasKursi
	if capacity <= 0 {
		capacity = 64
	}

	cols := []rune{'A', 'B', 'C', 'D'}
	rows := capacity / len(cols)
	if capacity%len(cols) != 0 {
		rows++
	}

	var kursiList []models.Kursi
	counter := 0

	for r := 1; r <= rows; r++ {
		for _, col := range cols {
			counter++
			if counter > capacity {
				break
			}
			nomor := fmt.Sprintf("%d%c", r, col)
			kursiList = append(kursiList, models.Kursi{
				GerbongID:  gerbong.ID,
				NomorKursi: nomor,
			})
		}
	}

	return db.Create(&kursiList).Error
}
