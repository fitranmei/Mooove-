package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/fitranmei/Mooove-/backend/config"
	"github.com/fitranmei/Mooove-/backend/db"
	"github.com/fitranmei/Mooove-/backend/handlers"
)

func main() {
	cfg := config.Load()

	database := db.ConnectMySQL(cfg)

	db.RunMigrations(database)

	// fiber instance
	app := fiber.New()
	app.Use(logger.New())

	handlers.RegisterRoutes(app)

	addr := ":" + cfg.Port
	log.Printf("API server running on %s", addr)
	log.Fatal(app.Listen(addr))
}
