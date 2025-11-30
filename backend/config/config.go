package config

import "os"

type Config struct {
	DSN        string
	Port       string
	JwtSecret  string
	StorageDir string
}

func Load() *Config {
	return &Config{
		DSN:        getEnv("DSN", "dev:devpass@tcp(db:3306)/tickets?parseTime=true"),
		Port:       getEnv("PORT", "8080"),
		JwtSecret:  getEnv("JWT_SECRET", "dev-secret"),
		StorageDir: getEnv("STORAGE_DIR", "./storage"),
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
