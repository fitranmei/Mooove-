package models

import "time"

type Tiket struct {
	ID          uint `gorm:"primaryKey" json:"id"`
	BookingID   uint `gorm:"index;not null" json:"booking_id"`
	PenumpangID uint `gorm:"index;not null" json:"penumpang_id"`
	SeatID      uint `gorm:"index;not null" json:"seat_id"`

	NoTiket string `gorm:"size:100;uniqueIndex;not null" json:"no_tiket"` // contoh: "T-123-001"
	QRPath  string `gorm:"size:255" json:"qr_path"`                       // path ke file QR (lokal atau S3)

	IssuedAt  *time.Time `json:"issued_at"` // kapan tiket di-issue (bisa null)
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}
