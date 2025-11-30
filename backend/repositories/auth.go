package repositories

import (
	"context"
	"errors"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/fitranmei/Mooove-/backend/models"
)

type authRepo struct {
	db *gorm.DB
}

func NewAuthRepo(db *gorm.DB) models.AuthRepository {
	return &authRepo{db: db}
}

func bcryptGenerateImpl(password string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func (r *authRepo) RegisterUser(ctx context.Context, registerData *models.AuthCredentials) (*models.User, error) {
	// validate email
	if !models.IsValidEmail(registerData.Email) {
		return nil, errors.New("invalid email")
	}

	// check exists
	existing, err := r.GetUser(ctx, "email = ?", registerData.Email)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("email already registered")
	}

	// hash password
	hashed, err := bcryptGenerate(registerData.Password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Email:    registerData.Email,
		Fullname: registerData.Email, // or set Fullname later; AuthCredentials only has email+password
		Password: hashed,
	}

	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return nil, err
	}

	// hide password before returning (model tag already hides on json, but clear anyway)
	user.Password = ""
	return user, nil
}

func (r *authRepo) GetUser(ctx context.Context, query interface{}, args ...interface{}) (*models.User, error) {
	var u models.User
	err := r.db.WithContext(ctx).Where(query, args...).First(&u).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	// do not clear password here; service needs it to compare
	return &u, nil
}

// bcrypt helper local to repo file to avoid extra imports elsewhere
func bcryptGenerate(password string) (string, error) {
	// small wrapper to avoid import cycles; uses bcrypt
	hashed, err := bcryptGenerateImpl(password)
	return hashed, err
}
