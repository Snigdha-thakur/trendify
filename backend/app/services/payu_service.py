import hashlib
import hmac
import json
from app.core.config import settings


class PayUService:
    PROD_URL = "https://secure.payu.in/_payment"
    TEST_URL = "https://test.payu.in/_payment"

    @staticmethod
    def get_payment_url() -> str:
        env = (settings.PAYU_ENV or "TEST").upper()
        return PayUService.PROD_URL if env == "PROD" else PayUService.TEST_URL

    @staticmethod
    def _build_hash(hash_seq: str) -> str:
        """Salt V2: returns JSON {"v1": sha512, "v2": hmac-sha256}"""
        v1 = hashlib.sha512(hash_seq.encode()).hexdigest()
        v2 = hmac.new(settings.PAYU_SALT.encode(), hash_seq.encode(), hashlib.sha256).hexdigest()
        return json.dumps({"v1": v1, "v2": v2})

    @staticmethod
    def generate_hash(params: dict) -> str:
        hash_seq = (
            f"{params['key']}|{params['txnid']}|{params['amount']}|"
            f"{params['productinfo']}|{params['firstname']}|{params['email']}|"
            f"||||||||||{settings.PAYU_SALT}"
        )
        return PayUService._build_hash(hash_seq)

    @staticmethod
    def verify_webhook_hash(payload: dict) -> bool:
        status = payload.get("status", "")
        hash_seq = (
            f"{settings.PAYU_SALT}|{status}|||||||||||"
            f"{payload.get('email','')}|{payload.get('firstname','')}|"
            f"{payload.get('productinfo','')}|{payload.get('amount','')}|"
            f"{payload.get('txnid','')}|{settings.PAYU_KEY}"
        )
        expected = PayUService._build_hash(hash_seq)
        return expected == payload.get("hash", "")

    @staticmethod
    def create_payment_params(
        txn_id: str,
        amount: float,
        product_name: str,
        buyer_name: str,
        buyer_email: str,
        buyer_phone: str,
    ) -> dict:
        if not settings.PAYU_KEY or not settings.PAYU_SALT:
            return {"success": False, "error": "PayU credentials are not configured"}

        params = {
            "key": settings.PAYU_KEY,
            "txnid": txn_id,
            "amount": f"{amount:.2f}",
            "productinfo": product_name,
            "firstname": buyer_name,
            "email": buyer_email,
            "phone": buyer_phone or "9999999999",
            "surl": f"{settings.BACKEND_URL}/api/payments/return/payu",
            "furl": f"{settings.BACKEND_URL}/api/payments/return/payu",
        }
        params["hash"] = PayUService.generate_hash(params)
        params["payment_url"] = PayUService.get_payment_url()
        return {"success": True, **params}
