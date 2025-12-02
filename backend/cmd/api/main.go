package main

import (
	"log"
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

	// Inisialisasi repositori
	repoStasiun := repositories.NewStasiunRepo(database)
	repoKereta := repositories.NewKeretaRepo(database)
	repoJadwal := repositories.NewJadwalRepo(database)

	// Auth repository + service
	authRepo := repositories.NewAuthRepo(database)
	authService := services.NewAuthServiceImpl(authRepo, cfg.JwtSecret, time.Hour*24)

	handlers.InitHandlers(repoStasiun, repoKereta, repoJadwal, authService)
	handlers.InitHandlers(repoStasiun, repoKereta, repoJadwal, authService)

	app := fiber.New()
	app.Use(logger.New())

	handlers.RegisterRoutes(app)

	addr := ":" + cfg.Port
	log.Printf("API server running on %s", addr)
	log.Fatal(app.Listen(addr))
}
