import os
import re
import html
import json
import sqlite3
import requests

from flask import Blueprint, request, jsonify


# ============================================================
# BLUEPRINT
# ============================================================

security_bp = Blueprint(
    "security",
    __name__,
    url_prefix="/api/security"
)


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DB = os.path.join(
    BASE_DIR,
    "security_lab.db"
)

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434/api/chat"
)

SECURITY_AI_MODEL = os.getenv(
    "SECURITY_AI_MODEL",
    os.getenv(
        "OLLAMA_MODEL",
        "gemma4:e2b"
    )
)

SECURITY_ENABLED = True


# ============================================================
# DATABASE
# ============================================================

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_security_lab():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS lab_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)

    count = conn.execute(
        "SELECT COUNT(*) FROM lab_users"
    ).fetchone()[0]

    if count == 0:
        conn.executemany(
            """
            INSERT INTO lab_users
            (username, password, role)
            VALUES (?, ?, ?)
            """,
            [
                ("alice", "alice123", "student"),
                ("bob", "bob123", "student"),
                ("charlie", "charlie123", "student"),
                ("admin", "admin123", "admin")
            ]
        )

    conn.commit()
    conn.close()


# ============================================================
# OLLAMA AI SECURITY ANALYZER
# ============================================================

def analyze_with_ollama(
    attack_type,
    test_data,
    context=""
):
    prompt = f"""
You are SecurityAI for a university web
security laboratory.

Analyze this security test.

Attack Type:
{attack_type}

Test Data:
{test_data}

Context:
{context}

Return ONLY JSON with these fields:

{{
  "attack_type": "",
  "detected": true,
  "risk_level": "Low",
  "suspicious_pattern": "",
  "explanation": "",
  "recommendation": ""
}}

Rules:
- detected must be true or false
- risk_level must be Low, Medium, or High
- Do not return Markdown
- Do not return code fences
- Do not include reasoning
- Return only the JSON object
"""

    payload = {
        "model": SECURITY_AI_MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "stream": False,

        # Important for Gemma4/reasoning models
        "think": False,

        # Force structured JSON
        "format": "json",

        "keep_alive": "0",

        "options": {
            "temperature": 0.1,
            "num_ctx": 4096,
            "num_predict": 800
        }
    }

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=120
        )

        response.raise_for_status()

        result = response.json()

        message = result.get(
            "message",
            {}
        )

        # Final answer
        text = (
            message.get("content")
            or ""
        ).strip()

        # Some models may put useful output
        # in another field.
        if not text:
            text = (
                message.get("response")
                or ""
            ).strip()

        if not text:
            print(
                "Ollama full response:",
                result
            )

            raise RuntimeError(
                "Ollama returned no final content."
            )

        # Remove accidental Markdown fences
        if text.startswith("```json"):
            text = text[7:]

        elif text.startswith("```"):
            text = text[3:]

        if text.endswith("```"):
            text = text[:-3]

        text = text.strip()

        # Find JSON object
        start = text.find("{")
        end = text.rfind("}")

        if start == -1 or end == -1:
            raise ValueError(
                f"Invalid JSON from Ollama: {text}"
            )

        analysis = json.loads(
            text[start:end + 1]
        )

        return {
            "ai_available": True,
            "ai_model": SECURITY_AI_MODEL,

            "attack_type":
                analysis.get(
                    "attack_type",
                    attack_type
                ),

            "detected":
                bool(
                    analysis.get(
                        "detected",
                        False
                    )
                ),

            "risk_level":
                analysis.get(
                    "risk_level",
                    "Medium"
                ),

            "suspicious_pattern":
                analysis.get(
                    "suspicious_pattern",
                    "Not identified"
                ),

            "explanation":
                analysis.get(
                    "explanation",
                    "No explanation returned."
                ),

            "recommendation":
                analysis.get(
                    "recommendation",
                    "Validate and sanitize untrusted input."
                )
        }

    except Exception as exc:

        print(
            "SecurityAI error:",
            exc
        )

        return {
            "ai_available": False,
            "ai_model": SECURITY_AI_MODEL,
            "attack_type": attack_type,
            "detected": False,
            "risk_level": "Unknown",
            "suspicious_pattern":
                "AI analysis unavailable",
            "explanation":
                str(exc),
            "recommendation":
                "Use server-side security controls."
        }

# ============================================================
# XSS DETECTION
# ============================================================


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

    normalized = html.unescape(
        value
    ).lower()

    for pattern, name in XSS_PATTERNS:

        if re.search(
            pattern,
            normalized,
            re.IGNORECASE
        ):
            return name

    return None


# ============================================================
# SQL INJECTION DETECTION
# ============================================================

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

    normalized = html.unescape(
        value
    ).strip()

    for pattern, name in SQL_PATTERNS:

        if re.search(
            pattern,
            normalized,
            re.IGNORECASE
        ):
            return name

    return None


# ============================================================
# TOGGLE
# ============================================================

