package services

import (
	"context"
	"errors"
	"time"

	"github.com/fitranmei/Mooove-/backend/models"
	"github.com/golang-jwt/jwt/v5"
)

// AuthServiceImpl implements models.AuthService
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
	// delegate create to repo (repo validates email)
	user, err := s.repo.RegisterUser(ctx, registerData)
	if err != nil {
		return "", nil, err
	}

	// generate token
	token, err := s.generateToken(user)
	if err != nil {
		return "", nil, err
	}

	// clear password before returning
	user.Password = ""
	return token, user, nil
}

func (s *AuthServiceImpl) Login(ctx context.Context, loginData *models.AuthCredentials) (string, *models.User, error) {
	if loginData == nil {
		return "", nil, errors.New("no login data")
	}
	// get user by email
	user, err := s.repo.GetUser(ctx, "email = ?", loginData.Email)
	if err != nil {
		return "", nil, err
	}
	if user == nil {
		return "", nil, errors.New("invalid credentials")
	}

	// verify password using helper from models
	if !models.MatchesHash(loginData.Password, user.Password) {
		return "", nil, errors.New("invalid credentials")
	}

	// generate token
	token, err := s.generateToken(user)
	if err != nil {
		return "", nil, err
	}

	// clear password
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
