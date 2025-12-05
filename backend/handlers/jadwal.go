package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/fitranmei/Mooove-/backend/repositories"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// HandlerJadwal menangani endpoint terkait jadwal
type HandlerJadwal struct {
	repo repositories.JadwalRepo
}

// NewHandlerJadwal membuat instance handler jadwal
func NewHandlerJadwal(repo repositories.JadwalRepo, db *gorm.DB) *HandlerJadwal {
	return &HandlerJadwal{repo: repo}
}

// Payload untuk membuat jadwal
type createJadwalPayload struct {
	KeretaID       uint   `json:"kereta_id"`
	AsalID         uint   `json:"asal_id"`
	TujuanID       uint   `json:"tujuan_id"`
	WaktuBerangkat string `json:"waktu_berangkat"` // contoh: "2025-12-10T19:45:00+07:00" atau "2025-12-10T19:45:00"
	WaktuTiba      string `json:"waktu_tiba"`
	Tanggal        string `json:"tanggal"` // "YYYY-MM-DD"
	Kelas          string `json:"kelas"`   // "eksekutif","bisnis","ekonomi"
	HargaDasar     int64  `json:"harga_dasar"`
}

// parseTimeFlexible mencoba beberapa layout umum untuk mengonversi string ke time.Time
func parseTimeFlexible(input string) (time.Time, error) {
	// RFC3339 (paling aman)
	if t, err := time.Parse(time.RFC3339, input); err == nil {
		return t, nil
	}
	// Tanpa offset: 2006-01-02T15:04:05
	if t, err := time.Parse("2006-01-02T15:04:05", input); err == nil {
		return t, nil
	}
	// Jika hanya tanggal diberikan, anggap jam midnight lokal
	if t, err := time.Parse("2006-01-02", input); err == nil {
		return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.Local), nil
	}
	return time.Time{}, fiber.ErrBadRequest
}

// =========================
// Handlers
// =========================

// ListSemua GET /api/v1/jadwal
func (h *HandlerJadwal) ListSemua(c *fiber.Ctx) error {
	list, err := h.repo.ListSemua()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

// GetByID GET /api/v1/jadwal/:id
func (h *HandlerJadwal) GetByID(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	id := uint(id64)

	j, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "jadwal tidak ditemukan"})
	}
	return c.JSON(j)
}

// Buat POST /api/v1/jadwal
// Menerima payload sesuai createJadwalPayload dan mengembalikan jadwal lengkap (dengan relasi Kereta/Asal/Tujuan/Gerbongs)
func (h *HandlerJadwal) Buat(c *fiber.Ctx) error {
	var payload createJadwalPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "payload tidak valid"})
	}

	// validasi sederhana
	if payload.KeretaID == 0 || payload.AsalID == 0 || payload.TujuanID == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "kereta_id, asal_id, dan tujuan_id wajib diisi"})
	}
	if payload.AsalID == payload.TujuanID {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "asal dan tujuan tidak boleh sama"})
	}
	if payload.Kelas == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "kelas wajib diisi (eksekutif/bisnis/ekonomi)"})
	}
	// validasi tanggal format YYYY-MM-DD (simpan sebagai string di model)
	if _, err := time.Parse("2006-01-02", payload.Tanggal); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "format tanggal harus YYYY-MM-DD"})
	}

	// parse waktu berangkat & tiba
	wb, err := parseTimeFlexible(payload.WaktuBerangkat)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "format waktu_berangkat tidak valid; gunakan RFC3339 atau 2006-01-02T15:04:05"})
	}
	wt, err := parseTimeFlexible(payload.WaktuTiba)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "format waktu_tiba tidak valid; gunakan RFC3339 atau 2006-01-02T15:04:05"})
	}

	jadwal := &models.Jadwal{
		KeretaID:       payload.KeretaID,
		AsalID:         payload.AsalID,
		TujuanID:       payload.TujuanID,
		WaktuBerangkat: wb,
		WaktuTiba:      wt,
		Tanggal:        payload.Tanggal, // simpan string tanggal
		Kelas:          payload.Kelas,
		Harga:          payload.HargaDasar,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	created, err := h.repo.Buat(jadwal)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// kembalikan jadwal lengkap (repo.Buat sudah melakukan preload relasi)
	return c.Status(http.StatusCreated).JSON(created)
}

// Hapus DELETE /api/v1/jadwal/:id
func (h *HandlerJadwal) Hapus(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	id := uint(id64)

	if err := h.repo.Hapus(id); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "jadwal dihapus"})
}

// CariJadwal GET /api/v1/jadwal/cari?asal=1&tujuan=2&tanggal=2025-12-10&kelas=eksekutif
func (h *HandlerJadwal) CariJadwal(c *fiber.Ctx) error {
	asal := c.Query("asal")       // bisa id (string) atau kosong
	tujuan := c.Query("tujuan")   // bisa id (string) atau kosong
	tanggal := c.Query("tanggal") // wajib, format YYYY-MM-DD
	kelas := c.Query("kelas")     // optional

	if tanggal == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "parameter tanggal wajib diisi (YYYY-MM-DD)"})
	}
	if _, err := time.Parse("2006-01-02", tanggal); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "format tanggal harus YYYY-MM-DD"})
	}

	results, err := h.repo.CariJadwal(asal, tujuan, tanggal, kelas)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{
		"count": len(results),
		"data":  results,
	})
}
