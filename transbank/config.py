import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Webpay Plus
    WEBPAY_COMMERCE_CODE = os.getenv('WEBPAY_COMMERCE_CODE')
    WEBPAY_API_KEY = os.getenv('WEBPAY_API_KEY')
    WEBPAY_ENVIRONMENT = os.getenv('WEBPAY_ENVIRONMENT', 'TEST')  # TEST o LIVE
    
    # Configuración adicional
    WEBPAY_RETURN_URL = os.getenv('WEBPAY_RETURN_URL')
    
    # Configuración CMF
    CMF_API_URL = os.getenv('CMF_API_URL', 'https://api.cmfchile.cl/api-sbifv3/recursos_api')
    CMF_API_KEY = os.getenv('CMF_API_KEY')