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

type HandlerJadwal struct {
	repo             repositories.JadwalRepo
	gerbongRepo      repositories.GerbongRepo
	ketersediaanRepo repositories.KetersediaanRepo
}

func NewHandlerJadwal(repo repositories.JadwalRepo, gerbongRepo repositories.GerbongRepo, ketersediaanRepo repositories.KetersediaanRepo, db *gorm.DB) *HandlerJadwal {
	return &HandlerJadwal{
		repo:             repo,
		gerbongRepo:      gerbongRepo,
		ketersediaanRepo: ketersediaanRepo,
	}
}

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

func parseTimeFlexible(input string) (time.Time, error) {
	if t, err := time.Parse(time.RFC3339, input); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02T15:04:05", input); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02", input); err == nil {
		return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.Local), nil
	}
	return time.Time{}, fiber.ErrBadRequest
}

func (h *HandlerJadwal) ListSemua(c *fiber.Ctx) error {
	list, err := h.repo.ListSemua()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(list)
}

func (h *HandlerJadwal) GetByID(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	id := uint(id64)

	j, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "jadwal tidak ditemukan"})
	}
	return c.JSON(j)
}

func (h *HandlerJadwal) Buat(c *fiber.Ctx) error {
	var payload createJadwalPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "payload tidak valid"})
	}

	if payload.KeretaID == 0 || payload.AsalID == 0 || payload.TujuanID == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "kereta_id, asal_id, dan tujuan_id wajib diisi"})
	}
	if payload.AsalID == payload.TujuanID {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "asal dan tujuan tidak boleh sama"})
	}
	if payload.Kelas == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "kelas wajib diisi (eksekutif/bisnis/ekonomi)"})
	}
	if _, err := time.Parse("2006-01-02", payload.Tanggal); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "format tanggal harus YYYY-MM-DD"})
	}

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

	return c.Status(http.StatusCreated).JSON(created)
}

func (h *HandlerJadwal) Hapus(c *fiber.Ctx) error {
	id64, _ := strconv.ParseUint(c.Params("id"), 10, 64)
	id := uint(id64)

	if err := h.repo.Hapus(id); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "jadwal dihapus"})
}

func (h *HandlerJadwal) CariJadwal(c *fiber.Ctx) error {
	asal := c.Query("asal")
	tujuan := c.Query("tujuan")
	tanggal := c.Query("tanggal")
	kelas := c.Query("kelas")

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

func (h *HandlerJadwal) GetKursiByJadwal(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	jadwalID := uint(id)

	jadwal, err := h.repo.GetByID(jadwalID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "jadwal tidak ditemukan"})
	}

	gerbongs, err := h.gerbongRepo.ListByKeretaAndKelas(jadwal.KeretaID, jadwal.Kelas)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "gagal mengambil data gerbong"})
	}

	ketersediaan, err := h.ketersediaanRepo.GetBySchedule(jadwalID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "gagal mengambil data ketersediaan"})
	}

	statusMap := make(map[uint]string)
	for _, k := range ketersediaan {
		statusMap[k.SeatID] = k.Status
	}

	type SeatResp struct {
		ID         uint   `json:"id"`
		NomorKursi string `json:"nomor_kursi"`
		Status     string `json:"status"` // available, booked, reserved
	}

	type GerbongResp struct {
		ID           uint       `json:"id"`
		NomorGerbong int        `json:"nomor_gerbong"`
		Kelas        string     `json:"kelas"`
		Kursi        []SeatResp `json:"kursi"`
	}

	var gerbongResps []GerbongResp

	for _, g := range gerbongs {
		var seats []SeatResp
		for _, k := range g.Kursis {
			status := "available"
			if s, ok := statusMap[k.ID]; ok {
				status = s
			}
			seats = append(seats, SeatResp{
				ID:         k.ID,
				NomorKursi: k.NomorKursi,
				Status:     status,
			})
		}

		gerbongResps = append(gerbongResps, GerbongResp{
			ID:           g.ID,
			NomorGerbong: g.NomorGerbong,
			Kelas:        g.Kelas,
			Kursi:        seats,
		})
	}

	return c.JSON(fiber.Map{
		"jadwal_id": jadwalID,
		"kereta":    jadwal.Kereta,
		"gerbongs":  gerbongResps,
	})
}
