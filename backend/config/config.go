package config

import "os"

type Config struct {
	DSN        string
	Port       string
	JwtSecret  string
	StorageDir string

	MidtransServerKey string
	MidtransClientKey string
	MidtransEnv       string
}

func Load() *Config {
	return &Config{
		DSN:        getenv("DSN", "root:@tcp(127.0.0.1:3306)/mooove_db?parseTime=true&loc=Local"),
		Port:       getenv("PORT", "8080"),
		JwtSecret:  getenv("JWT_SECRET", "verymooove123"),
		StorageDir: getenv("STORAGE_DIR", "./storage"),

		MidtransServerKey: getenv("MIDTRANS_SERVER_KEY", "SB-Mid-server-REPLACE_ME"),
		MidtransClientKey: getenv("MIDTRANS_CLIENT_KEY", "SB-Mid-client-REPLACE_ME"),
		MidtransEnv:       getenv("MIDTRANS_ENV", "sandbox"),
	}
}

func getenv(key, fallback string) string {
	val := os.Getenv(key)
	if val != "" {
		return val
	}
	return fallback
}

func (c *Config) IsSandbox() bool {
	return c.MidtransEnv == "sandbox"
}

func (c *Config) IsProduction() bool {
	return c.MidtransEnv == "production"
}
