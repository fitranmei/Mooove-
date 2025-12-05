package models

import "time"

type Jadwal struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	KeretaID       uint      `json:"kereta_id"`
	Kereta         Kereta    `gorm:"foreignKey:KeretaID" json:"kereta"`
	AsalID         uint      `json:"asal_id"`
	Asal           Stasiun   `gorm:"foreignKey:AsalID" json:"asal"`
	TujuanID       uint      `json:"tujuan_id"`
	Tujuan         Stasiun   `gorm:"foreignKey:TujuanID" json:"tujuan"`
	WaktuBerangkat time.Time `json:"waktu_berangkat"`
	WaktuTiba      time.Time `json:"waktu_tiba"`
	Tanggal        string    `json:"tanggal"`
	Kelas          string    `gorm:"size:32" json:"kelas"`
	Harga          int64     `json:"harga_dasar"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
