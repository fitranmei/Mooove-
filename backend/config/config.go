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
		DSN:        getenv("DSN", "root:@tcp(127.0.0.1:3306)/mooove_db?parseTime=true&loc=Local"),
		Port:       getenv("PORT", "8080"),
		JwtSecret:  getenv("JWT_SECRET", "verymooove123"),
		StorageDir: getenv("STORAGE_DIR", "./storage"),
	}
}

func getenv(key, fallback string) string {
	val := os.Getenv(key)
	if val != "" {
		return val
	}
	return fallback
}
