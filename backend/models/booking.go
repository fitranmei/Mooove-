package models

import "time"

type Booking struct {
	ID              uint `gorm:"primaryKey"`
	UserID          *uint
	TrainScheduleID uint
	Status          string `gorm:"type:enum('pending','paid','cancelled','expired');default:'pending'"`
	TotalPrice      int64
	Penumpangs      []Penumpang `gorm:"foreignKey:BookingID"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
}
