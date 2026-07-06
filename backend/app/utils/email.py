import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings


def _build_html(buyer_name: str, product_name: str, transaction_id: str, amount: float, view_url: str) -> str:
    logo_url = "https://www.trendifytechnologies.in/logo.jpeg"
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(108,99,255,0.13);">

        <!-- BANNER HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#6c63ff 0%,#a78bfa 60%,#c4b5fd 100%);padding:36px 30px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;width:64px;">
                  <img src="{logo_url}" alt="T" width="56" height="56"
                    style="width:56px;height:56px;border-radius:12px;object-fit:cover;display:block;border:2px solid rgba(255,255,255,0.5);" />
                </td>
                <td style="vertical-align:middle;padding-left:16px;">
                  <div style="font-size:30px;font-weight:900;color:#ffffff;letter-spacing:1px;line-height:1;font-family:Georgia,serif;">Trendify</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.85);letter-spacing:2px;text-transform:uppercase;margin-top:5px;font-family:Arial,sans-serif;">Empowering Digital Creators</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:36px 40px 28px;color:#333;font-size:15px;line-height:1.75;">
            <h2 style="color:#1a1a2e;margin:0 0 14px;font-size:22px;font-weight:800;">Hello {buyer_name}! &#127881;</h2>
            <p style="margin:0 0 10px;">Thank you for your purchase on <strong style="color:#6c63ff;">Trendify</strong>. Your order has been confirmed and is being processed.</p>

            <!-- ORDER CARD -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:12px;overflow:hidden;border:1px solid #e8e6ff;">
              <tr>
                <td style="background:linear-gradient(135deg,#6c63ff,#a78bfa);padding:12px 20px;">
                  <span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Order Summary</span>
                </td>
              </tr>
              <tr>
                <td style="background:#faf9ff;padding:20px 20px 4px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #ede9ff;">
                        <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Transaction ID</span><br/>
                        <span style="color:#333;font-size:13px;word-break:break-all;">{transaction_id}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #ede9ff;">
                        <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Product</span><br/>
                        <span style="color:#1a1a2e;font-size:15px;font-weight:700;">{product_name}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0 16px;">
                        <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Amount Paid</span><br/>
                        <span style="color:#6c63ff;font-size:22px;font-weight:900;">&#8377;{amount}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA BUTTON -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 24px;">
                  <a href="{view_url}"
                    style="display:inline-block;background:linear-gradient(135deg,#6c63ff,#a78bfa);color:#ffffff;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 15px rgba(108,99,255,0.4);">
                    &#128279; View Your Purchase
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#aaa;font-size:12px;text-align:center;">Questions? <a href="mailto:trendifytechnologies@gmail.com" style="color:#6c63ff;text-decoration:none;">trendifytechnologies@gmail.com</a></p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f5f3ff;padding:16px 20px;text-align:center;border-top:1px solid #ede9ff;">
            <p style="margin:0;color:#bbb;font-size:11px;">&copy; 2025 Trendify Technologies. All rights reserved.</p>
            <p style="margin:4px 0 0;"><a href="https://www.trendifytechnologies.in" style="color:#6c63ff;font-size:11px;text-decoration:none;">www.trendifytechnologies.in</a></p>
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
