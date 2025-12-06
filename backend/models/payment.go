package models

import "time"

type Payment struct {
	ID                uint `gorm:"primaryKey"`
	BookingID         uint
	Amount            int64
	Status            string `gorm:"type:enum('created','pending','paid','failed');default:'created'"`
	Provider          string
	ProviderPaymentID string `gorm:"uniqueIndex"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
