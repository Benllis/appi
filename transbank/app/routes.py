from flask import Blueprint, render_template, request, redirect, url_for, current_app
from app.services.cmf_service import CMFService
from app.services.webpay_service import WebpayService
from datetime import datetime

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/cmf')
def cmf_data():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    uf_data = CMFService.get_uf(date)
    dollar_data = CMFService.get_dollar(date)
    return render_template('cmf.html', uf_data=uf_data, dollar_data=dollar_data, selected_date=date)

@bp.route('/payment', methods=['POST'])
def payment():
    urlbueno = "https://webpay3gint.transbank.cl/webpayserver/initTransaction?token_ws="
    try:
        current_app.logger.info("Iniciando proceso de pago")
        
        amount = int(float(request.form.get('amount')))
        buy_order = f"TEST_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        session_id = f"SESSION_{datetime.now().timestamp()}"
        return_url = url_for('main.payment_result', _external=True, _scheme='http')  # HTTP para desarrollo
        
        current_app.logger.info(f"Datos de transacción - Monto: {amount}, Orden: {buy_order}, Sesión: {session_id}")
        current_app.logger.info(f"URL de retorno: {return_url}")

        # Crear transacción
        response = WebpayService.create_transaction(
            buy_order=buy_order,
            amount=amount,
            session_id=session_id,
            return_url=return_url
        )

        current_app.logger.info("Respuesta de WebPay recibida correctamente")
        current_app.logger.info(f"URL de redirección: {response['url']}")
        current_app.logger.info(f"Token: {urlbueno + (response['token'])}")
        urlbueno += (response['token'])
        
        return redirect(urlbueno)
        
    except Exception as e:
        current_app.logger.error(f"Error en proceso de pago: {str(e)}", exc_info=True)
        return render_template('error.html', error="Ocurrió un error al procesar el pago"), 500
    
@bp.route('/payment-result')
def payment_result():
    token = request.args.get('token_ws')
    if not token:
        return render_template('error.html', error="Token no proporcionado"), 400

    try:
        response = WebpayService.commit_transaction(token)
        
        # Una vez validado, redirige al frontend Node.js
        return redirect(f"http://localhost:3000/webpay/confirmar?token_ws={token}&retiro_domicilio=1")
    except Exception as e:
        current_app.logger.error(f"Error en payment_result: {str(e)}")
        return render_template('error.html', error=str(e)), 500

@bp.route('/webpay/commit', methods=['POST'])
def webpay_commit():
    data = request.get_json()
    token = data.get('token_ws')

    if not token:
        return {"error": "Token faltante"}, 400

    try:
        result = WebpayService.commit_transaction(token)
        return result  # Asegúrate que sea un dict con 'status': 'AUTHORIZED', etc.
    except Exception as e:
        current_app.logger.error(f"Error en commit de WebPay: {str(e)}", exc_info=True)
        return {"error": "Error al confirmar transacción"}, 500