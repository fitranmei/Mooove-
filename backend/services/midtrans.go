package services

// MidtransNotif dipakai untuk mempermudah handling webhook Midtrans.
// Semua field mengikuti structure payload versi Snap API.
type MidtransNotif struct {
	OrderID           string `json:"order_id"`
	StatusCode        string `json:"status_code"`
	GrossAmount       string `json:"gross_amount"`
	SignatureKey      string `json:"signature_key"`
	TransactionID     string `json:"transaction_id"`
	TransactionStatus string `json:"transaction_status"`
	FraudStatus       string `json:"fraud_status"`
}
