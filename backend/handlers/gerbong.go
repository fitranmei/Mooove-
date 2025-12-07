package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/fitranmei/Mooove-/backend/repositories"
	"github.com/fitranmei/Mooove-/backend/utils"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var (
	gerbongRepoGlobal repositories.GerbongRepo
	kursiRepoGlobal   repositories.KursiRepo
	dbGlobal          *gorm.DB
)

func InitGerbongHandler(gerbongRepo repositories.GerbongRepo, kursiRepo repositories.KursiRepo, db *gorm.DB) {
	gerbongRepoGlobal = gerbongRepo
	kursiRepoGlobal = kursiRepo
	dbGlobal = db
}

type HandlerGerbong struct {
	gerbongRepo repositories.GerbongRepo
	kursiRepo   repositories.KursiRepo
	db          *gorm.DB
}

func NewHandlerGerbong() *HandlerGerbong {
	return &HandlerGerbong{
		gerbongRepo: gerbongRepoGlobal,
		kursiRepo:   kursiRepoGlobal,
		db:          dbGlobal,
	}
}

type buatGerbongReq struct {
	KeretaID       uint   `json:"kereta_id"`
	NomorGerbong   int    `json:"nomor_gerbong"`
	Kelas          string `json:"kelas"`
	KapasitasKursi int    `json:"kapasitas_kursi"`
	GenerateKursi  bool   `json:"generate_kursi"`
}

type updateGerbongReq struct {
	NomorGerbong   *int    `json:"nomor_gerbong,omitempty"`
	Kelas          *string `json:"kelas,omitempty"`
	KapasitasKursi *int    `json:"kapasitas_kursi,omitempty"`
}

func (h *HandlerGerbong) ListSemuaGerbong(c *fiber.Ctx) error {
	list, err := h.gerbongRepo.ListSemua()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *HandlerGerbong) GetGerbongByID(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	id := uint(id64)
	g, err := h.gerbongRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "gerbong tidak ditemukan"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(g)
}

func (h *HandlerGerbong) BuatGerbong(c *fiber.Ctx) error {
	var req buatGerbongReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "payload tidak valid"})
	}

	kap := req.KapasitasKursi
	if kap <= 0 {
		kap = 64
	}

	gerbong := &models.Gerbong{
		KeretaID:       req.KeretaID,
		NomorGerbong:   req.NomorGerbong,
		Kelas:          req.Kelas,
		KapasitasKursi: kap,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(gerbong).Error; err != nil {
			return err
		}

		kursiList := utils.GenerateListKursiMenggunakanKapasitas(gerbong.ID, gerbong.KapasitasKursi)
		if len(kursiList) == 0 {
			return nil
		}

		if err := tx.Create(&kursiList).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membuat gerbong: " + err.Error()})
	}

	g, _ := h.gerbongRepo.GetByID(gerbong.ID)
	return c.Status(http.StatusCreated).JSON(g)
}

func (h *HandlerGerbong) UpdateGerbong(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	id := uint(id64)

	var req updateGerbongReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "payload tidak valid"})
	}

	existing, err := h.gerbongRepo.GetByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "gerbong tidak ditemukan"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if req.NomorGerbong != nil {
		existing.NomorGerbong = *req.NomorGerbong
	}
	if req.Kelas != nil {
		existing.Kelas = *req.Kelas
	}
	if req.KapasitasKursi != nil {
		existing.KapasitasKursi = *req.KapasitasKursi
	}

	existing.UpdatedAt = time.Now()

	if err := h.gerbongRepo.Update(existing); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(existing)
}

func (h *HandlerGerbong) HapusGerbong(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	id := uint(id64)

	_ = h.kursiRepo.DeleteByGerbong(id)

	if err := h.gerbongRepo.Delete(id); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "gerbong dihapus"})
}

func (h *HandlerGerbong) ListKursiByGerbong(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	gerbongID := uint(id64)

	kursis, err := h.kursiRepo.ListByGerbong(gerbongID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(kursis)
}
