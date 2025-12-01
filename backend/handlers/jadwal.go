package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/fitranmei/Mooove-/backend/repositories"
	"github.com/gofiber/fiber/v2"
)

type HandlerJadwal struct {
	repo repositories.JadwalRepo
}

func NewHandlerJadwal(repo repositories.JadwalRepo) *HandlerJadwal {
	return &HandlerJadwal{repo: repo}
}

// GET /api/v1/jadwal
func (h *HandlerJadwal) ListSemua(c *fiber.Ctx) error {
	data, err := h.repo.ListSemua()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(data)
}

// GET /api/v1/jadwal/:id
func (h *HandlerJadwal) GetByID(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	data, err := h.repo.GetByID(uint(id))
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "jadwal tidak ditemukan"})
	}
	return c.JSON(data)
}

// POST /api/v1/jadwal
func (h *HandlerJadwal) Buat(c *fiber.Ctx) error {
	var req models.Jadwal
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if err := h.repo.Buat(&req); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(req)
}

// DELETE /api/v1/jadwal/:id
func (h *HandlerJadwal) Hapus(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	if err := h.repo.Hapus(uint(id)); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "jadwal dihapus"})
}

// GET /api/v1/jadwal/cari?asal=GMR&tujuan=BDG&tanggal=2025-12-10
func (h *HandlerJadwal) CariJadwal(c *fiber.Ctx) error {
	asal := c.Query("asal")
	tujuan := c.Query("tujuan")
	tglStr := c.Query("tanggal")

	if asal == "" || tujuan == "" || tglStr == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "parameter asal, tujuan, dan tanggal wajib diisi",
		})
	}

	tanggal, err := time.Parse("2006-01-02", tglStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "format tanggal harus YYYY-MM-DD",
		})
	}

	data, err := h.repo.CariJadwal(asal, tujuan, tanggal)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"jumlah": len(data),
		"data":   data,
	})
}
