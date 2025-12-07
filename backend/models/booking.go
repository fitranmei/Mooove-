package models

import "time"

type Booking struct {
	ID              uint `gorm:"primaryKey"`
	UserID          *uint
	TrainScheduleID uint
	TrainSchedule   Jadwal `gorm:"foreignKey:TrainScheduleID"`
	Status          string `gorm:"type:enum('pending','paid','cancelled','expired');default:'pending'"`
	TotalPrice      int64
	Penumpangs      []Penumpang `gorm:"foreignKey:BookingID"`
	ReservedUntil   *time.Time  `json:"reserved_until" gorm:"-"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
}
