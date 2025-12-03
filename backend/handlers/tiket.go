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

func (h *TiketHandler) CreateTiket(c *fiber.Ctx) error {
	ctx := c.UserContext()
	var req models.Tiket

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "body tidak valid: " + err.Error()})
	}

	if req.PemesananID == 0 || req.PenumpangID == 0 || req.JadwalID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "pemesanan_id, penumpang_id, dan jadwal_id wajib diisi"})
	}

	if err := h.repo.CreateTiket(ctx, &req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(req)
}

func (h *TiketHandler) GetAllTiket(c *fiber.Ctx) error {
	ctx := c.UserContext()
	tikets, err := h.repo.GetAllTiket(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(tikets)
}

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

	req.ID = uint(id)

	existing, err := h.repo.GetTiketByID(ctx, uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	if existing == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "tiket tidak ditemukan"})
	}

	if err := h.repo.UpdateTiket(ctx, &req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(req)
}

func (h *TiketHandler) DeleteTiket(c *fiber.Ctx) error {
	ctx := c.UserContext()
	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id tidak valid"})
	}

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
