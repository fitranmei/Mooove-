package handlers

import (
	"strconv"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/fitranmei/Mooove-/backend/repositories"
	"github.com/gofiber/fiber/v2"
)

type TiketHandler struct {
	repo repositories.TiketRepository
}

func NewTiketHandler(repo repositories.TiketRepository) *TiketHandler {
	return &TiketHandler{repo: repo}
}

// RegisterRoutes registers tiket-related routes
func (h *TiketHandler) RegisterRoutes(r fiber.Router) {
	r.Post("/", h.CreateTiket)
	r.Get("/", h.GetAllTiket)
	r.Get("/:id", h.GetTiketByID)
	r.Get("/nomor/:nomor", h.GetTiketByNomorTiket)
	r.Get("/pemesanan/:id", h.GetTiketByPemesananID)
	r.Get("/penumpang/:id", h.GetTiketByPenumpangID)
	r.Get("/jadwal/:id", h.GetTiketByJadwalID)
	r.Put("/:id", h.UpdateTiket)
	r.Delete("/:id", h.DeleteTiket)
}

// CreateTiket POST /tiket
func (h *TiketHandler) CreateTiket(c *fiber.Ctx) error {
	ctx := c.UserContext()
	var req models.Tiket

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "body tidak valid: " + err.Error()})
	}

	// Bisa tambahkan validasi tambahan di sini (mis: cek required fields)
	if req.PemesananID == 0 || req.PenumpangID == 0 || req.JadwalID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "pemesanan_id, penumpang_id, dan jadwal_id wajib diisi"})
	}

	if err := h.repo.CreateTiket(ctx, &req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(req)
}

// GetAllTiket GET /tiket
func (h *TiketHandler) GetAllTiket(c *fiber.Ctx) error {
	ctx := c.UserContext()
	tikets, err := h.repo.GetAllTiket(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(tikets)
}

// GetTiketByID GET /tiket/:id
func (h *TiketHandler) GetTiketByID(c *fiber.Ctx) error {
	ctx := c.UserContext()
	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id tidak valid"})
	}

	tiket, err := h.repo.GetTiketByID(ctx, uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if tiket == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "tiket tidak ditemukan"})
	}
	return c.JSON(tiket)
}

// GetTiketByNomorTiket GET /tiket/nomor/:nomor
func (h *TiketHandler) GetTiketByNomorTiket(c *fiber.Ctx) error {
	ctx := c.UserContext()
	nomor := c.Params("nomor")
	if nomor == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "nomor tiket diperlukan"})
	}
	tiket, err := h.repo.GetTiketByNomorTiket(ctx, nomor)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if tiket == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "tiket tidak ditemukan"})
	}
	return c.JSON(tiket)
}

// GetTiketByPemesananID GET /tiket/pemesanan/:id
func (h *TiketHandler) GetTiketByPemesananID(c *fiber.Ctx) error {
	ctx := c.UserContext()
	idParam := c.Params("id")
	pid, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id pemesanan tidak valid"})
	}
	tikets, err := h.repo.GetTiketByPemesananID(ctx, uint(pid))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(tikets)
}

// GetTiketByPenumpangID GET /tiket/penumpang/:id
func (h *TiketHandler) GetTiketByPenumpangID(c *fiber.Ctx) error {
	ctx := c.UserContext()
	idParam := c.Params("id")
	pid, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id penumpang tidak valid"})
	}
	tikets, err := h.repo.GetTiketByPenumpangID(ctx, uint(pid))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(tikets)
}

// GetTiketByJadwalID GET /tiket/jadwal/:id
func (h *TiketHandler) GetTiketByJadwalID(c *fiber.Ctx) error {
	ctx := c.UserContext()
	idParam := c.Params("id")
	jid, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id jadwal tidak valid"})
	}
	tikets, err := h.repo.GetTiketByJadwalID(ctx, uint(jid))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(tikets)
}

// UpdateTiket PUT /tiket/:id
func (h *TiketHandler) UpdateTiket(c *fiber.Ctx) error {
	ctx := c.UserContext()
	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id tidak valid"})
	}

	var req models.Tiket
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "body tidak valid: " + err.Error()})
	}

	// pastikan ID di request sesuai param
	req.ID = uint(id)

	// cek exist
	existing, err := h.repo.GetTiketByID(ctx, uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if existing == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "tiket tidak ditemukan"})
	}

	// optional: salin field yang boleh diupdate agar tidak mengoverwrite field sensitif
	// di sini kita simpan langsung seluruh req (sesuaikan jika mau batasi field)
	if err := h.repo.UpdateTiket(ctx, &req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(req)
}

// DeleteTiket DELETE /tiket/:id
func (h *TiketHandler) DeleteTiket(c *fiber.Ctx) error {
	ctx := c.UserContext()
	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id tidak valid"})
	}

	// cek exist
	existing, err := h.repo.GetTiketByID(ctx, uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if existing == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "tiket tidak ditemukan"})
	}

	if err := h.repo.DeleteTiket(ctx, uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusNoContent)
}
