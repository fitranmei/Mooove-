package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/fitranmei/Mooove-/backend/config"
	"github.com/fitranmei/Mooove-/backend/db"
	"github.com/fitranmei/Mooove-/backend/handlers"
	"github.com/fitranmei/Mooove-/backend/repositories"
	"github.com/fitranmei/Mooove-/backend/services"
)

func main() {
	cfg := config.Load()

	database := db.ConnectMySQL(cfg)

	db.RunMigrations(database)

	ctx, cancel := context.WithCancel(context.Background())
	services.StartReservedCleanup(ctx, database, 1*time.Minute)

	// Inisialisasi repositori
	repoStasiun := repositories.NewStasiunRepo(database)
	repoKereta := repositories.NewKeretaRepo(database)
	repoJadwal := repositories.NewJadwalRepo(database)
	authRepo := repositories.NewAuthRepo(database)
	authService := services.NewAuthServiceImpl(authRepo, cfg.JwtSecret, time.Hour*24)
	gerbongRepo := repositories.NewGerbongRepo(database)
	kursiRepo := repositories.NewKursiRepo(database)
	bookingRepo := repositories.NewBookingRepo(database)
	ketersediaanRepo := repositories.NewKetersediaanRepo(database)

	handlers.InitHandlers(
		repoStasiun,
		repoKereta,
		repoJadwal,
		ketersediaanRepo,
		bookingRepo,
		authService,
		database,
	)

	handlers.InitGerbongHandler(
		gerbongRepo,
		kursiRepo,
		database,
	)

	app := fiber.New()
	app.Use(logger.New())

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	go func() {
		<-quit
		log.Println("shutting down...")
		// hentikan background job
		cancel()
		// beri waktu untuk shutdown server (opsional)
		_ = app.Shutdown()
	}()

	handlers.RegisterRoutes(app)

	addr := ":" + cfg.Port
	log.Printf("API server running on %s", addr)
	log.Fatal(app.Listen(addr))
}
