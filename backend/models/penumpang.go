package models

import "time"

type Penumpang struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	PemesananID    uint      `json:"pemesanan_id" gorm:"index;not null"`
	Nama           string    `json:"nama" gorm:"type:varchar(150);not null"`
	NomorIdentitas string    `json:"nomor_identitas" gorm:"type:varchar(100);not null"` // KTP / NIK / Paspor
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
