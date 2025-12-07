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
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/midtrans/midtrans-go/snap"

	"github.com/joho/godotenv"
)

var snapClient snap.Client

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	cfg := config.Load()

	database := db.ConnectMySQL(cfg)

	db.RunMigrations(database)

	ctx, cancel := context.WithCancel(context.Background())
	services.StartReservedCleanup(ctx, database, 1*time.Minute)

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

	authService := services.NewAuthServiceImpl(authRepo, cfg.JwtSecret, 24*time.Hour)

	bookingService := services.NewBookingService(database, bookingRepo, ketersediaanRepo)

	paymentService := services.NewPaymentService(cfg, paymentRepo, bookingService)

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

	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

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
