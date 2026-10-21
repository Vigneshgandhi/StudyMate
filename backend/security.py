import re
import html

from flask import Blueprint, request, jsonify

security_bp = Blueprint(
    "security",
    __name__,
    url_prefix="/api/security"
)

# --------------------------------------------------
# SECURITY MODE
# --------------------------------------------------

SECURITY_ENABLED = True


# --------------------------------------------------
# XSS PATTERNS
# --------------------------------------------------

XSS_PATTERNS = [
    (r"<\s*script\b", "<script>"),
    (r"javascript\s*:", "javascript:"),
    (r"\bonerror\s*=", "onerror="),
    (r"\bonload\s*=", "onload="),
    (r"\bonclick\s*=", "onclick="),
    (r"\bonmouseover\s*=", "onmouseover="),
    (r"\bonfocus\s*=", "onfocus="),
]


def detect_xss(value):
    value = html.unescape(value).lower()

    for pattern, name in XSS_PATTERNS:
        if re.search(pattern, value, re.I):
            return name

    return None


# --------------------------------------------------
# SQL INJECTION PATTERNS
# --------------------------------------------------

SQL_PATTERNS = [
    (
        r"(\bor\b|\band\b)\s+['\"]?\w+['\"]?\s*=\s*['\"]?\w+",
        "SQL boolean condition"
    ),
    (
        r"\bunion\s+(all\s+)?select\b",
        "UNION SELECT"
    ),
    (
        r";\s*(select|insert|update|delete|drop|alter|truncate)\b",
        "SQL statement chaining"
    ),
    (
        r"--\s*$",
        "SQL comment"
    ),
    (
        r"/\*.*\*/",
        "SQL block comment"
    ),
    (
        r"\b(drop|truncate|alter)\s+(table|database)\b",
        "destructive SQL command"
    ),
]


def detect_sql(value):
    value = html.unescape(value).strip()

    for pattern, name in SQL_PATTERNS:
        if re.search(pattern, value, re.I):
            return name

    return None


# --------------------------------------------------
# VALIDATION
# --------------------------------------------------

def validate_input(data):
    if not isinstance(data, dict):
        return None, "Invalid request data"

    value = data.get("input", "")

    if not isinstance(value, str):
        return None, "Input must be a string"

    value = value.strip()

    if not value:
        return None, "Test input is required"

    if len(value) > 2000:
        return None, "Input must not exceed 2000 characters"

    return value, None


# --------------------------------------------------
# SECURITY TOGGLE
# --------------------------------------------------

@security_bp.route(
    "/toggle",
    methods=["POST"]
)
def toggle_security():
    global SECURITY_ENABLED

    data = request.get_json(silent=True) or {}

    SECURITY_ENABLED = bool(
        data.get("enabled", True)
    )

    return jsonify({
        "success": True,
        "security_enabled": SECURITY_ENABLED,
        "message":
            "Security protection enabled"
            if SECURITY_ENABLED
            else "Security protection disabled for testing"
    })


@security_bp.route(
    "/status",
    methods=["GET"]
)
def security_status():
    return jsonify({
        "success": True,
        "security_enabled": SECURITY_ENABLED
    })


# --------------------------------------------------
# XSS
# --------------------------------------------------

@security_bp.route(
    "/analyze-xss",
    methods=["POST"]
)
def analyze_xss():

    data = request.get_json(
        silent=True
    ) or {}

    value, error = validate_input(data)

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    pattern = detect_xss(value)

    if not SECURITY_ENABLED:

        return jsonify({
            "success": True,
            "vulnerability": "XSS",
            "threat_detected": False,
            "status":
                "Security disabled - attack simulation allowed",
            "risk_level": "Testing",
            "pattern_detected": pattern or value,
            "action": "SIMULATED",
            "recommendation":
                "Security protection is disabled for testing."
        }), 200

    if pattern:

        return jsonify({
            "success": True,
            "vulnerability": "XSS",
            "threat_detected": True,
            "status":
                "Suspicious XSS pattern detected",
            "risk_level": "High",
            "pattern_detected": pattern,
            "action": "BLOCKED",
            "recommendation":
                "Validate user input and safely encode output. "
                "Never render untrusted input as raw HTML."
        }), 200

    return jsonify({
        "success": True,
        "vulnerability": "XSS",
        "threat_detected": False,
        "status":
            "No known XSS pattern detected",
        "risk_level": "Low",
        "pattern_detected": "No",
        "action": "ALLOWED",
        "recommendation":
            "Continue using input validation and safe React rendering."
    }), 200


