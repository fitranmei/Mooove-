package handlers

import (
	"context"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	authSvc models.AuthService
}

func NewAuthHandler(svc models.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: svc}
}

type registerReq struct {
	Fullname string `json:"fullname"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var body registerReq
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}
	creds := &models.AuthCredentials{Email: body.Email, Password: body.Password}
	token, user, err := h.authSvc.Register(context.Background(), creds)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"token": token, "user": user})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var body loginReq
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}
	creds := &models.AuthCredentials{Email: body.Email, Password: body.Password}
	token, user, err := h.authSvc.Login(context.Background(), creds)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"token": token, "user": user})
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	fullname := c.Locals("user_fullname")
	email := c.Locals("user_email")

	if fullname == nil || email == nil {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}

	return c.JSON(fiber.Map{
		"fullname": fullname,
		"email":    email,
	})
}
