package handlers

import (
	"github.com/fitranmei/Mooove-/backend/services"
	"github.com/gofiber/fiber/v2"
)

// PaymentHandler meng-handle endpoint pembayaran (Midtrans Snap)
type PaymentHandler struct {
	paymentService *services.PaymentService
}

// NewPaymentHandler inisialisasi handler
func NewPaymentHandler(paymentSvc *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{
		paymentService: paymentSvc,
	}
}

// createPayReq request body untuk membuat payment
type createPayReq struct {
	Amount   int64  `json:"amount"`
	Provider string `json:"provider"` // "midtrans"
	Name     string `json:"name"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
}

// CreatePayment endpoint: POST /api/v1/bookings/:id/pay
// Menghasilkan snap token & redirect URL
func (h *PaymentHandler) CreatePayment(c *fiber.Ctx) error {
	var req struct {
		BookingID uint  `json:"booking_id"`
		Amount    int64 `json:"amount"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "payload tidak valid",
		})
	}

	resp, err := h.paymentService.CreatePayment(c.Context(), req.BookingID, req.Amount)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(resp)
}

// struktur webhook request (field minimun)
type midtransWebhookReq struct {
	OrderID           string `json:"order_id"`
	StatusCode        string `json:"status_code"`
	GrossAmount       string `json:"gross_amount"`
	SignatureKey      string `json:"signature_key"`
	TransactionID     string `json:"transaction_id"`
	TransactionStatus string `json:"transaction_status"`
	FraudStatus       string `json:"fraud_status"`
}

// MidtransWebhook endpoint: POST /api/v1/payments/midtrans/webhook
func (h *PaymentHandler) MidtransWebhook(c *fiber.Ctx) error {
	var notif services.MidtransNotif

	if err := c.BodyParser(&notif); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "payload tidak valid",
		})
	}

	// if err := h.paymentService.HandleWebhook(c.Context(), notif); err != nil {
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 		"error": err.Error(),
	// 	})
	// }

	return c.JSON(fiber.Map{"status": "ok"})
}
