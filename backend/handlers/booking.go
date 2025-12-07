package handlers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/fitranmei/Mooove-/backend/models"
)

type CreateBookingRequest struct {
	ScheduleID uint               `json:"schedule_id"`
	SeatIDs    []uint             `json:"seat_ids"`
	Penumpangs []models.Penumpang `json:"penumpangs"`
	TotalHarga int64              `json:"total_harga"`
}

func NewHandlerBooking(repoBooking BookingRepoInterface, repoKetersediaan KetersediaanRepoInterface, db *gorm.DB) *BookingHandler {
	return &BookingHandler{}
}

type BookingHandler struct{}

func (h *BookingHandler) CreateBooking(c *fiber.Ctx) error {
	var req CreateBookingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "body tidak valid", "detail": err.Error()})
	}

	if len(req.SeatIDs) == 0 || len(req.SeatIDs) != len(req.Penumpangs) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "jumlah seat dan penumpang harus sama dan >0"})
	}

	var userID *uint = nil
	if v := c.Locals("user_id"); v != nil {
		if uid, ok := v.(uint); ok {
			userID = &uid
		}
	}

	var booking models.Booking

	err := dbConn.Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		booking = models.Booking{
			UserID:          userID,
			TrainScheduleID: req.ScheduleID,
			Status:          "pending",
			TotalPrice:      req.TotalHarga,
			CreatedAt:       now,
			UpdatedAt:       now,
		}

		if err := repoBooking.Create(tx, &booking); err != nil {
			return err
		}

		inventories, err := repoKetersediaan.FindAndLockBySchedule(tx, req.ScheduleID, req.SeatIDs)
		if err != nil {
			return err
		}

		for _, inv := range inventories {
			if inv.Status != "available" {
				return fmt.Errorf("kursi %d tidak tersedia", inv.SeatID)
			}
		}

		var invIDs []uint
		for _, inv := range inventories {
			invIDs = append(invIDs, inv.ID)
		}
		if err := repoKetersediaan.MarkReserved(tx, invIDs, booking.ID); err != nil {
			return err
		}

		now2 := time.Now()
		for i := range req.Penumpangs {
			p := &req.Penumpangs[i]
			p.BookingID = booking.ID
			p.SeatID = req.SeatIDs[i]
			p.CreatedAt = now2
			if err := tx.Create(p).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	var reservedRows []models.KetersediaanKursi
	if err := dbConn.
		Where("reserved_by_booking = ?", booking.ID).
		Find(&reservedRows).Error; err != nil {
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"booking_id": booking.ID,
			"status":     booking.Status,
			"warning":    "gagal ambil reserved_until",
		})
	}

	seatReserved := make([]map[string]interface{}, 0, len(reservedRows))
	for _, r := range reservedRows {
		var ru string
		if r.ReservedUntil != nil {
			ru = r.ReservedUntil.Format(time.RFC3339)
		} else {
			ru = ""
		}
		seatReserved = append(seatReserved, map[string]interface{}{
			"seat_id":        r.SeatID,
			"reserved_until": ru,
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"booking_id":     booking.ID,
		"status":         booking.Status,
		"reserved_seats": seatReserved,
	})
}

func (h *BookingHandler) GetBookingByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id booking tidak valid"})
	}

	b, err := repoBooking.GetByID(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "booking tidak ditemukan"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if v := c.Locals("user_id"); v != nil {
		if uid, ok := v.(uint); ok {
			if b.UserID != nil && *b.UserID != uid {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "tidak berhak mengakses booking ini"})
			}
		}
	}

	return c.JSON(b)
}

func (h *BookingHandler) ListBookingsForUser(c *fiber.Ctx) error {
	v := c.Locals("user_id")
	if v == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "user tidak terautentikasi"})
	}
	uid, ok := v.(uint)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membaca user dari context"})
	}

	var bookings []models.Booking
	if err := dbConn.Preload("Penumpangs").
		Preload("Penumpangs.Kursi").
		Preload("Penumpangs.Kursi.Gerbong").
		Preload("TrainSchedule").
		Preload("TrainSchedule.Kereta").
		Preload("TrainSchedule.Asal").
		Preload("TrainSchedule.Tujuan").
		Where("user_id = ?", uid).
		Find(&bookings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(bookings)
}

func (h *BookingHandler) CreatePaymentForBookingPlaceholder(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id booking tidak valid"})
	}
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"message": "payment belum diimplementasikan", "booking_id": id})
}

func (h *BookingHandler) PaymentWebhook(c *fiber.Ctx) error {
	var payload map[string]interface{}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":  "payload tidak valid",
			"detail": err.Error(),
		})
	}

	err := paymentSvc.HandleWebhook(c.Context(), payload)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

func (h *BookingHandler) DeleteBooking(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id64, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id booking tidak valid"})
	}
	bookingID := uint(id64)

	booking, err := repoBooking.GetByID(bookingID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "booking tidak ditemukan"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	v := c.Locals("user_id")
	if v == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "user tidak terautentikasi"})
	}
	uid, ok := v.(uint)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membaca user dari context"})
	}

	if booking.UserID != nil && *booking.UserID != uid {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "tidak berhak membatalkan booking ini"})
	}

	err = dbConn.Transaction(func(tx *gorm.DB) error {
		if err := repoKetersediaan.ReleaseByBooking(tx, bookingID); err != nil {
			return err
		}

		booking.Status = "cancelled"
		booking.UpdatedAt = time.Now()
		if err := repoBooking.SimpanUpdate(tx, booking); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membatalkan booking", "detail": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"booking_id": bookingID,
		"status":     "cancelled",
	})
}

func (h *BookingHandler) CreatePaymentForBooking(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id booking tidak valid",
		})
	}
	bookingID := uint(id)

	booking, err := repoBooking.GetByID(bookingID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "booking tidak ditemukan",
		})
	}

	if v := c.Locals("user_id"); v != nil {
		uid, ok := v.(uint)
		if ok && booking.UserID != nil && *booking.UserID != uid {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "anda tidak berhak membayar booking ini",
			})
		}
	}

	result, err := paymentSvc.CreatePayment(c.Context(), bookingID, booking.TotalPrice)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"booking_id":   bookingID,
		"snap_token":   result["token"],
		"redirect_url": result["redirect_url"],
		"order_id":     result["order_id"],
	})
}

func (h *BookingHandler) MarkBookingPaid(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id booking tidak valid"})
	}
	bookingID := uint(id)

	booking, err := repoBooking.GetByID(bookingID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "booking tidak ditemukan"})
	}

	booking.Status = "paid"
	booking.UpdatedAt = time.Now()

	err = dbConn.Transaction(func(tx *gorm.DB) error {
		if err := repoBooking.SimpanUpdate(tx, booking); err != nil {
			return err
		}

		if err := tx.Model(&models.KetersediaanKursi{}).
			Where("reserved_by_booking = ?", bookingID).
			Updates(map[string]interface{}{
				"status":     "booked",
				"updated_at": time.Now(),
			}).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "booking paid successfully", "booking_id": bookingID})
}
