import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings


def _build_html(buyer_name: str, product_name: str, transaction_id: str, amount: float, view_url: str) -> str:
    logo_url = "https://www.trendifytechnologies.in/assets/logo1.png"
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#121212;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#121212;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1e1e2e;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:#0d0d1a;padding:30px;text-align:center;">
            <img src="{logo_url}" alt="Trendify" style="height:55px;object-fit:contain;display:block;margin:0 auto;" />
            <p style="color:#9090b0;margin:8px 0 0;font-size:13px;letter-spacing:0.5px;">Empowering Digital Creators</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;color:#d0d0e0;font-size:15px;line-height:1.7;">
            <h2 style="color:#ffffff;margin:0 0 16px;font-size:22px;">Hello {buyer_name}!</h2>
            <p style="margin:0 0 12px;">Thank you for your purchase on <strong style="color:#ffffff;">Trendify</strong>.</p>
            <p style="margin:0 0 12px;">Your purchase has been confirmed and your order is being processed.</p>
            <p style="margin:0 0 20px;">Your purchase details are:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#2a2a3e;border-radius:8px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 6px;color:#a0a0c0;font-size:13px;">TRANSACTION ID</p>
                <p style="margin:0 0 18px;color:#ffffff;font-size:14px;word-break:break-all;">{transaction_id}</p>
                <p style="margin:0 0 6px;color:#a0a0c0;font-size:13px;">PRODUCT</p>
                <p style="margin:0 0 18px;color:#ffffff;font-size:15px;font-weight:bold;">{product_name}</p>
                <p style="margin:0 0 6px;color:#a0a0c0;font-size:13px;">AMOUNT PAID</p>
                <p style="margin:0;color:#7c6fff;font-size:18px;font-weight:bold;">&#8377;{amount}</p>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding-bottom:28px;">
                <a href="{view_url}" style="display:inline-block;background:#6c63ff;color:#ffffff;padding:13px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">View Purchase</a>
              </td></tr>
            </table>
            <p style="margin:0;color:#606080;font-size:12px;">Questions? Contact us at <a href="mailto:support@trendifytechnologies.in" style="color:#6c63ff;">support@trendifytechnologies.in</a></p>
          </td>
        </tr>
        <tr>
          <td style="background:#0d0d1a;padding:18px;text-align:center;">
            <p style="margin:0;color:#505070;font-size:12px;">&copy; 2025 Trendify Technologies. All rights reserved.</p>
            <p style="margin:4px 0 0;"><a href="https://www.trendifytechnologies.in" style="color:#6c63ff;font-size:12px;text-decoration:none;">www.trendifytechnologies.in</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def send_purchase_confirmation(
    buyer_email: str,
    buyer_name: str,
    product_name: str,
    transaction_id: str,
    amount: float,
    view_url: str,
):
    html = _build_html(buyer_name, product_name, transaction_id, amount, view_url)
    subject = f"Purchase Confirmed – {product_name}"
    from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER or "onboarding@resend.dev"
    from_name = settings.SMTP_FROM_NAME or "Trendify"

    if settings.RESEND_API_KEY:
        _send_via_resend(settings.RESEND_API_KEY, from_email, from_name, buyer_email, subject, html)
    elif settings.SMTP_USER and settings.SMTP_PASSWORD:
        _send_via_smtp(from_email, from_name, buyer_email, subject, html)
    else:
        print("[email] No provider configured (set RESEND_API_KEY or SMTP credentials)")


def _send_via_resend(api_key: str, from_email: str, from_name: str, to_email: str, subject: str, html: str):
    try:
        import resend
        resend.api_key = api_key
        resp = resend.Emails.send({
            "from": f"{from_name} <{from_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html,
        })
        print(f"[email] Resend SUCCESS: {resp}")
    except Exception as e:
        print(f"[email] Resend ERROR: {e}")


def _send_via_smtp(from_email: str, from_name: str, to_email: str, subject: str, html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))
    print(f"[email] SMTP attempting to send to {to_email}")
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        print(f"[email] SMTP SUCCESS: Sent to {to_email}")
    except Exception as e:
        print(f"[email] SMTP ERROR: {e}")
