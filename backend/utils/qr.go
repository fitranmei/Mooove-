package utils

import (
	"os"
	"path/filepath"

	"github.com/skip2/go-qrcode"
)

func GenerateQR(text string, path string) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return err
	}

	return qrcode.WriteFile(text, qrcode.Medium, 256, path)
}
