import random
import time
import os
from twilio.rest import Client

# TEMP store (use Redis in production)
otp_store = {}

OTP_EXPIRY = 300  # 5 min

# Twilio setup
client = Client(
    os.getenv("TWILIO_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)


def send_otp_sms(phone: str, otp: str):
    try:
        client.messages.create(
            body=f"Your OTP is {otp}",
            from_=os.getenv("TWILIO_PHONE"),
            to=f"+91{phone}"
        )
    except Exception as e:
        print("Twilio Error:", e)


def generate_otp(phone: str):
    otp = str(random.randint(100000, 999999))

    otp_store[phone] = {
        "otp": otp,
        "expires": time.time() + OTP_EXPIRY
    }

    print(f"OTP (dev only): {otp}")

    # Only send SMS if Twilio is configured
    if os.getenv("TWILIO_SID"):
        send_otp_sms(phone, otp)

    return otp
def verify_otp(phone: str, otp: str):
    data = otp_store.get(phone)

    if not data:
        return False

    if time.time() > data["expires"]:
        return False

    if data["otp"] != otp:
        return False

    del otp_store[phone]
    return True