import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings


def send_purchase_confirmation(
    buyer_email: str,
    buyer_name: str,
    product_name: str,
    transaction_id: str,
    amount: float,
    view_url: str,
):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("[email] SMTP not configured, skipping email.")
        return

    logo_url = "https://trendifytechnology.vercel.app/assets/logo1.png"

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#1a1a2e;color:#e0e0e0;border-radius:12px;overflow:hidden;">
      <div style="background:#0f0f1a;padding:30px;text-align:center;">
        <img src="{logo_url}" alt="Trendify" style="height:60px;object-fit:contain;" />
        <p style="color:#a0a0c0;margin:8px 0 0;font-size:13px;">Empowering Digital Creators</p>
      </div>
      <div style="padding:32px 36px;">
        <h2 style="color:#ffffff;margin-top:0;">Hello {buyer_name}!</h2>
        <p>Thank you for your purchase on <strong>Trendify</strong>.</p>
        <p>Your purchase has been confirmed and your order is being processed.</p>
        <p><strong>Your purchase details are:</strong></p>
        <p>Transaction ID: {transaction_id}</p>
        <p>Product: {product_name}</p>
        <p>Amount: ₹{amount}</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="{view_url}" style="background:#6c63ff;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">View Purchase</a>
        </div>
        <p style="color:#888;font-size:12px;text-align:center;">© Trendify Technology. All rights reserved.</p>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Purchase Confirmed – {product_name}"
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL or settings.SMTP_USER}>"
    msg["To"] = buyer_email
    msg.attach(MIMEText(html, "html"))

    print(f"[email] Attempting to send to {buyer_email} via {settings.SMTP_HOST}:{settings.SMTP_PORT} as {settings.SMTP_USER}")
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, buyer_email, msg.as_string())
        print(f"[email] SUCCESS: Sent to {buyer_email}")
    except smtplib.SMTPAuthenticationError as e:
        print(f"[email] AUTH FAILED: Wrong Gmail app password. {e}")
    except smtplib.SMTPException as e:
        print(f"[email] SMTP ERROR: {e}")
    except Exception as e:
        print(f"[email] UNEXPECTED ERROR: {e}")
