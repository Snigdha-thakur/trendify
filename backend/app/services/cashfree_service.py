import httpx
from app.core.config import settings


class CashfreeService:
    """Service for creating Cashfree payment orders."""

    BASE_URLS = {
        "PROD": "https://api.cashfree.com",
        "TEST": "https://test.cashfree.com",
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
            return {
                "success": False,
                "error": "Cashfree credentials are not configured",
            }

        url = f"{CashfreeService.get_base_url()}/pg/orders"
        payload = {
            "order_id": order_id,
            "order_amount": float(amount),
            "order_currency": currency,
            "customer_details": customer_details or {},
        }
        if order_meta:
            payload["order_meta"] = order_meta

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-client-id": settings.CASHFREE_APP_ID,
            "x-client-secret": settings.CASHFREE_SECRET_KEY,
        }

        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(url, json=payload, headers=headers)

        try:
            data = response.json()
        except ValueError:
            return {
                "success": False,
                "error": "Invalid response from Cashfree",
                "raw": response.text,
            }

        if response.status_code != 200 or data.get("status") != "OK":
            return {
                "success": False,
                "error": data.get("message") or data.get("subCode") or response.text,
                "raw": data,
            }

        return {
            "success": True,
            "order_id": data.get("order_id") or order_id,
            "payment_link": data.get("payment_link"),
            "data": data,
        }