# --------------------------------------------------
# SQL INJECTION
# --------------------------------------------------

@security_bp.route(
    "/analyze-injection",
    methods=["POST"]
)
def analyze_injection():

    data = request.get_json(
        silent=True
    ) or {}

    value, error = validate_input(data)

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 400

    pattern = detect_sql(value)

    if not SECURITY_ENABLED:

        return jsonify({
            "success": True,
            "vulnerability": "SQL Injection",
            "threat_detected": False,
            "status":
                "Security disabled - attack simulation allowed",
            "risk_level": "Testing",
            "pattern_detected": pattern or value,
            "action": "SIMULATED",
            "recommendation":
                "Security protection is disabled for testing."
        }), 200

    if pattern:

        return jsonify({
            "success": True,
            "vulnerability": "SQL Injection",
            "threat_detected": True,
            "status":
                "Suspicious SQL injection pattern detected",
            "risk_level": "High",
            "pattern_detected": pattern,
            "action": "BLOCKED",
            "recommendation":
                "Use parameterized queries or prepared statements. "
                "Never concatenate user input into SQL queries."
        }), 200

    return jsonify({
        "success": True,
        "vulnerability": "Injection",
        "threat_detected": False,
        "status":
            "No suspicious injection pattern detected",
        "risk_level": "Low",
        "pattern_detected": "No",
        "action": "ALLOWED",
        "recommendation":
            "Continue validating input and using parameterized queries."
    }), 200


# --------------------------------------------------
# CSRF ANALYSIS
# --------------------------------------------------

@security_bp.route(
    "/analyze-csrf",
    methods=["GET"]
)
def analyze_csrf():

    if not SECURITY_ENABLED:

        return jsonify({
            "success": True,
            "vulnerability": "CSRF",
            "threat_detected": False,
            "status":
                "Security disabled - simulation mode",
            "risk_level": "Testing",
            "pattern_detected": "Protection disabled",
            "action": "SIMULATED",
            "recommendation":
                "Enable security protection after testing."
        })

    return jsonify({
        "success": True,
        "vulnerability": "CSRF",
        "threat_detected": False,
        "status":
            "Protected authentication architecture detected",
        "risk_level": "Low",
        "pattern_detected":
            "No CSRF vulnerability detected for current JWT Bearer authentication",
        "action": "PROTECTED",
        "recommendation":
            "Continue using Authorization Bearer JWT authentication. "
            "If cookie-based authentication is introduced, use "
            "SameSite cookies and CSRF tokens."
    })


# --------------------------------------------------
# CSRF SIMULATION
# --------------------------------------------------

@security_bp.route(
    "/simulate-csrf",
    methods=["POST"]
)
def simulate_csrf():

    data = request.get_json(
        silent=True
    ) or {}

    origin = data.get(
        "origin",
        "http://malicious-site.test"
    )

    trusted_origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    }

    # Security disabled
    if not SECURITY_ENABLED:

        return jsonify({
            "success": True,
            "vulnerability": "CSRF",
            "threat_detected": False,
            "status":
                "Security disabled - simulated request allowed",
            "risk_level": "Testing",
            "pattern_detected":
                f"Origin: {origin}",
            "action": "SIMULATED",
            "http_status": 200,
            "recommendation":
                "Security protection is disabled for testing."
        }), 200

    # Security enabled
    if origin not in trusted_origins:

        return jsonify({
            "success": False,
            "vulnerability": "CSRF",
            "threat_detected": True,
            "status":
                "Untrusted cross-site request blocked",
            "risk_level": "High",
            "pattern_detected":
                f"Untrusted Origin: {origin}",
            "action": "BLOCKED",
            "http_status": 403,
            "recommendation":
                "Reject requests from untrusted origins. "
                "For cookie-based authentication, use "
                "CSRF tokens and SameSite cookie protection."
        }), 403

    return jsonify({
        "success": True,
        "vulnerability": "CSRF",
        "threat_detected": False,
        "status":
            "Trusted application request allowed",
        "risk_level": "Low",
        "pattern_detected":
            f"Trusted Origin: {origin}",
        "action": "ALLOWED",
        "http_status": 200,
        "recommendation":
            "Request originated from a trusted StudyMate origin."
    }), 200