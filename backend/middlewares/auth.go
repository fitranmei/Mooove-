package middlewares

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

func AuthProtected(db *gorm.DB) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		authHeader := ctx.Get("Authorization")
		if strings.TrimSpace(authHeader) == "" {
			log.Warnf("empty authorization header")
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "fail",
				"message": "Unauthorized",
			})
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			log.Warnf("invalid token parts")
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "fail",
				"message": "Unauthorized",
			})
		}

		tokenStr := parts[1]

		secret := []byte(os.Getenv("JWT_SECRET"))
		if len(secret) == 0 {
			log.Errorf("JWT_SECRET is not set in environment")
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":  "error",
				"message": "server misconfiguration",
			})
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return secret, nil
		})
		if err != nil {
			log.Warnf("invalid token: %v", err)
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "fail",
				"message": "Unauthorized",
			})
		}
		if !token.Valid {
			log.Warnf("token not valid")
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "fail",
				"message": "Unauthorized",
			})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Warnf("invalid token claims type")
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "fail",
				"message": "Unauthorized",
			})
		}

		var userId interface{}
		if sub, exists := claims["sub"]; exists {
			userId = sub
		} else if idc, exists := claims["id"]; exists {
			userId = idc
		} else {
			log.Warnf("no user id in token claims")
			return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "fail",
				"message": "Unauthorized",
			})
		}

		var user models.User
		if err := db.First(&user, userId).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				log.Warnf("user not found in db: %v", userId)
				return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"status":  "fail",
					"message": "Unauthorized",
				})
			}
			log.Errorf("db error while fetching user: %v", err)
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":  "error",
				"message": "server error",
			})
		}

		ctx.Locals("user_id", user.ID)
		ctx.Locals("user_email", user.Email)
		ctx.Locals("user_fullname", user.Fullname)

		return ctx.Next()
	}
}
