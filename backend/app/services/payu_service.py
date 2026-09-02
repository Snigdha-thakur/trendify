import hashlib
from app.core.config import settings


class PayUService:
    PROD_URL = "https://secure.payu.in/_payment"
    TEST_URL = "https://test.payu.in/_payment"

    @staticmethod
    def get_payment_url() -> str:
        env = (settings.PAYU_ENV or "TEST").upper()
        return PayUService.PROD_URL if env == "PROD" else PayUService.TEST_URL

    @staticmethod
    def generate_hash(params: dict) -> str:
        """sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)"""
        hash_seq = (
            f"{params['key']}|{params['txnid']}|{params['amount']}|"
            f"{params['productinfo']}|{params['firstname']}|{params['email']}|"
            f"||||||||||{settings.PAYU_SALT}"
        )
        return hashlib.sha512(hash_seq.encode("utf-8")).hexdigest()

    @staticmethod
    def verify_webhook_hash(payload: dict) -> bool:
        """Reverse: sha512(SALT|status|||||||||||email|firstname|productinfo|amount|txnid|key)"""
        hash_seq = (
            f"{settings.PAYU_SALT}|{payload.get('status','')}|||||||||||"
            f"{payload.get('email','')}|{payload.get('firstname','')}|"
            f"{payload.get('productinfo','')}|{payload.get('amount','')}|"
            f"{payload.get('txnid','')}|{settings.PAYU_KEY}"
        )
        expected = hashlib.sha512(hash_seq.encode("utf-8")).hexdigest()
        received = payload.get("hash", "")
        # Accept both plain hash and v1 inside JSON
        if isinstance(received, str) and received.startswith("{"):
            import json
            try:
                received = json.loads(received).get("v1", "")
            except Exception:
                pass
        return expected == received

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
        hash_seq = (
            f"{params['key']}|{params['txnid']}|{params['amount']}|"
            f"{params['productinfo']}|{params['firstname']}|{params['email']}|"
            f"||||||||||{settings.PAYU_SALT}"
        )
        print(f"[payu] key={settings.PAYU_KEY!r} salt={settings.PAYU_SALT!r}")
        print(f"[payu] hash_seq={hash_seq!r}")
        print(f"[payu] hash={params['hash']}")
        return {"success": True, **params}
