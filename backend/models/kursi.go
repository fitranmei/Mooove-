package models

import "time"

type Kursi struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	GerbongID  uint      `json:"gerbong_id"`
	Gerbong    Gerbong   `gorm:"foreignKey:GerbongID" json:"gerbong"`
	NomorKursi string    `gorm:"size:10;index" json:"nomor_kursi"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
