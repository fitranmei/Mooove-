package services

import (
	"context"
	"errors"
	"time"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/golang-jwt/jwt/v5"
)

type AuthServiceImpl struct {
	repo   models.AuthRepository
	jwtKey string
	ttl    time.Duration
}

func NewAuthServiceImpl(repo models.AuthRepository, jwtKey string, ttl time.Duration) models.AuthService {
	return &AuthServiceImpl{repo: repo, jwtKey: jwtKey, ttl: ttl}
}

func (s *AuthServiceImpl) Register(ctx context.Context, registerData *models.AuthCredentials) (string, *models.User, error) {
	if registerData == nil {
		return "", nil, errors.New("no register data")
	}

	if !models.IsValidEmail(registerData.Email) {
		return "", nil, errors.New("invalid email format")
	}

	existingUser, err := s.repo.GetUser(ctx, "email = ?", registerData.Email)
	if err != nil {
		return "", nil, err
	}
	if existingUser != nil {
		return "", nil, errors.New("email sudah terdaftar")
	}

	if len(registerData.Password) < 6 {
		return "", nil, errors.New("password harus memiliki minimal 6 karakter")
	}

	hasUpper := false
	for _, c := range registerData.Password {
		if c >= 'A' && c <= 'Z' {
			hasUpper = true
			break
		}
	}

	if !hasUpper {
		return "", nil, errors.New("password harus mengandung minimal 1 huruf kapital")
	}

	user, err := s.repo.RegisterUser(ctx, registerData)
	if err != nil {
		return "", nil, err
	}

	token, err := s.generateToken(user)
	if err != nil {
		return "", nil, err
	}

	user.Password = ""
	return token, user, nil
}

func (s *AuthServiceImpl) Login(ctx context.Context, loginData *models.AuthCredentials) (string, *models.User, error) {
	if loginData == nil {
		return "", nil, errors.New("no login data")
	}

	user, err := s.repo.GetUser(ctx, "email = ?", loginData.Email)
	if err != nil {
		return "", nil, err
	}

	if user == nil {
		return "", nil, errors.New("email tidak ditemukan, silakan daftar terlebih dahulu")
	}

	if !models.MatchesHash(loginData.Password, user.Password) {
		return "", nil, errors.New("password salah")
	}

	token, err := s.generateToken(user)
	if err != nil {
		return "", nil, err
	}

	user.Password = ""

	return token, user, nil
}

func (s *AuthServiceImpl) generateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":      user.ID,
		"email":    user.Email,
		"fullname": user.Fullname,
		"exp":      time.Now().Add(s.ttl).Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(s.jwtKey))
}
