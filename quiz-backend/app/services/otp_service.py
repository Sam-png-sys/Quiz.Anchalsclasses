import random
import time
import os
import resend
from dotenv import load_dotenv

load_dotenv()

#  RESEND API KEY
resend.api_key = os.getenv("RESEND_API_KEY")

# OTP STORE
otp_store = {}
OTP_EXPIRY = 300  # 5 minutes



# SEND EMAIL VIA RESEND

def send_email(to_email, subject, html_body):
    try:
        resend.Emails.send({
            "from": "Dr Anchal Classes <noreply@dranchalclasses.in>",
            "to": to_email,
            "subject": subject,
            "html": html_body
        })
    except Exception as e:
        print("Resend Error:", e)



# GENERATE OTP

def generate_otp(email):
    otp = str(random.randint(100000, 999999))

    otp_store[email] = {
        "otp": otp,
        "expires": time.time() + OTP_EXPIRY
    }

    print(f"OTP (dev): {otp}")

    #  SEND EMAIL
    send_email(
        email,
        "Your OTP Code",
        f"""
        <div style="font-family: Arial; padding: 20px;">
            <h2>Dr Anchal Classes</h2>
            <p>Your OTP is:</p>
            <h1 style="color:#06b6d4;">{otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
        </div>
        """
    )

    return otp



# VERIFY OTP

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