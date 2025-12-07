package models

import "time"

type KetersediaanKursi struct {
	ID                uint   `gorm:"primaryKey"`
	TrainScheduleID   uint   `gorm:"index:idx_schedule_seat,unique"`
	SeatID            uint   `gorm:"index:idx_schedule_seat,unique"`
	Status            string `gorm:"type:enum('available','reserved','booked');default:'available'"`
	ReservedByBooking uint   `gorm:"default:0"`
	ReservedUntil     *time.Time
	UpdatedAt         time.Time
}
