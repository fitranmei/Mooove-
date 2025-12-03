package handlers

import (
	"time"

	"github.com/fitranmei/Mooove-/backend/middlewares"
	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var (
	repoStasiun       StasiunRepoInterface
	repoKereta        KeretaRepoInterface
	repoJadwal        JadwalRepoInterface
	authServiceGlobal models.AuthService
	dbConn            *gorm.DB
)

type StasiunRepoInterface interface {
	ListSemua() ([]models.Stasiun, error)
	GetByID(id uint) (*models.Stasiun, error)
	GetByKode(kode string) (*models.Stasiun, error)
	Buat(s *models.Stasiun) error
	Update(s *models.Stasiun) error
	Delete(id uint) error
}

type KeretaRepoInterface interface {
	ListSemua() ([]models.Kereta, error)
	GetByID(id uint) (*models.Kereta, error)
	Buat(k *models.Kereta) error
	Update(k *models.Kereta) error
	Delete(id uint) error
}

type JadwalRepoInterface interface {
	ListSemua() ([]models.Jadwal, error)
	GetByID(id uint) (*models.Jadwal, error)
	Buat(j *models.Jadwal) error
	Hapus(id uint) error
	CariJadwal(asal, tujuan string, tanggal time.Time) ([]models.Jadwal, error)
}

func InitHandlers(
	stasiunRepo StasiunRepoInterface,
	keretaRepo KeretaRepoInterface,
	jadwalRepo JadwalRepoInterface,
	authSvc models.AuthService,
	db *gorm.DB,
) {
	repoStasiun = stasiunRepo
	repoKereta = keretaRepo
	repoJadwal = jadwalRepo
	authServiceGlobal = authSvc
	dbConn = db
}

func RegisterRoutes(app *fiber.App) {

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("API is running")
	})

	api := app.Group("/api/v1")

	// ================ AUTH ROUTES ===================
	authHandler := NewAuthHandler(authServiceGlobal)
	api.Post("/auth/register", authHandler.Register)
	api.Post("/auth/login", authHandler.Login)
	api.Get("/auth/me", middlewares.AuthProtected(dbConn), authHandler.Me)

	// ================ ROUTE STASIUN ==================
	stasiunHandler := NewHandlerStasiun(repoStasiun)
	api.Get("/stasiun", stasiunHandler.ListSemua)
	api.Get("/stasiun/:id", stasiunHandler.GetByID)
	api.Post("/stasiun", stasiunHandler.Buat)
	api.Put("/stasiun/:id", stasiunHandler.Update)
	api.Delete("/stasiun/:id", stasiunHandler.Hapus)

	// ================ ROUTE KERETA ===================
	keretaHandler := NewHandlerKereta(repoKereta)
	api.Get("/kereta", keretaHandler.ListSemua)
	api.Get("/kereta/:id", keretaHandler.GetByID)
	api.Post("/kereta", keretaHandler.Buat)
	api.Put("/kereta/:id", keretaHandler.Update)
	api.Delete("/kereta/:id", keretaHandler.Hapus)

	// ================ ROUTE JADWAL ===================
	jadwalHandler := NewHandlerJadwal(repoJadwal)
	api.Get("/jadwal", jadwalHandler.ListSemua)
	api.Get("/jadwal/:id", jadwalHandler.GetByID)
	api.Post("/jadwal", jadwalHandler.Buat)
	api.Delete("/jadwal/:id", jadwalHandler.Hapus)
	api.Get("/jadwal/cari", jadwalHandler.CariJadwal) // jadwal/cari?asal=GMR&tujuan=BDG&tanggal=2025-12-10
}
