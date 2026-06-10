import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    """Service for handling Stripe payment operations"""
    
    @staticmethod
    def create_payment_intent(amount: float, currency: str = "usd", metadata: dict = None) -> dict:
        """Create a Stripe payment intent"""
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Stripe uses cents
                currency=currency,
                metadata=metadata or {},
            )
            return {
                "success": True,
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id
            }
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def confirm_payment(payment_intent_id: str) -> dict:
        """Confirm a payment intent"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            if intent.status == "succeeded":
                return {
                    "success": True,
                    "status": "succeeded",
                    "charge_id": intent.charges.data[0].id if intent.charges.data else None
                }
            else:
                return {
                    "success": False,
                    "status": intent.status
                }
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def create_customer(email: str, name: str = None) -> dict:
        """Create a Stripe customer"""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
            )
            return {
                "success": True,
                "customer_id": customer.id
            }
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def create_payout(amount: float, currency: str = "usd", description: str = None) -> dict:
        """Create a payout to a connected account"""
        try:
            payout = stripe.Payout.create(
                amount=int(amount * 100),
                currency=currency,
                description=description,
            )
            return {
                "success": True,
                "payout_id": payout.id,
                "status": payout.status
            }
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def refund_payment(charge_id: str, amount: float = None) -> dict:
        """Refund a payment"""
        try:
            refund_data = {"charge": charge_id}
            if amount:
                refund_data["amount"] = int(amount * 100)
            
            refund = stripe.Refund.create(**refund_data)
            return {
                "success": True,
                "refund_id": refund.id,
                "status": refund.status
            }
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
