package services

import (
	"context"
	"crypto/sha512"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"time"

	midtrans "github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"

	"github.com/fitranmei/Mooove-/backend/config"
	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/fitranmei/Mooove-/backend/repositories"
)

type PaymentService struct {
	cfg        *config.Config
	repo       repositories.PaymentRepo
	bookingSvc *BookingService
	snapClient *snap.Client
}

func NewPaymentService(cfg *config.Config, repo repositories.PaymentRepo, bookingSvc *BookingService) *PaymentService {
	client := &snap.Client{}
	var env midtrans.EnvironmentType
	if cfg.IsSandbox() {
		env = midtrans.Sandbox
	} else {
		env = midtrans.Production
	}
	client.New(cfg.MidtransServerKey, env)
	return &PaymentService{cfg: cfg, repo: repo, bookingSvc: bookingSvc, snapClient: client}
}

// CreatePayment: buat record payment dan minta Snap token/redirect URL
func (s *PaymentService) CreatePayment(ctx context.Context, bookingID uint, amount int64) (map[string]interface{}, error) {
	// order_id unik: booking-<id>-<unix>
	orderID := fmt.Sprintf("booking-%d-%d", bookingID, time.Now().Unix())

	p := &models.Payment{
		BookingID:         bookingID,
		Amount:            amount,
		Status:            "created",
		Provider:          "midtrans",
		ProviderPaymentID: orderID,
	}

	// simpan payment (non-tx)
	if err := s.repo.Create(nil, p); err != nil {
		return nil, err
	}

	// siapkan request Snap
	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID,
			GrossAmt: int64(amount),
		},
		Items: &[]midtrans.ItemDetails{
			{
				ID:    "booking-" + strconv.Itoa(int(bookingID)),
				Price: int64(amount),
				Qty:   1,
				Name:  "Booking tiket",
			},
		},
		CustomerDetail: &midtrans.CustomerDetails{}, // tambahkan jika ada data customer
		CreditCard:     &snap.CreditCardDetails{Secure: true},
	}

	resp, err := s.snapClient.CreateTransaction(req)
	if err != nil {
		return nil, err
	}

	out := map[string]interface{}{
		"order_id":     orderID,
		"token":        resp.Token,
		"redirect_url": resp.RedirectURL,
	}
	return out, nil
}

// VerifyMidtransSignature memverifikasi signature_key dari Midtrans.
// Rumus: SHA512(order_id + status_code + gross_amount + server_key)
func (s *PaymentService) VerifyMidtransSignature(orderID, statusCode, grossAmount, signatureKey string) bool {
	payload := orderID + statusCode + grossAmount + s.cfg.MidtransServerKey
	hasher := sha512.New()
	hasher.Write([]byte(payload))
	expected := hex.EncodeToString(hasher.Sum(nil))
	return expected == signatureKey
}

// HandleWebhook: proses notifikasi Midtrans (payload sebagai map[string]interface{})
// Perlu: order_id, status_code, gross_amount, signature_key, transaction_status
func (s *PaymentService) HandleWebhook(ctx context.Context, payload map[string]interface{}) error {
	// extract fields dengan toleransi tipe
	orderID, _ := payload["order_id"].(string)

	// status_code sering dikirim sebagai string, tapi bisa juga number - handle both
	var statusCode string
	switch v := payload["status_code"].(type) {
	case string:
		statusCode = v
	case float64:
		// midtrans kadang mengirim angka sebagai number
		statusCode = strconv.FormatInt(int64(v), 10)
	case int:
		statusCode = strconv.Itoa(v)
	default:
		statusCode = ""
	}

	// gross_amount bisa float64 atau string
	var grossAmount string
	switch v := payload["gross_amount"].(type) {
	case string:
		grossAmount = v
	case float64:
		// midtrans biasanya mengirim tanpa desimal, tapi bisa float
		grossAmount = strconv.FormatFloat(v, 'f', 0, 64)
	case int:
		grossAmount = strconv.Itoa(v)
	default:
		// fallback: try fmt.Sprint
		grossAmount = fmt.Sprint(v)
	}

	signatureKey, _ := payload["signature_key"].(string)
	transactionStatus, _ := payload["transaction_status"].(string)

	// validasi minimal
	if orderID == "" || signatureKey == "" {
		return errors.New("payload tidak lengkap: order_id atau signature_key kosong")
	}

	// verifikasi signature
	if !s.VerifyMidtransSignature(orderID, statusCode, grossAmount, signatureKey) {
		return errors.New("invalid signature")
	}

	// cari payment berdasarkan orderID
	p, err := s.repo.FindByProviderID(orderID)
	if err != nil {
		return err
	}

	// idempotensi: jika sudah paid skip
	if p.Status == "paid" {
		return nil
	}

	// jika transaction_status menunjukkan sukses (capture/settlement)
	if transactionStatus == "settlement" || transactionStatus == "capture" {
		p.Status = "paid"
		if err := s.repo.Save(nil, p); err != nil {
			return err
		}

		// finalize booking: pastikan BookingService punya method CompleteBookingAndIssueTickets(ctx, bookingID)
		if s.bookingSvc == nil {
			return errors.New("booking service belum tersedia untuk finalisasi")
		}
		if err := s.bookingSvc.CompleteBookingAndIssueTickets(ctx, p.BookingID); err != nil {
			return err
		}
		return nil
	}

	// handle expired/cancel/failed
	if transactionStatus == "expire" || transactionStatus == "cancel" || transactionStatus == "deny" || transactionStatus == "failed" {
		p.Status = "failed"
		if err := s.repo.Save(nil, p); err != nil {
			return err
		}
		// release reservation via booking service; optional error di-log
		if s.bookingSvc != nil {
			_ = s.bookingSvc.ReleaseBookingReservation(ctx, p.BookingID)
		}
		return nil
	}

	// untuk status lain, lakukan nothing (atau log)
	return nil
}
