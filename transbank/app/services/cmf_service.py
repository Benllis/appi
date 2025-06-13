import requests
import pandas as pd
from flask import current_app
from datetime import datetime

class CMFService:
    @staticmethod
    def get_uf(date=None):
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        year, month = date.split('-')[0], date.split('-')[1]
        url = f"{current_app.config['CMF_API_URL']}/uf/{year}/{month}?apikey={current_app.config['CMF_API_KEY']}&formato=json"
        
        try:
            response = requests.get(url)
            data = response.json()
            ufs = data['UFs']
            df = pd.DataFrame(ufs)
            return df.to_dict('records')
        except Exception as e:
            current_app.logger.error(f"Error al obtener UF: {str(e)}")
            return None

    @staticmethod
    def get_dollar(date=None):
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        year, month = date.split('-')[0], date.split('-')[1]
        url = f"{current_app.config['CMF_API_URL']}/dolar/{year}/{month}?apikey={current_app.config['CMF_API_KEY']}&formato=json"
        
        try:
            response = requests.get(url)
            data = response.json()
            dollars = data['Dolares']
            df = pd.DataFrame(dollars)
            return df.to_dict('records')
        except Exception as e:
            current_app.logger.error(f"Error al obtener dólar: {str(e)}")
            return None