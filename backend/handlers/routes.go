package handlers

import (
	"github.com/fitranmei/Mooove-/backend/middlewares"
	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var (
	repoStasiun       StasiunRepoInterface
	repoKereta        KeretaRepoInterface
	repoJadwal        JadwalRepoInterface
	repoKetersediaan  KetersediaanRepoInterface
	repoBooking       BookingRepoInterface
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
	Buat(j *models.Jadwal) (*models.Jadwal, error)
	Hapus(id uint) error
	CariJadwal(asal, tujuan, tanggal, kelas string) ([]models.Jadwal, error)
}

type KetersediaanRepoInterface interface {
	FindAndLockBySchedule(tx *gorm.DB, scheduleID uint, seatIDs []uint) ([]models.KetersediaanKursi, error)
	MarkReserved(tx *gorm.DB, inventoryIDs []uint, bookingID uint) error
	ReleaseByBooking(tx *gorm.DB, bookingID uint) error
}

type BookingRepoInterface interface {
	Create(tx *gorm.DB, b *models.Booking) error
	GetByID(id uint) (*models.Booking, error)
	SimpanUpdate(tx *gorm.DB, b *models.Booking) error
}

func InitHandlers(
	stasiunRepo StasiunRepoInterface,
	keretaRepo KeretaRepoInterface,
	jadwalRepo JadwalRepoInterface,
	ketersediaanRepo KetersediaanRepoInterface,
	bookingRepo BookingRepoInterface,
	authSvc models.AuthService,
	db *gorm.DB,
) {
	repoStasiun = stasiunRepo
	repoKereta = keretaRepo
	repoJadwal = jadwalRepo
	repoKetersediaan = ketersediaanRepo
	repoBooking = bookingRepo
	authServiceGlobal = authSvc
	dbConn = db
}

// RegisterRoutes mendaftarkan semua route API
func RegisterRoutes(app *fiber.App) {
	// health
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("API is running")
	})

	api := app.Group("/api/v1")

	// -----------------------
	// AUTH (publik & profile)
	// -----------------------
	authHandler := NewAuthHandler(authServiceGlobal)
	api.Post("/auth/register", authHandler.Register)
	api.Post("/auth/login", authHandler.Login)

	api.Get("/auth/me", middlewares.AuthProtected(dbConn), authHandler.Me)

	// -----------------------
	// STASIUN (public / admin)
	// -----------------------
	stasiunHandler := NewHandlerStasiun(repoStasiun)
	api.Get("/stasiun", stasiunHandler.ListSemua)
	api.Get("/stasiun/:id", stasiunHandler.GetByID)
	api.Post("/stasiun", stasiunHandler.Buat)
	api.Put("/stasiun/:id", stasiunHandler.Update)
	api.Delete("/stasiun/:id", stasiunHandler.Hapus)

	// -----------------------
	// KERETA (public / admin)
	// -----------------------
	keretaHandler := NewHandlerKereta(repoKereta)
	api.Get("/kereta", keretaHandler.ListSemua)
	api.Get("/kereta/:id", keretaHandler.GetByID)
	api.Post("/kereta", keretaHandler.Buat)
	api.Put("/kereta/:id", keretaHandler.Update)
	api.Delete("/kereta/:id", keretaHandler.Hapus)

	// -----------------------
	// JADWAL (publik)
	// -----------------------
	jadwalHandler := NewHandlerJadwal(repoJadwal, dbConn)
	api.Get("/jadwal", jadwalHandler.ListSemua)
	api.Get("/jadwal/:id", jadwalHandler.GetByID)
	api.Post("/jadwal", jadwalHandler.Buat)
	api.Delete("/jadwal/:id", jadwalHandler.Hapus)
	api.Get("/jadwal/cari", jadwalHandler.CariJadwal) // ?asal=GMR&tujuan=BDG&tanggal=YYYY-MM-DD

	// -----------------------
	// GERBONG & KURSI
	// -----------------------
	hGerbong := NewHandlerGerbong()
	api.Get("/gerbong", hGerbong.ListSemuaGerbong)
	api.Get("/gerbong/:id", hGerbong.GetGerbongByID)
	api.Post("/gerbong", hGerbong.BuatGerbong)
	api.Put("/gerbong/:id", hGerbong.UpdateGerbong)
	api.Delete("/gerbong/:id", hGerbong.HapusGerbong)
	api.Get("/gerbong/:id/kursi", hGerbong.ListKursiByGerbong)

	// -----------------------
	// BOOKING & PEMBAYARAN
	// -----------------------
	hBooking := NewHandlerBooking(repoBooking, repoKetersediaan, dbConn)
	api.Post("/bookings", middlewares.AuthProtected(dbConn), hBooking.CreateBooking)
	api.Get("/bookings/:id", middlewares.AuthProtected(dbConn), hBooking.GetBookingByID)
	api.Get("/user/bookings", middlewares.AuthProtected(dbConn), hBooking.ListBookingsForUser)
	api.Post("/bookings/:id/pay", middlewares.AuthProtected(dbConn), hBooking.CreatePaymentForBooking)
	api.Delete("/bookings/:id", middlewares.AuthProtected(dbConn), hBooking.DeleteBooking)

	// Webhook provider pembayaran (public, idempotent)
	api.Post("/payments/webhook", hBooking.PaymentWebhook)
}
