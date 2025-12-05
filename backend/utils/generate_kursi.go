package utils

import (
	"fmt"

	"github.com/fitranmei/Mooove-/backend/models"
)

func GenerateListKursiMenggunakanKapasitas(gerbongID uint, kapasitas int) []models.Kursi {
	if kapasitas <= 0 {
		kapasitas = 64
	}
	cols := []rune{'A', 'B', 'C', 'D'}
	rows := kapasitas / len(cols)
	if kapasitas%len(cols) != 0 {
		rows++
	}

	var kursiList []models.Kursi
	counter := 0
	for r := 1; r <= rows; r++ {
		for _, col := range cols {
			counter++
			if counter > kapasitas {
				break
			}
			nomor := fmt.Sprintf("%d%c", r, col)
			kursiList = append(kursiList, models.Kursi{
				GerbongID:  gerbongID,
				NomorKursi: nomor,
			})
		}
	}
	return kursiList
}
