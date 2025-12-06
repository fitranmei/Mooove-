package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/fitranmei/Mooove-/backend/config"
	"github.com/fitranmei/Mooove-/backend/db"
	"github.com/fitranmei/Mooove-/backend/handlers"
	"github.com/fitranmei/Mooove-/backend/repositories"
	"github.com/fitranmei/Mooove-/backend/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/midtrans/midtrans-go/snap"

	"github.com/joho/godotenv"
)

var snapClient snap.Client

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	cfg := config.Load()

	database := db.ConnectMySQL(cfg)

	db.RunMigrations(database)

	// Background job untuk auto-release reserved seat
	ctx, cancel := context.WithCancel(context.Background())
	services.StartReservedCleanup(ctx, database, 1*time.Minute)

	// ============================
	// Repositories
	// ============================
	repoStasiun := repositories.NewStasiunRepo(database)
	repoKereta := repositories.NewKeretaRepo(database)
	repoJadwal := repositories.NewJadwalRepo(database)
	repoGerbong := repositories.NewGerbongRepo(database)
	repoKursi := repositories.NewKursiRepo(database)

	authRepo := repositories.NewAuthRepo(database)
	bookingRepo := repositories.NewBookingRepo(database)
	ketersediaanRepo := repositories.NewKetersediaanRepo(database)
	paymentRepo := repositories.NewPaymentRepo(database)
	tiketRepo := repositories.NewTiketRepo(database)

	// ============================
	// Services
	// ============================
	authService := services.NewAuthServiceImpl(authRepo, cfg.JwtSecret, 24*time.Hour)

	// BookingService dipakai oleh PaymentService
	bookingService := services.NewBookingService(database, bookingRepo, ketersediaanRepo)

	// PaymentService menerima bookingService
	paymentService := services.NewPaymentService(cfg, paymentRepo, bookingService)

	// ============================
	// Init Handlers
	// ============================
	handlers.InitHandlers(
		repoStasiun,
		repoKereta,
		repoJadwal,
		bookingRepo,
		ketersediaanRepo,
		paymentRepo,
		repoGerbong,
		tiketRepo,
		authService,
		paymentService,
		database,
	)

	handlers.InitGerbongHandler(
		repoGerbong,
		repoKursi,
		database,
	)

	// ============================
	// Fiber setup
	// ============================
	app := fiber.New()
	app.Use(logger.New())

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)

	go func() {
		<-quit
		log.Println("shutting down...")
		cancel()
		_ = app.Shutdown()
	}()

	handlers.RegisterRoutes(app)

	addr := ":" + cfg.Port
	log.Printf("API server running on %s", addr)
	log.Fatal(app.Listen(addr))
}
