package models

import "time"

type Gerbong struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	KeretaID       uint      `json:"kereta_id"`
	NomorGerbong   int       `json:"nomor_gerbong"`
	Kelas          string    `json:"kelas"` // eksekutif, bisnis, ekonomi
	KapasitasKursi int       `gorm:"default:64" json:"kapasitas_kursi"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	Kursis []Kursi `gorm:"foreignKey:GerbongID" json:"kursis,omitempty"`
}
