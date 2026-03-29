import random
import time
import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

otp_store = {}
OTP_EXPIRY = 300


def send_email(to_email, subject, body):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)


def generate_otp(email):
    otp = str(random.randint(100000, 999999))

    otp_store[email] = {
        "otp": otp,
        "expires": time.time() + OTP_EXPIRY
    }

    send_email(email, "OTP", f"Your OTP is {otp}")

    return otp


def verify_otp(email, otp):
    data = otp_store.get(email)

    if not data:
        return False

    if time.time() > data["expires"]:
        return False

    if data["otp"] != otp:
        return False

    del otp_store[email]
    return True