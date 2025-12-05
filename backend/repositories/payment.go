package repositories

import (
	"github.com/fitranmei/Mooove-/backend/models"
	"gorm.io/gorm"
)

type PaymentRepo interface {
	Create(tx *gorm.DB, p *models.Payment) error
	FindByProviderID(pid string) (*models.Payment, error)
	Save(tx *gorm.DB, p *models.Payment) error
}

type paymentRepo struct{ db *gorm.DB }

func NewPaymentRepo(db *gorm.DB) PaymentRepo { return &paymentRepo{db: db} }

func (r *paymentRepo) Create(tx *gorm.DB, p *models.Payment) error {
	if tx != nil {
		return tx.Create(p).Error
	}
	return r.db.Create(p).Error
}

func (r *paymentRepo) FindByProviderID(pid string) (*models.Payment, error) {
	var p models.Payment
	if err := r.db.Where("provider_payment_id = ?", pid).First(&p).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *paymentRepo) Save(tx *gorm.DB, p *models.Payment) error {
	if tx != nil {
		return tx.Save(p).Error
	}
	return r.db.Save(p).Error
}
