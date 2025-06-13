from flask import Flask
from config import Config
import logging
from logging.handlers import RotatingFileHandler  # Importa el handler necesario
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configuración del logger
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler(
            'logs/webpay.log',
            maxBytes=10240,
            backupCount=10,
            encoding='utf-8'  # Agrega encoding para caracteres especiales
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Aplicación iniciada')
    
    # Configuración de Transbank (si es necesaria)
    from app.routes import bp
    app.register_blueprint(bp)
    
    return app