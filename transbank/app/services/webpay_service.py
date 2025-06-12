from transbank.webpay.webpay_plus.transaction import Transaction, WebpayOptions
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class WebpayService:  # Asegúrate que la clase esté definida así
    @staticmethod
    def create_transaction(buy_order, amount, session_id, return_url):
        try:
            amount = int(float(amount))
            options = WebpayOptions(
                commerce_code=current_app.config['WEBPAY_COMMERCE_CODE'],
                api_key=current_app.config['WEBPAY_API_KEY'],
                integration_type=current_app.config['WEBPAY_ENVIRONMENT']
            )
            tx = Transaction(options)
            return tx.create(
                buy_order=buy_order,
                session_id=session_id,
                amount=amount,
                return_url=return_url
            )
        except Exception as e:
            logger.error(f"Error en WebpayService: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def commit_transaction(token):
        options = WebpayOptions(
            commerce_code=current_app.config['WEBPAY_COMMERCE_CODE'],
            api_key=current_app.config['WEBPAY_API_KEY'],
            integration_type=current_app.config['WEBPAY_ENVIRONMENT']
        )
        tx = Transaction(options)
        return tx.commit(token)