@security_bp.route(
    "/toggle",
    methods=["POST"]
)
def toggle_security():

    global SECURITY_ENABLED

    data = request.get_json(
        silent=True
    ) or {}

    SECURITY_ENABLED = bool(
        data.get(
            "enabled",
            True
        )
    )

    return jsonify({
        "success": True,
        "enabled":
            SECURITY_ENABLED,
        "message":
            "Security protection enabled"
            if SECURITY_ENABLED
            else
            "Security protection disabled"
    })


@security_bp.route(
    "/status",
    methods=["GET"]
)
def security_status():

    return jsonify({
        "success": True,
        "enabled":
            SECURITY_ENABLED,
        "ai_model":
            SECURITY_AI_MODEL
    })


# ============================================================
# XSS TEST
# ============================================================

@security_bp.route(
    "/xss",
    methods=["POST"]
)
def xss_test():

    data = request.get_json(
        silent=True
    ) or {}

    value = data.get(
        "input",
        ""
    ).strip()

    if not value:
        return jsonify({
            "success": False,
            "message":
                "XSS payload is required"
        }), 400

    pattern = detect_xss(
        value
    )

    # --------------------------------------------------------
    # AI ANALYSIS
    # --------------------------------------------------------

    ai = analyze_with_ollama(
        "XSS",
        value,
        f"""
Detected local pattern:
{pattern or "None"}

Security protection:
{
            "enabled"
            if SECURITY_ENABLED
            else
            "disabled"
        }
"""
    )

    # --------------------------------------------------------
    # PROTECTED MODE
    # --------------------------------------------------------

    if SECURITY_ENABLED and pattern:

        return jsonify({
            "success": True,
            "attack": "XSS",
            "detected": True,
            "status":
                "Suspicious XSS pattern detected",
            "risk":
                "High",
            "action":
                "BLOCKED",
            "pattern_detected":
                pattern,
            "payload":
                value,
            "http_status":
                200,

            "ai_analysis":
                ai,

            "message":
                "XSS payload blocked."
        })

    # --------------------------------------------------------
    # LAB MODE
    # --------------------------------------------------------

    if not SECURITY_ENABLED:

        return jsonify({
            "success": True,
            "attack": "XSS",
            "detected":
                bool(pattern),

            "status":
                "XSS payload accepted in laboratory mode",

            "risk":
                "High" if pattern else "Testing",

            "action":
                "EXECUTED",

            "pattern_detected":
                pattern or "No known pattern",

            "payload":
                value,

            "http_status":
                200,

            "ai_analysis":
                ai,

            "message":
                "XSS payload returned for controlled "
                "laboratory execution."
        })

    # --------------------------------------------------------
    # NORMAL INPUT
    # --------------------------------------------------------

    return jsonify({
        "success": True,
        "attack": "XSS",
        "detected": False,
        "status":
            "No known XSS pattern detected",
        "risk":
            "Low",
        "action":
            "ALLOWED",
        "pattern_detected":
            "No",
        "payload":
            value,
        "http_status":
            200,
        "ai_analysis":
            ai,
        "message":
            "No known XSS pattern detected."
    })


# ============================================================
# SQL INJECTION TEST
# ============================================================

@security_bp.route(
    "/sql",
    methods=["POST"]
)
def sql_test():

    data = request.get_json(
        silent=True
    ) or {}

    username = data.get(
        "username",
        ""
    )

    password = data.get(
        "password",
        ""
    )

    if not username:
        return jsonify({
            "success": False,
            "message":
                "Username is required"
        }), 400

    pattern = detect_sql(
        username
    )

    if not pattern:
        pattern = detect_sql(
            password
        )

    # --------------------------------------------------------
    # AI ANALYSIS
    # --------------------------------------------------------

    ai = analyze_with_ollama(
        "SQL Injection",
        f"""
username:
{username}

password:
{password}
""",
        f"""
Local SQL pattern:
{pattern or "None"}

Security protection:
{
            "enabled"
            if SECURITY_ENABLED
            else
            "disabled"
        }
"""
    )

    # --------------------------------------------------------
    # PROTECTED MODE
    # --------------------------------------------------------

    if SECURITY_ENABLED:

        conn = get_db()

        try:
            row = conn.execute(
                """
                SELECT id, username, role
                FROM lab_users
                WHERE username = ?
                AND password = ?
                """,
                (
                    username,
                    password
                )
            ).fetchone()

        finally:
            conn.close()

        return jsonify({
            "success": True,
            "attack":
                "SQL Injection",
            "detected":
                bool(pattern),
            "status":
                "Parameterized query used",
            "risk":
                "High" if pattern else "Low",
            "action":
                "BLOCKED"
                if pattern
                else
                "PROTECTED",
            "pattern_detected":
                pattern or "No",
            "results":
                [dict(row)]
                if row
                else [],
            "rows_returned":
                1 if row else 0,
            "ai_analysis":
                ai
        })

    # --------------------------------------------------------
    # LAB MODE - INTENTIONALLY VULNERABLE
    # --------------------------------------------------------

    unsafe_query = f"""
SELECT id, username, role
FROM lab_users
WHERE username = '{username}'
AND password = '{password}'
"""

    conn = get_db()

    try:

        rows = conn.execute(
            unsafe_query
        ).fetchall()

        results = [
            dict(row)
            for row in rows
        ]

        injected = bool(
            pattern
        )

        return jsonify({
            "success": True,
            "attack":
                "SQL Injection",
            "detected":
                injected,
            "status":
                "SQL query executed in laboratory database",
            "risk":
                "High" if injected else "Testing",
            "action":
                "EXECUTED_IN_LAB_DB"
                if injected
                else
                "EXECUTED",
            "pattern_detected":
                pattern or "No",
            "query":
                unsafe_query,
            "results":
                results,
            "rows_returned":
                len(results),
            "http_status":
                200,
            "ai_analysis":
                ai,
            "message":
                f"Laboratory SQL query executed. "
                f"{len(results)} row(s) returned."
        })

    except sqlite3.Error as exc:

        return jsonify({
            "success": False,
            "attack":
                "SQL Injection",
            "action":
                "SQL_ERROR",
            "query":
                unsafe_query,
            "error":
                str(exc),
            "ai_analysis":
                ai
        }), 400

    finally:
        conn.close()


