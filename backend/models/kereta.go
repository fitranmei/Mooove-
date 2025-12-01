package models

import "time"

type Kereta struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Nama      string    `json:"nama"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
