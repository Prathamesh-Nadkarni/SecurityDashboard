from functools import wraps
from flask import request, jsonify
import jwt
from jwtGenerator import decode_auth_token

def requires_roles(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            decoded_payload = None
            auth_header = request.headers.get('Authorization')
            if auth_header:
                try:
                    token = auth_header.split(" ")[1]
                    decoded_payload = decode_auth_token(token)
                except IndexError:
                    return jsonify({"message": "Access forbidden: token malformed"}), 403
                
                
                if decoded_payload is None:
                    return jsonify({"message": "Access forbidden: invalid token"}), 403
                
                # Ensure decoded_payload is a dictionary
                if isinstance(decoded_payload, dict):
                    user_role = decoded_payload.get('role')
                    if user_role is None or not any(role in user_role for role in roles):
                        return jsonify({"message": "Access forbidden: insufficient permissions"}), 403
                else:
                    return jsonify({"message": "Access forbidden: invalid token structure"}), 403

                return f(*args, **kwargs)
            return jsonify({"message": "Access forbidden: token required"}), 403

        return decorated_function
    return decorator
