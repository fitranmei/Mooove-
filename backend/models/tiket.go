package models

import "time"

type Tiket struct {
	ID              uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	PemesananID     uint       `gorm:"index;not null" json:"pemesanan_id"`
	PenumpangID     uint       `gorm:"index;not null" json:"penumpang_id"`
	JadwalID        uint       `gorm:"index;not null" json:"jadwal_id"`
	KeretaID        uint       `json:"kereta_id"`
	StasiunAsalID   uint       `json:"stasiun_asal_id"`
	StasiunTujuanID uint       `json:"stasiun_tujuan_id"`
	GerbongID       *uint      `json:"gerbong_id"`
	KursiID         *uint      `json:"kursi_id"`
	Kelas           string     `gorm:"type:varchar(50)" json:"kelas"`
	Harga           int        `json:"harga_final"`
	NomorTiket      string     `gorm:"type:varchar(100);uniqueIndex" json:"nomor_tiket"`
	Status          string     `gorm:"type:varchar(30);index" json:"status"`
	QRCode          string     `gorm:"type:text" json:"qr_code"`
	DiterbitkanPada time.Time  `json:"diterbitkan_pada"`
	KadaluarsaPada  *time.Time `json:"kadaluarsa_pada"`
	CreatedAt       time.Time  `json:"dibuat_pada"`
	UpdatedAt       time.Time  `json:"diperbarui_pada"`
}

type TiketRepository interface {
	GetTiketByID(id uint) (*Tiket, error)
	GetTiketByNomorTiket(nomor string) (*Tiket, error)
	GetTiketByPemesananID(pemesananID uint) ([]Tiket, error)
	GetTiketByPenumpangID(penumpangID uint) ([]Tiket, error)
	GetTiketByJadwalID(jadwalID uint) ([]Tiket, error)
	GetAllTikets() ([]Tiket, error)
	CreateTiket(tiket *Tiket) error
	UpdateTiket(tiket *Tiket) error
	DeleteTiket(id uint) error
}
