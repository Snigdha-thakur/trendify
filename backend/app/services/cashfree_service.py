import httpx
from app.core.config import settings


class CashfreeService:
    BASE_URLS = {
        "PROD": "https://api.cashfree.com",
        "TEST": "https://sandbox.cashfree.com",
    }

    @staticmethod
    def get_base_url() -> str:
        env = (settings.CASHFREE_ENV or "TEST").upper()
        return CashfreeService.BASE_URLS.get(env, CashfreeService.BASE_URLS["TEST"])

    @staticmethod
    async def create_order(
        order_id: str,
        amount: float,
        currency: str = "INR",
        customer_details: dict | None = None,
        order_meta: dict | None = None,
    ) -> dict:
        if not settings.CASHFREE_APP_ID or not settings.CASHFREE_SECRET_KEY:
            return {"success": False, "error": "Cashfree credentials are not configured"}

        cust = customer_details or {}
        url = f"{CashfreeService.get_base_url()}/pg/orders"
        payload = {
            "order_id": order_id,
            "order_amount": float(amount),
            "order_currency": currency,
            "customer_details": {
                "customer_id": cust.get("customer_id", "cust_" + order_id[:20]),
                "customer_name": cust.get("customer_name", ""),
                "customer_email": cust.get("customer_email", ""),
                "customer_phone": cust.get("customer_phone") or "9999999999",
            },
            "order_meta": {
                "return_url": f"{settings.BACKEND_URL}/api/payments/return?order_id={{order_id}}&product_id={order_id}",
                "notify_url": f"{settings.BACKEND_URL}/api/payments/webhook/cashfree",
            },
        }

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-client-id": settings.CASHFREE_APP_ID,
            "x-client-secret": settings.CASHFREE_SECRET_KEY,
            "x-api-version": "2023-08-01",
        }

        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(url, json=payload, headers=headers)

        try:
            data = response.json()
        except ValueError:
            return {"success": False, "error": "Invalid response from Cashfree", "raw": response.text}

        print("Cashfree response:", data)

        if response.status_code not in (200, 201) or "payment_session_id" not in data:
            return {
                "success": False,
                "error": data.get("message") or str(data),
                "raw": data,
            }

        session_id = data["payment_session_id"]
        env = (settings.CASHFREE_ENV or "PROD").upper()
        base = "https://payments.cashfree.com" if env == "PROD" else "https://payments-test.cashfree.com"
        payment_link = f"{base}/order/#/pay/{session_id}"

        return {
            "success": True,
            "order_id": data.get("order_id", order_id),
            "payment_link": payment_link,
            "payment_session_id": session_id,
            "env": env,
            "data": data,
        }
