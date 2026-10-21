import secrets
from functools import wraps
from hmac import compare_digest
from flask import request, jsonify

CSRF_COOKIE = "csrf_token"
CSRF_HEADER = "X-CSRF-Token"

def generate_csrf_token():
    return secrets.token_urlsafe(32)

def csrf_protected(func):
    @wraps(func)
    def wrapper(*args, **kwargs):

        if request.method in {
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        }:

            cookie_token = request.cookies.get(
                CSRF_COOKIE
            )

            header_token = request.headers.get(
                CSRF_HEADER
            )

            if not cookie_token or not header_token:
                return jsonify({
                    "success": False,
                    "message": "CSRF token is missing"
                }), 403

            if not compare_digest(
                cookie_token,
                header_token
            ):
                return jsonify({
                    "success": False,
                    "message": "CSRF validation failed"
                }), 403

        return func(*args, **kwargs)

    return wrapper