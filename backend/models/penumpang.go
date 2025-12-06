package models

import "time"

type Penumpang struct {
	ID          uint   `gorm:"primaryKey"`
	BookingID   uint   `gorm:"index"`
	Nama        string `json:"nama"`
	NoIdentitas string `json:"no_identitas"` // KTP, SIM, Passport
	SeatID      uint   `json:"seat_id"`
	Kursi       Kursi  `gorm:"foreignKey:SeatID" json:"kursi"`
	NoTiket     string `json:"no_tiket"`
	QRPath      string `json:"qr_path"`
	CreatedAt   time.Time
}
