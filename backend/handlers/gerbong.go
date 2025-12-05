// handlers/handler_gerbong.go
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

// ===== variabel global yang akan di-init dari main.go lewat InitGerbongHandler =====
var (
	gerbongRepoGlobal repositories.GerbongRepo
	kursiRepoGlobal   repositories.KursiRepo
	dbGlobal          *gorm.DB
)

// InitGerbongHandler dipanggil sekali dari main.go untuk meng-inject dependency
func InitGerbongHandler(gerbongRepo repositories.GerbongRepo, kursiRepo repositories.KursiRepo, db *gorm.DB) {
	gerbongRepoGlobal = gerbongRepo
	kursiRepoGlobal = kursiRepo
	dbGlobal = db
}

// HandlerGerbong struct (bisa juga langsung menggunakan global, tapi dibungkus untuk testable)
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

// =========================
// Request/response structs
// =========================
type buatGerbongReq struct {
	KeretaID       uint   `json:"kereta_id"`
	NomorGerbong   int    `json:"nomor_gerbong"`
	Kelas          string `json:"kelas"`           // eksekutif|bisnis|ekonomi
	KapasitasKursi int    `json:"kapasitas_kursi"` // optional, default 64 jika 0
	// Jika ingin generate kursi otomatis saat buat, isikan true
	GenerateKursi bool `json:"generate_kursi"`
}

type updateGerbongReq struct {
	NomorGerbong   *int    `json:"nomor_gerbong,omitempty"`
	Kelas          *string `json:"kelas,omitempty"`
	KapasitasKursi *int    `json:"kapasitas_kursi,omitempty"`
}

// =========================
// Handlers
// =========================

// ListSemuaGerbong GET /api/v1/gerbong
func (h *HandlerGerbong) ListSemuaGerbong(c *fiber.Ctx) error {
	list, err := h.gerbongRepo.ListSemua()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

// GetGerbongByID GET /api/v1/gerbong/:id
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

// // BuatGerbong POST /api/v1/gerbong
// // Jika body.generate_kursi = true maka setelah gerbong dibuat, kursi akan digenerate otomatis sesuai kapasitas.
// func (h *HandlerGerbong) BuatGerbong(c *fiber.Ctx) error {
// 	var req buatGerbongReq
// 	if err := c.BodyParser(&req); err != nil {
// 		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "payload tidak valid"})
// 	}

// 	kap := req.KapasitasKursi
// 	if kap <= 0 {
// 		kap = 64 // default sesuai keputusan terbaru
// 	}

// 	gerbong := &models.Gerbong{
// 		KeretaID:       req.KeretaID,
// 		NomorGerbong:   req.NomorGerbong,
// 		Kelas:          req.Kelas,
// 		KapasitasKursi: kap,
// 		CreatedAt:      time.Now(),
// 		UpdatedAt:      time.Now(),
// 	}

// 	// simpan gerbong
// 	if err := h.gerbongRepo.Buat(gerbong); err != nil {
// 		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
// 	}

// 	// generate kursi bila diminta
// 	if req.GenerateKursi {
// 		if err := utils.GenerateKursiUntukGerbong(h.db, gerbong); err != nil {
// 			// rollback: hapus gerbong jika generate gagal (opsional)
// 			_ = h.gerbongRepo.Delete(gerbong.ID)
// 			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "gagal generate kursi: " + err.Error()})
// 		}
// 		// reload gerbong dengan kursi
// 		g, _ := h.gerbongRepo.GetByID(gerbong.ID)
// 		return c.Status(http.StatusCreated).JSON(g)
// 	}

// 	return c.Status(http.StatusCreated).JSON(gerbong)
// }
//

// BuatGerbong POST /api/v1/gerbong
// Secara otomatis membuat kursi sebanyak KapasitasKursi (default 64) dalam satu transaksi.
func (h *HandlerGerbong) BuatGerbong(c *fiber.Ctx) error {
	var req buatGerbongReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "payload tidak valid"})
	}

	kap := req.KapasitasKursi
	if kap <= 0 {
		kap = 64 // default
	}

	gerbong := &models.Gerbong{
		KeretaID:       req.KeretaID,
		NomorGerbong:   req.NomorGerbong,
		Kelas:          req.Kelas,
		KapasitasKursi: kap,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Transaksi: buat gerbong + insert batch kursi
	err := h.db.Transaction(func(tx *gorm.DB) error {
		// 1) simpan gerbong (menggunakan repo atau langsung tx)
		if err := tx.Create(gerbong).Error; err != nil {
			return err
		}

		// 2) generate list kursi (belum disimpan)
		kursiList := utils.GenerateListKursiMenggunakanKapasitas(gerbong.ID, gerbong.KapasitasKursi)
		if len(kursiList) == 0 {
			// tidak ada kursi untuk dibuat (jarang), tetap commit gerbong
			return nil
		}

		// 3) insert batch kursi
		// gunakan tx.Create untuk batch insert (efisien)
		if err := tx.Create(&kursiList).Error; err != nil {
			return err // transaksi akan rollback
		}

		return nil
	})

	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "gagal membuat gerbong: " + err.Error()})
	}

	// reload gerbong beserta kursi untuk response
	g, _ := h.gerbongRepo.GetByID(gerbong.ID)
	return c.Status(http.StatusCreated).JSON(g)
}

// UpdateGerbong PUT /api/v1/gerbong/:id
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

	// apply perubahan jika ada
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

// HapusGerbong DELETE /api/v1/gerbong/:id
func (h *HandlerGerbong) HapusGerbong(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	id := uint(id64)

	// sebelum hapus, hapus kursi jika ada (opsional)
	_ = h.kursiRepo.DeleteByGerbong(id)

	if err := h.gerbongRepo.Delete(id); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "gerbong dihapus"})
}

// ListKursiByGerbong GET /api/v1/gerbong/:id/kursi
func (h *HandlerGerbong) ListKursiByGerbong(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	gerbongID := uint(id64)

	kursis, err := h.kursiRepo.ListByGerbong(gerbongID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(kursis)
}
