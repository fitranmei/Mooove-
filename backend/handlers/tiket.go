package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/fitranmei/Mooove-/backend/models"
)

type TiketRepoInterface interface {
	GetByID(id uint) (*models.Tiket, error)
	GetByBookingID(bookingID uint) ([]models.Tiket, error)
	GetByUserID(userID uint) ([]models.Tiket, error)
}

type TiketHandler struct {
	db   *gorm.DB
	repo TiketRepoInterface
}

func NewTiketHandler(db *gorm.DB, repo TiketRepoInterface) *TiketHandler {
	return &TiketHandler{
		db:   db,
		repo: repo,
	}
}

func (h *TiketHandler) GetTiketByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	idUint, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id tiket tidak valid",
		})
	}
	id := uint(idUint)

	t, err := h.repo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "tiket tidak ditemukan"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if v := c.Locals("user_id"); v != nil {
		uid, ok := v.(uint)
		if ok {
			var booking models.Booking
			if err := h.db.First(&booking, t.BookingID).Error; err == nil {
				if booking.UserID != nil && *booking.UserID != uid {
					return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
						"error": "tidak berhak mengakses tiket ini",
					})
				}
			}
		}
	}

	return c.JSON(t)
}

func (h *TiketHandler) GetTiketByBooking(c *fiber.Ctx) error {
	idStr := c.Params("id")
	idUint, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id booking tidak valid",
		})
	}
	bookingID := uint(idUint)

	v := c.Locals("user_id")
	if v == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "user tidak terautentikasi"})
	}
	uid, ok := v.(uint)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membaca user id"})
	}

	var booking models.Booking
	if err := h.db.First(&booking, bookingID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "booking tidak ditemukan",
		})
	}

	if booking.UserID != nil && *booking.UserID != uid {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "tidak berhak mengakses tiket booking ini",
		})
	}

	tickets, err := h.repo.GetByBookingID(bookingID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"booking_id": bookingID,
		"tiket":      tickets,
	})
}

func (h *TiketHandler) ListTiketUser(c *fiber.Ctx) error {
	v := c.Locals("user_id")
	if v == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "user tidak terautentikasi"})
	}
	uid, ok := v.(uint)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membaca user id"})
	}

	tickets, err := h.repo.GetByUserID(uid)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"user_id": uid,
		"tiket":   tickets,
	})
}
