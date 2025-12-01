package handlers

import (
	"net/http"
	"strconv"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/fitranmei/Mooove-/backend/repositories"
	"github.com/gofiber/fiber/v2"
)

type HandlerStasiun struct {
	repo repositories.StasiunRepo
}

func NewHandlerStasiun(repo repositories.StasiunRepo) *HandlerStasiun {
	return &HandlerStasiun{repo: repo}
}

// GET /api/v1/stasiun
func (h *HandlerStasiun) ListSemua(c *fiber.Ctx) error {
	data, err := h.repo.ListSemua()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(data)
}

// GET /api/v1/stasiun/:id
func (h *HandlerStasiun) GetByID(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	data, err := h.repo.GetByID(uint(id))
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "stasiun tidak ditemukan"})
	}
	return c.JSON(data)
}

// POST /api/v1/stasiun
func (h *HandlerStasiun) Buat(c *fiber.Ctx) error {
	var req models.Stasiun
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if err := h.repo.Buat(&req); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(req)
}

// PUT /api/v1/stasiun/:id
func (h *HandlerStasiun) Update(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var req models.Stasiun
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	req.ID = uint(id)
	if err := h.repo.Update(&req); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(req)
}

// DELETE /api/v1/stasiun/:id
func (h *HandlerStasiun) Hapus(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	if err := h.repo.Delete(uint(id)); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "stasiun dihapus"})
}