# ============================================================
# CSRF TEST
# ============================================================

TRUSTED_ORIGINS = {
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
}


@security_bp.route(
    "/csrf",
    methods=["POST"]
)
def csrf_test():

    data = request.get_json(
        silent=True
    ) or {}

    origin = data.get(
        "origin",
        "http://malicious-site.test"
    )

    csrf_token = data.get(
        "csrf_token",
        ""
    )

    token_present = bool(
        csrf_token.strip()
    )

    # --------------------------------------------------------
    # AI ANALYSIS
    # --------------------------------------------------------

    ai = analyze_with_ollama(
        "CSRF",
        f"""
Request Origin:
{origin}

CSRF Token Present:
{token_present}

CSRF Token:
{
            "[present]"
            if token_present
            else
            "[missing]"
        }
""",
        f"""
Trusted origins:
{sorted(TRUSTED_ORIGINS)}

Security protection:
{
            "enabled"
            if SECURITY_ENABLED
            else
            "disabled"
        }
"""
    )

    # --------------------------------------------------------
    # PROTECTED MODE
    # --------------------------------------------------------

    if SECURITY_ENABLED:

        if origin not in TRUSTED_ORIGINS:

            return jsonify({
                "success": False,
                "attack":
                    "CSRF",
                "detected":
                    True,
                "status":
                    "Untrusted cross-site request blocked",
                "risk":
                    "High",
                "action":
                    "BLOCKED",
                "pattern_detected":
                    f"Untrusted Origin: {origin}",
                "origin":
                    origin,
                "http_status":
                    403,
                "ai_analysis":
                    ai,
                "message":
                    "CSRF request rejected."
            }), 403

        if not token_present:

            return jsonify({
                "success": False,
                "attack":
                    "CSRF",
                "detected":
                    True,
                "status":
                    "CSRF token missing",
                "risk":
                    "High",
                "action":
                    "BLOCKED",
                "pattern_detected":
                    "Missing CSRF token",
                "origin":
                    origin,
                "http_status":
                    403,
                "ai_analysis":
                    ai,
                "message":
                    "CSRF token validation failed."
            }), 403

        return jsonify({
            "success": True,
            "attack":
                "CSRF",
            "detected":
                False,
            "status":
                "Trusted request allowed",
            "risk":
                "Low",
            "action":
                "ALLOWED",
            "pattern_detected":
                "No suspicious CSRF pattern",
            "origin":
                origin,
            "http_status":
                200,
            "ai_analysis":
                ai
        }), 200

    # --------------------------------------------------------
    # LAB MODE
    # --------------------------------------------------------

    return jsonify({
        "success": True,
        "attack":
            "CSRF",
        "detected":
            True,
        "status":
            "Forged request processed in laboratory mode",
        "risk":
            "High",
        "action":
            "FORGED_REQUEST_EXECUTED",
        "pattern_detected":
            f"Origin: {origin}",
        "origin":
            origin,
        "http_status":
            200,
        "ai_analysis":
            ai,
        "message":
            "CSRF request processed for controlled "
            "laboratory testing."
    }), 200


# ============================================================
# AI ONLY ANALYSIS ENDPOINT
# ============================================================

@security_bp.route(
    "/ai-analyze",
    methods=["POST"]
)
def ai_analyze():

    data = request.get_json(
        silent=True
    ) or {}

    attack_type = data.get(
        "attack_type",
        "Security Test"
    )

    test_data = data.get(
        "test_data",
        ""
    )

    context = data.get(
        "context",
        ""
    )

    if not test_data:

        return jsonify({
            "success": False,
            "message":
                "Test data is required"
        }), 400

    analysis = analyze_with_ollama(
        attack_type,
        test_data,
        context
    )

    return jsonify({
        "success":
            analysis["ai_available"],
        "attack_type":
            analysis["attack_type"],
        "detected":
            analysis["detected"],
        "risk_level":
            analysis["risk_level"],
        "suspicious_pattern":
            analysis["suspicious_pattern"],
        "explanation":
            analysis["explanation"],
        "recommendation":
            analysis["recommendation"],
        "model":
            analysis["ai_model"]
    })


init_security_lab()
