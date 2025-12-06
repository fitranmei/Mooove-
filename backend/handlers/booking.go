package handlers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/fitranmei/Mooove-/backend/models"
)

// CreateBookingRequest: payload untuk membuat booking
type CreateBookingRequest struct {
	ScheduleID uint               `json:"schedule_id"`
	SeatIDs    []uint             `json:"seat_ids"`
	Penumpangs []models.Penumpang `json:"penumpangs"`
	TotalHarga int64              `json:"total_harga"`
}

func NewHandlerBooking(repoBooking BookingRepoInterface, repoKetersediaan KetersediaanRepoInterface, db *gorm.DB) *BookingHandler {
	return &BookingHandler{}
}

// BookingHandler struct (tidak menyimpan repo karena kita pake global vars)
type BookingHandler struct{}

// Mengembalikan reserved_until aktual setelah commit
func (h *BookingHandler) CreateBooking(c *fiber.Ctx) error {
	var req CreateBookingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "body tidak valid", "detail": err.Error()})
	}

	if len(req.SeatIDs) == 0 || len(req.SeatIDs) != len(req.Penumpangs) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "jumlah seat dan penumpang harus sama dan >0"})
	}

	// ambil user id dari middleware jika ada (middleware harus menyimpan uint di c.Locals("user_id"))
	var userID *uint = nil
	if v := c.Locals("user_id"); v != nil {
		if uid, ok := v.(uint); ok {
			userID = &uid
		}
	}

	var booking models.Booking

	// Transaction atomic
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

		// buat booking
		if err := repoBooking.Create(tx, &booking); err != nil {
			return err
		}

		// ambil & lock ketersediaan kursi
		inventories, err := repoKetersediaan.FindAndLockBySchedule(tx, req.ScheduleID, req.SeatIDs)
		if err != nil {
			return err
		}

		// cek available
		for _, inv := range inventories {
			if inv.Status != "available" {
				return fmt.Errorf("kursi %d tidak tersedia", inv.SeatID)
			}
		}

		// mark reserved (repository harus set reserved_until = now + 1 jam)
		var invIDs []uint
		for _, inv := range inventories {
			invIDs = append(invIDs, inv.ID)
		}
		if err := repoKetersediaan.MarkReserved(tx, invIDs, booking.ID); err != nil {
			return err
		}

		// simpan penumpang
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

	// Query berdasarkan reserved_by_booking = booking.ID
	var reservedRows []models.KetersediaanKursi
	if err := dbConn.
		Where("reserved_by_booking = ?", booking.ID).
		Find(&reservedRows).Error; err != nil {
		// meskipun query gagal, booking sudah dibuat; kembalikan booking id dan info minimal
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"booking_id": booking.ID,
			"status":     booking.Status,
			"warning":    "gagal ambil reserved_until",
		})
	}

	// siapkan map seat_id -> reserved_until (ISO8601) dan juga ambil earliest reserved_until
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

	// return response lengkap
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"booking_id":     booking.ID,
		"status":         booking.Status,
		"reserved_seats": seatReserved,
	})
}

// GetBookingByID: ambil detail booking (preload penumpang)
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

	// proteksi: jika ada user di context, periksa kepemilikan
	if v := c.Locals("user_id"); v != nil {
		if uid, ok := v.(uint); ok {
			if b.UserID != nil && *b.UserID != uid {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "tidak berhak mengakses booking ini"})
			}
		}
	}

	return c.JSON(b)
}

// ListBookingsForUser: ambil booking milik user yang login (menggunakan dbConn global)
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
	if err := dbConn.Preload("Penumpangs").Where("user_id = ?", uid).Find(&bookings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(bookings)
}

// CreatePaymentForBookingPlaceholder: placeholder (sesuaikan nanti dengan PaymentService)
func (h *BookingHandler) CreatePaymentForBookingPlaceholder(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id booking tidak valid"})
	}
	// TODO: implementasi payment service
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"message": "payment belum diimplementasikan", "booking_id": id})
}

// PaymentWebhook: placeholder webhook handler
// PaymentWebhook menerima notifikasi dari Midtrans
func (h *BookingHandler) PaymentWebhook(c *fiber.Ctx) error {
	var payload map[string]interface{}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":  "payload tidak valid",
			"detail": err.Error(),
		})
	}

	// Proses webhook (verifikasi signature + update DB + finalisasi booking)
	err := paymentSvc.HandleWebhook(c.Context(), payload)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.SendStatus(fiber.StatusOK)
}

// DeleteBooking membatalkan booking dan me-release kursi yang di-reserve.
// Route: DELETE /bookings/:id  (recommended: protected by AuthProtected middleware)
func (h *BookingHandler) DeleteBooking(c *fiber.Ctx) error {
	// parsing id booking
	idStr := c.Params("id")
	id64, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id booking tidak valid"})
	}
	bookingID := uint(id64)

	// ambil booking
	booking, err := repoBooking.GetByID(bookingID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "booking tidak ditemukan"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// Ambil user dari context (middleware harus menaruh user_id)
	v := c.Locals("user_id")
	if v == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "user tidak terautentikasi"})
	}
	uid, ok := v.(uint)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membaca user dari context"})
	}

	// Cek kepemilikan: hanya pemilik booking boleh membatalkan
	if booking.UserID != nil && *booking.UserID != uid {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "tidak berhak membatalkan booking ini"})
	}

	// Mulai transaksi: release seats + update booking.status = 'cancelled'
	err = dbConn.Transaction(func(tx *gorm.DB) error {
		// 1) me-release ketersediaan kursi
		if err := repoKetersediaan.ReleaseByBooking(tx, bookingID); err != nil {
			return err
		}

		// 2) update booking status
		booking.Status = "cancelled"
		booking.UpdatedAt = time.Now()
		if err := repoBooking.SimpanUpdate(tx, booking); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		// rollback otomatis
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membatalkan booking", "detail": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"booking_id": bookingID,
		"status":     "cancelled",
	})
}

// CreatePaymentForBooking: inisiasi Midtrans Snap transaction
// CreatePaymentForBooking membuat transaksi Midtrans Snap.
func (h *BookingHandler) CreatePaymentForBooking(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id booking tidak valid",
		})
	}
	bookingID := uint(id)

	// Ambil booking dari DB
	booking, err := repoBooking.GetByID(bookingID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "booking tidak ditemukan",
		})
	}

	// Validasi kepemilikan booking
	if v := c.Locals("user_id"); v != nil {
		uid, ok := v.(uint)
		if ok && booking.UserID != nil && *booking.UserID != uid {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "anda tidak berhak membayar booking ini",
			})
		}
	}

	// Panggil Midtrans Snap
	result, err := paymentSvc.CreatePayment(c.Context(), bookingID, booking.TotalPrice)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Response: token & redirect_url ke mobile app
	return c.JSON(fiber.Map{
		"booking_id":   bookingID,
		"snap_token":   result["token"],
		"redirect_url": result["redirect_url"],
		"order_id":     result["order_id"],
	})
}
