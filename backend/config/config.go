package config

import "os"

type Config struct {
	// konfigurasi lama (tetap)
	DSN        string
	Port       string
	JwtSecret  string
	StorageDir string

	// konfigurasi Midtrans
	MidtransServerKey string
	MidtransClientKey string
	MidtransEnv       string // "sandbox" atau "production"
}

func Load() *Config {
	return &Config{
		// konfigurasi lama
		DSN:        getenv("DSN", "root:@tcp(127.0.0.1:3306)/mooove_db?parseTime=true&loc=Local"),
		Port:       getenv("PORT", "8080"),
		JwtSecret:  getenv("JWT_SECRET", "verymooove123"),
		StorageDir: getenv("STORAGE_DIR", "./storage"),

		// konfigurasi Midtrans
		MidtransServerKey: getenv("MIDTRANS_SERVER_KEY", "SB-Mid-server-REPLACE_ME"),
		MidtransClientKey: getenv("MIDTRANS_CLIENT_KEY", "SB-Mid-client-REPLACE_ME"),
		MidtransEnv:       getenv("MIDTRANS_ENV", "sandbox"), // default sandbox
	}
}

func getenv(key, fallback string) string {
	val := os.Getenv(key)
	if val != "" {
		return val
	}
	return fallback
}

// Helper Midtrans Environment
func (c *Config) IsSandbox() bool {
	return c.MidtransEnv == "sandbox"
}

func (c *Config) IsProduction() bool {
	return c.MidtransEnv == "production"
}
