package models

import "time"

type Stasiun struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Kode      string    `gorm:"uniqueIndex;size:10" json:"kode"`
	Nama      string    `json:"nama"`
	Kota      string    `json:"kota"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
