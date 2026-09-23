#!/usr/bin/env python3
"""Generate the QR code PNG for the posters.

    pip install "qrcode[pil]"
    python make_qr.py https://qr.demo-domain.xyz
"""
import sys
import qrcode

base = (sys.argv[1] if len(sys.argv) > 1 else "").rstrip("/")
if not base.startswith("https://"):
    sys.exit("usage: python make_qr.py https://qr.demo-domain.xyz")

url = base + "/"
qrcode.make(url, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=20, border=4).save("qr.png")
print(f"qr.png -> {url}")
