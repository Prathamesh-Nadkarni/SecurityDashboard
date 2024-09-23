import jwt
from datetime import datetime, timedelta
from flask import jsonify

SECRET_KEY = 'MySecretKey'

def encode_auth_token(user_id, role):
    try:
        payload = {
            'exp': datetime.utcnow() + timedelta(days=1),
            'iat': datetime.utcnow(),
            'sub': user_id,
            'role': role
        }
        return jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    except Exception as e:
        return str(e)

def decode_auth_token(auth_token):
    try:
        payload = jwt.decode(auth_token, SECRET_KEY, algorithms=['HS256'])
        # Check if the token has expired
        exp_time = datetime.fromtimestamp(payload['exp'])
        if is_token_expired(exp_time):
            return jsonify({"message": "Token has expired"}), 401  # Token has expired
        return payload  # Return the whole payload
    except Exception as e:
        return str(e)


def is_token_expired(expiration_time):
    if isinstance(expiration_time, datetime):
        return datetime.utcnow() > expiration_time
    return False  # Handle unexpected types