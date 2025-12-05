package utils

import (
	"os"
	"path/filepath"

	"github.com/skip2/go-qrcode"
)

// GenerateQR membuat QR PNG dan menyimpannya ke path yang diberikan.
func GenerateQR(text string, path string) error {
	// pastikan folder tujuan ada
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return err
	}

	// generate file PNG ukuran 256x256
	return qrcode.WriteFile(text, qrcode.Medium, 256, path)
}
