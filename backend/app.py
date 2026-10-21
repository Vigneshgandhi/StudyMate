import os
import json
import datetime
import requests
import jwt
# from security import security_bp
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)
from dotenv import load_dotenv

from ai_service import chat_with_ai
from encryption import encrypt_data, decrypt_data
from database import get_db, init_db

from chat_storage import (
    save_chat,
    get_user_chats,
    get_all_chat_records,
    get_chat_summaries,
    get_chat_by_id,
    delete_chat,
    decrypt_chat_record
)

from blog_service import (
    delete_post,
    get_post,
    get_post_by_id,
    list_posts,
    save_post,
    set_status
)

from email_service import (
    send_blog_notification,
    send_feedback,
    send_prompt,
    send_study_summary
)

from reminder_service import (
    create_reminder,
    schedule_reminder,
    start_scheduler
)

from csrf import (
    generate_csrf_token,
    csrf_protected,
    CSRF_COOKIE
)
from security_lab import (
    security_bp,
    init_security_lab
)


# ============================================================
# CONFIGURATION
# ============================================================

load_dotenv()

app = Flask(__name__)


init_security_lab()

frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000"
)

CORS(
    app,
    origins=[
        frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    supports_credentials=True
)

app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY",
    "studymate-secret-key"
)

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434/api/chat"
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "gemma4:e2b"
)

CODE_MODEL = os.getenv(
    "CODE_MODEL",
    "codegemma4:latest"
)
app.register_blueprint(
    security_bp,
    url_prefix="/api/security"
)
init_db()
start_scheduler()


# ============================================================
# AUTHENTICATION
# ============================================================

def get_authorization_token():
    header = request.headers.get(
        "Authorization",
        ""
    )

    if not header.startswith("Bearer "):
        raise PermissionError(
            "Missing or invalid Authorization header"
        )

    token = header.split(
        " ",
        1
    )[1].strip()

    if not token:
        raise PermissionError(
            "Missing JWT token"
        )

    return token


def get_authenticated_user():
    token = get_authorization_token()

    try:
        payload = jwt.decode(
            token,
            app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )
    except jwt.ExpiredSignatureError:
        raise PermissionError(
            "JWT token has expired"
        )
    except jwt.InvalidTokenError:
        raise PermissionError(
            "Invalid JWT token"
        )

    user_id = payload.get("user_id")

    if not user_id:
        raise PermissionError(
            "JWT does not contain a valid user_id"
        )

    conn = get_db()

    try:
        user = conn.execute(
            """
            SELECT id, name, email, role
            FROM users
            WHERE id = ?
            """,
            (user_id,)
        ).fetchone()
    finally:
        conn.close()

    if user is None:
        raise PermissionError(
            "User not found"
        )

    return dict(user)


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            user = get_authenticated_user()

            return func(
                *args,
                current_user=user,
                **kwargs
            )

        except PermissionError as exc:
            return jsonify({
                "success": False,
                "message": str(exc)
            }), 401

    return wrapper


def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            user = get_authenticated_user()

            if user.get("role") != "admin":
                return jsonify({
                    "success": False,
                    "message": "Admin access required"
                }), 403

            return func(
                *args,
                current_user=user,
                **kwargs
            )

        except PermissionError as exc:
            return jsonify({
                "success": False,
                "message": str(exc)
            }), 401

    return wrapper


# ============================================================
# CSRF TOKEN
# ============================================================

@app.route(
    "/api/csrf-token",
    methods=["GET"]
)
def csrf_token():
    token = generate_csrf_token()

    response = jsonify({
        "success": True,
        "message": "CSRF token generated"
    })

    response.set_cookie(
        CSRF_COOKIE,
        token,
        httponly=False,
        secure=False,
        samesite="Lax",
        max_age=3600
    )

    return response


# ============================================================
# OLLAMA
# ============================================================

def call_ollama(
    prompt,
    history=None,
    temperature=0.7,
    response_format=None,
    model=None
):
    model = model or OLLAMA_MODEL

    messages = []

    for item in (history or [])[-4:]:
        role = item.get("role")
        content = (
            item.get("content")
            or item.get("text")
        )

        if role == "ai":
            role = "assistant"

        if (
            role in ["user", "assistant"]
            and content
        ):
            messages.append({
                "role": role,
                "content": content
            })

    messages.append({
        "role": "user",
        "content": prompt
    })

    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "keep_alive": "0",
        "options": {
            "temperature": temperature,
            "num_ctx": 4096,
            "num_predict": 1200
        }
    }

    if response_format:
        payload["format"] = response_format

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=180
        )

    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            "Cannot connect to Ollama. "
            "Make sure Ollama is running."
        )

    except requests.exceptions.Timeout:
        raise RuntimeError(
            "Ollama request timed out."
        )

    if not response.ok:
        raise RuntimeError(
            f"Ollama error {response.status_code}: "
            f"{response.text}"
        )

    result = response.json()

    answer = (
        result
        .get("message", {})
        .get("content", "")
        .strip()
    )

    if not answer:
        raise RuntimeError(
            "Ollama returned an empty response."
        )

    return answer

# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return jsonify({
        "message":
            "StudyMate Flask Backend is running",
        "ai_provider":
            "Ollama",
        "model":
            OLLAMA_MODEL
    })


# ============================================================
# REGISTER
# ============================================================

@app.route(
    "/api/register",
    methods=["POST"]
)
@csrf_protected
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No data received"
        }), 400

    name = data.get(
        "name",
        ""
    ).strip()

    email = data.get(
        "email",
        ""
    ).strip().lower()

    password = data.get(
        "password",
        ""
    )

    if not name or not email or not password:
        return jsonify({
            "message":
                "All fields are required"
        }), 400

    if len(password) < 6:
        return jsonify({
            "message":
                "Password must contain at least 6 characters"
        }), 400

    conn = get_db()

    try:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if existing:
            return jsonify({
                "message":
                    "Email already registered"
            }), 409

        hashed = generate_password_hash(
            password
        )

        conn.execute(
            """
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
            """,
            (
                name,
                email,
                hashed
            )
        )

        conn.commit()

    finally:
        conn.close()

    return jsonify({
        "message":
            "Registration successful"
    }), 201


# ============================================================
# LOGIN
# ============================================================

@app.route(
    "/api/login",
    methods=["POST"]
)
@csrf_protected
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "message":
                "No data received"
        }), 400

    email = data.get(
        "email",
        ""
    ).strip().lower()

    password = data.get(
        "password",
        ""
    )

    if not email or not password:
        return jsonify({
            "message":
                "Email and password are required"
        }), 400

    conn = get_db()

    try:
        user = conn.execute(
            """
            SELECT id, name, email, password, role
            FROM users
            WHERE email = ?
            """,
            (email,)
        ).fetchone()
    finally:
        conn.close()

    if user is None:
        return jsonify({
            "message":
                "Invalid email or password"
        }), 401

    if not check_password_hash(
        user["password"],
        password
    ):
        return jsonify({
            "message":
                "Invalid email or password"
        }), 401

    token = jwt.encode(
        {
            "user_id":
                user["id"],
            "email":
                user["email"],
            "role":
                user["role"] or "student",
            "exp":
                datetime.datetime.now(
                    datetime.timezone.utc
                )
                +
                datetime.timedelta(
                    hours=24
                )
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return jsonify({
        "message":
            "Login successful",

        "token":
            token,

        "user": {
            "id":
                user["id"],
            "name":
                user["name"],
            "email":
                user["email"],
            "role":
                user["role"] or "student"
        }
    }), 200


# ============================================================
# STUDY PROMPT
# ============================================================

def build_study_prompt(data):

    return f"""
Create exactly 6 personalized study prompts
for a university student.

Subject:
{data.get("subject", "")}

Topic:
{data.get("topic", "")}

Current Level:
{data.get("level", "")}

Main Goal:
{data.get("goal", "")}

Available Study Time:
{data.get("duration", "")}

Preferred Learning Style:
{data.get("learningStyle", "")}

Real-Time Examples:
{data.get("realTimeExamples", "Yes")}

Create these six prompt types:

1. Concept Understanding
2. Exam Preparation
3. Step-by-Step Learning
4. Practical / Real-World Examples
5. Practice Questions
6. Quick Revision

Make every prompt personalized and
appropriate for university-level study.

Use realistic examples when useful.

Do not answer the topic.

Return ONLY valid JSON:

{{
    "prompts": [
        "Prompt 1",
        "Prompt 2",
        "Prompt 3",
        "Prompt 4",
        "Prompt 5",
        "Prompt 6"
    ]
}}
"""


def parse_prompts(text):

    if not text:
        raise ValueError(
            "Ollama returned an empty response."
        )

    text = text.strip()

    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    try:
        result = json.loads(
            text.strip()
        )

        prompts = result.get(
            "prompts",
            []
        )

        if not isinstance(
            prompts,
            list
        ):
            raise ValueError(
                "Prompts must be a list."
            )

        if len(prompts) != 6:
            raise ValueError(
                f"Expected 6 prompts, got {len(prompts)}."
            )

        return prompts

    except Exception as exc:
        print(
            "Prompt JSON error:",
            exc
        )
        print(text)

        raise ValueError(
            "Ollama returned invalid JSON."
        )


@app.route(
    "/api/generate-prompts",
    methods=["POST"]
)
@csrf_protected
def generate_prompts():

    data = request.get_json()

    if not data:
        return jsonify({
            "message":
                "No data received"
        }), 400

    required = [
        "subject",
        "topic",
        "level",
        "goal",
        "duration",
        "learningStyle"
    ]

    for field in required:
        if not data.get(field):
            return jsonify({
                "message":
                    f"{field} is required"
            }), 400

    try:
        raw = call_ollama(
            build_study_prompt(data),
            temperature=0.7
        )

        prompts = parse_prompts(raw)

        return jsonify({
            "success": True,
            "message":
                "Prompts generated successfully",
            "provider":
                "Ollama",
            "model":
                OLLAMA_MODEL,
            "prompts":
                prompts
        }), 200

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                "Failed to generate study prompts",
            "error":
                str(exc)
        }), 500


# ============================================================
# AI CHAT
# ============================================================

@app.route(
    "/api/chat",
    methods=["POST"]
)
@csrf_protected
@login_required
def chat(current_user=None):

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message":
                "No data received"
        }), 400

    message = data.get(
        "message",
        ""
    ).strip()

    if not message:
        return jsonify({
            "success": False,
            "message":
                "Message is required"
        }), 400

    try:
        result = chat_with_ai(
            data,
            message,
            data.get(
                "history",
                []
            )
        )

        answer = result["message"]

        save_chat(
            user_id=current_user["id"],
            provider=result["provider"],
            user_message=message,
            ai_response=answer
        )

        return jsonify({
            "success": True,
            "provider":
                result["provider"],
            "model":
                result["model"],
            "message":
                answer
        }), 200

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                "Failed to generate AI response",
            "error":
                str(exc)
        }), 500


# ============================================================
# CHAT HISTORY
# ============================================================

@app.route(
    "/api/chat/history/<int:user_id>",
    methods=["GET"]
)
@login_required
def chat_history(
    user_id,
    current_user=None
):

    if user_id != current_user["id"]:
        return jsonify({
            "success": False,
            "message":
                "You can only access your own chat history"
        }), 403

    try:
        return jsonify({
            "success":
                True,
            "history":
                get_user_chats(user_id)
        }), 200

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                "Failed to load chat history",
            "error":
                str(exc)
        }), 500


@app.route(
    "/api/chat/history/<int:chat_id>",
    methods=["DELETE"]
)
@csrf_protected
@login_required
def delete_chat_history(
    chat_id,
    current_user=None
):

    try:
        deleted = delete_chat(
            chat_id,
            current_user["id"]
        )

        if not deleted:
            return jsonify({
                "success": False,
                "message":
                    "Chat not found"
            }), 404

        return jsonify({
            "success": True,
            "message":
                "Chat deleted"
        }), 200

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                "Failed to delete chat"
        }), 500


# ============================================================
# CUSTOM PROMPT
# ============================================================

@app.route(
    "/api/generate-custom-prompt",
    methods=["POST"]
)
# @csrf_protected
def generate_custom_prompt():

    data = request.get_json()

    if not data:
        return jsonify({
            "message":
                "No data received"
        }), 400

    user_request = data.get(
        "request",
        ""
    ).strip()

    if not user_request:
        return jsonify({
            "message":
                "Prompt request is required"
        }), 400

    prompt = f"""
Create a high-quality AI-ready prompt
from the student's request below.

Student Request:
{user_request}

Improve the request while preserving
the student's original intention.

Make it clear, specific, actionable,
and suitable for university learning.

Do not answer the request.

Return only the final AI-ready prompt.
"""

    try:
        generated = call_ollama(
            prompt,
            temperature=0.7
        )

        return jsonify({
            "success": True,
            "provider": "Ollama",
            "model": OLLAMA_MODEL,
            "prompt": generated
        }), 200

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                "Failed to generate custom prompt",
            "error":
                str(exc)
        }), 500


# ============================================================
# FEEDBACK
# ============================================================

@app.route(
    "/api/feedback",
    methods=["POST"]
)
@csrf_protected
@login_required
def feedback(current_user=None):

    data = request.get_json() or {}

    subject = data.get(
        "subject",
        ""
    ).strip()

    message = data.get(
        "message",
        ""
    ).strip()

    if not subject or not message:
        return jsonify({
            "success": False,
            "message":
                "Subject and feedback message are required"
        }), 400

    try:
        send_feedback(
            current_user,
            data
        )

        return jsonify({
            "success": True,
            "message":
                "Feedback sent successfully"
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message":
                "Feedback could not be sent"
        }), 500


# ============================================================
# BLOG - PUBLIC
# ============================================================

@app.route(
    "/api/blog/posts",
    methods=["GET"]
)
def blog_posts():

    return jsonify({
        "success": True,
        "posts": list_posts(
            category=request.args.get(
                "category"
            ),
            search=request.args.get(
                "search"
            )
        )
    })


@app.route(
    "/api/blog/posts/<title>",
    methods=["GET"]
)
def blog_post(title):

    post = get_post(title)

    if not post or post["status"] != "published":
        return jsonify({
            "success": False,
            "message":
                "Article not found"
        }), 404

    return jsonify({
        "success": True,
        "post": post
    })


# ============================================================
# EMAIL
# ============================================================

@app.route(
    "/api/email/prompt",
    methods=["POST"]
)
@csrf_protected
@login_required
def email_prompt(current_user=None):

    data = request.get_json() or {}

    if not data.get("prompt"):
        return jsonify({
            "success": False,
            "message":
                "Prompt is required"
        }), 400

    try:
        send_prompt(
            current_user["email"],
            data
        )

        return jsonify({
            "success": True,
            "message":
                "Prompt emailed successfully"
        }), 200

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                str(exc)
        }), 500


@app.route(
    "/api/email/study-summary",
    methods=["POST"]
)
@csrf_protected
@login_required
def email_study_summary(
    current_user=None
):

    data = request.get_json() or {}

    try:
        if not data.get("summary"):
            data["summary"] = call_ollama(
                f"""
Summarize this StudyMate study session
with key learning points and next steps.

Subject:
{data.get("subject", "")}

Topic:
{data.get("topic", "")}
""",
                temperature=0.3
            )

        send_study_summary(
            current_user["email"],
            data
        )

        return jsonify({
            "success": True,
            "message":
                "Study summary emailed successfully"
        }), 200

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                str(exc)
        }), 500


@app.route(
    "/api/email/blog-notification",
    methods=["POST"]
)
@csrf_protected
@admin_required
def email_blog_notification(
    current_user=None
):

    data = request.get_json() or {}

    post = (
        get_post_by_id(
            data["postId"]
        )
        if data.get("postId")
        else data
    )

    if not post or not post.get("title"):
        return jsonify({
            "success": False,
            "message":
                "A blog post is required"
        }), 400

    base_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000"
    )

    conn = get_db()

    try:
        students = conn.execute(
            """
            SELECT email
            FROM users
            WHERE role = 'student'
            """
        ).fetchall()
    finally:
        conn.close()

    sent = 0

    for student in students:
        try:
            send_blog_notification(
                student["email"],
                post,
                f"{base_url}/blog/{post.get('title', '')}"
            )
            sent += 1
        except Exception as exc:
            print(
                "Blog notification error:",
                exc
            )

    return jsonify({
        "success": True,
        "sent": sent
    })


# ============================================================
# REMINDERS
# ============================================================

@app.route(
    "/api/reminders",
    methods=["POST"]
)
@csrf_protected
@login_required
def add_reminder(current_user=None):

    try:
        reminder_id = create_reminder(
            current_user["id"],
            request.get_json() or {}
        )

        return jsonify({
            "success": True,
            "id":
                reminder_id
        }), 201

    except ValueError as exc:
        return jsonify({
            "success": False,
            "message":
                str(exc)
        }), 400

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                str(exc)
        }), 500


@app.route(
    "/api/reminders",
    methods=["GET"]
)
@login_required
def reminders(current_user=None):

    conn = get_db()

    try:
        rows = conn.execute(
            """
            SELECT *
            FROM reminders
            WHERE user_id = ?
            ORDER BY reminder_datetime
            """,
            (current_user["id"],)
        ).fetchall()

        return jsonify({
            "success": True,
            "reminders":
                [dict(row) for row in rows]
        })

    finally:
        conn.close()


@app.route(
    "/api/reminders/<int:reminder_id>",
    methods=["DELETE"]
)
@csrf_protected
@login_required
def remove_reminder(
    reminder_id,
    current_user=None
):

    conn = get_db()

    try:
        cursor = conn.execute(
            """
            DELETE FROM reminders
            WHERE id = ?
            AND user_id = ?
            """,
            (
                reminder_id,
                current_user["id"]
            )
        )

        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "success": False,
                "message":
                    "Reminder not found"
            }), 404

        return jsonify({
            "success": True
        })

    finally:
        conn.close()


# ============================================================
# ADMIN BLOG
# ============================================================

@app.route(
    "/api/admin/blog",
    methods=["GET", "POST"]
)
@csrf_protected
@admin_required
def admin_blog(current_user=None):

    if request.method == "GET":
        return jsonify({
            "success": True,
            "posts": list_posts(
                include_drafts=True,
                category=request.args.get(
                    "category"
                ),
                search=request.args.get(
                    "search"
                )
            )
        })

    try:
        post = save_post(
            request.get_json() or {}
        )

        return jsonify({
            "success": True,
            "post": post
        }), 201

    except ValueError as exc:
        return jsonify({
            "success": False,
            "message":
                str(exc)
        }), 400

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                str(exc)
        }), 500


@app.route(
    "/api/admin/blog/<int:post_id>",
    methods=["PUT", "DELETE"]
)
@csrf_protected
@admin_required
def admin_blog_item(
    post_id,
    current_user=None
):

    if request.method == "DELETE":

        if not delete_post(post_id):
            return jsonify({
                "success": False,
                "message":
                    "Article not found"
            }), 404

        return jsonify({
            "success": True
        })

    try:
        post = save_post(
            request.get_json() or {},
            post_id=post_id
        )

        if not post:
            return jsonify({
                "success": False,
                "message":
                    "Article not found"
            }), 404

        return jsonify({
            "success": True,
            "post": post
        })

    except ValueError as exc:
        return jsonify({
            "success": False,
            "message":
                str(exc)
        }), 400

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                str(exc)
        }), 500


@app.route(
    "/api/admin/blog/generate",
    methods=["POST"]
)
@csrf_protected
@admin_required
def generate_blog_draft(
    current_user=None
):

    data = request.get_json() or {}

    if not data.get(
        "topic",
        ""
    ).strip():

        return jsonify({
            "success": False,
            "message":
                "Topic is required"
        }), 400

    prompt = f"""
Write an editable blog article draft as JSON
for university students.

Topic:
{data.get("topic", "")}

Audience:
{data.get("audience", "")}

Academic level:
{data.get("level", "")}

Category:
{data.get("category", "")}

Main points:
{data.get("mainPoints", "")}

Real-world examples:
{data.get("examples", "")}

Return JSON with:
title, excerpt, content, category.

Use Markdown in content.

Do not publish.
"""

    try:
        raw = call_ollama(
            prompt,
            temperature=0.5,
            response_format="json"
        ).strip()

        if raw.startswith("```json"):
            raw = raw[7:]

        if raw.endswith("```"):
            raw = raw[:-3]

        start = raw.find("{")
        end = raw.rfind("}")

        if start < 0 or end <= start:
            raise ValueError(
                "Ollama did not return a JSON blog draft"
            )

        draft = json.loads(
            raw[start:end + 1]
        )

        required = (
            "title",
            "excerpt",
            "content",
            "category"
        )

        missing = [
            field
            for field in required
            if not str(
                draft.get(field, "")
            ).strip()
        ]

        if missing:
            raise ValueError(
                "Ollama draft is missing: "
                +
                ", ".join(missing)
            )

        return jsonify({
            "success": True,
            "draft":
                draft
        })

    except Exception as exc:
        return jsonify({
            "success": False,
            "message":
                str(exc)
        }), 500


@app.route(
    "/api/admin/blog/<int:post_id>/publish",
    methods=["POST"]
)
@csrf_protected
@admin_required
def publish_blog(
    post_id,
    current_user=None
):

    post = set_status(
        post_id,
        "published"
    )

    if not post:
        return jsonify({
            "success": False,
            "message":
                "Article not found"
        }), 404

    if (
        request.get_json() or {}
    ).get("notifyStudents"):

        base_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:3000"
        )

        conn = get_db()

        try:
            students = conn.execute(
                """
                SELECT email
                FROM users
                WHERE role = 'student'
                """
            ).fetchall()
        finally:
            conn.close()

        for student in students:
            try:
                send_blog_notification(
                    student["email"],
                    post,
                    f"{base_url}/blog/{post['title']}"
                )
            except Exception as exc:
                print(
                    "Blog notification error:",
                    exc
                )

    return jsonify({
        "success": True,
        "post":
            post
    })


@app.route(
    "/api/admin/blog/<int:post_id>/unpublish",
    methods=["POST"]
)
@csrf_protected
@admin_required
def unpublish_blog(
    post_id,
    current_user=None
):

    post = set_status(
        post_id,
        "draft"
    )

    if not post:
        return jsonify({
            "success": False,
            "message":
                "Article not found"
        }), 404

    return jsonify({
        "success": True,
        "post":
            post
    })


# ============================================================
# ADMIN STATISTICS
# ============================================================

@app.route(
    "/api/admin/stats",
    methods=["GET"]
)
@admin_required
def admin_stats(current_user=None):

    conn = get_db()

    try:
        users = conn.execute(
            "SELECT COUNT(*) AS total FROM users"
        ).fetchone()["total"]
    finally:
        conn.close()

    chats = get_all_chat_records()

    return jsonify({
        "success": True,
        "users":
            users,
        "conversations":
            len(chats),
        "encrypted":
            True,
        "storage":
            "chat_data.json"
    })


# ============================================================
# ADMIN ENCRYPTED CHATS
# ============================================================

@app.route(
    "/api/admin/chats",
    methods=["GET"]
)
@admin_required
def admin_chats(current_user=None):

    chats = get_chat_summaries()

    conn = get_db()

    try:
        for chat in chats:

            raw_chat = get_chat_by_id(
                chat["id"]
            )

            decrypted = decrypt_chat_record(
                raw_chat
            )

            user = conn.execute(
                """
                SELECT name, email
                FROM users
                WHERE id = ?
                """,
                (decrypted["user_id"],)
            ).fetchone()

            chat["user_name"] = (
                user["name"]
                if user
                else "Unknown user"
            )

            chat["user_email"] = (
                user["email"]
                if user
                else "Unavailable"
            )

    finally:
        conn.close()

    return jsonify({
        "success": True,
        "chats":
            chats
    })


@app.route(
    "/api/admin/chats/<int:chat_id>/decrypt",
    methods=["POST"]
)
@csrf_protected
@admin_required
def admin_decrypt_chat(
    chat_id,
    current_user=None
):

    chat = get_chat_by_id(
        chat_id
    )

    if not chat:
        return jsonify({
            "success": False,
            "message":
                "Chat record not found"
        }), 404

    try:
        decrypted = decrypt_chat_record(
            chat
        )

        conn = get_db()

        try:
            user = conn.execute(
                """
                SELECT name, email
                FROM users
                WHERE id = ?
                """,
                (decrypted["user_id"],)
            ).fetchone()

        finally:
            conn.close()

        decrypted["user_name"] = (
            user["name"]
            if user
            else "Unknown user"
        )

        decrypted["user_email"] = (
            user["email"]
            if user
            else "Unavailable"
        )

        return jsonify({
            "success": True,
            "chat":
                decrypted
        })

    except Exception as exc:

        return jsonify({
            "success": False,
            "message":
                "Unable to decrypt chat record",
            "error":
                str(exc)
        }), 500


# ============================================================
# HEALTH
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    ollama_status = "not available"

    try:
        response = requests.get(
            "http://localhost:11434/api/tags",
            timeout=5
        )

        if response.ok:
            ollama_status = "running"

    except requests.exceptions.RequestException:
        pass

    return jsonify({
        "status":
            "healthy",
        "service":
            "StudyMate Backend",
        "ai_provider":
            "Ollama",
        "ollama":
            ollama_status,
        "model":
            OLLAMA_MODEL
    })

# ============================================================
# CODINGAI - codegemma4
# ============================================================

@app.route(
    "/api/code-chat",
    methods=["POST"]
)
@csrf_protected
@login_required
def code_chat(current_user=None):

    data = request.get_json() or {}

    message = data.get(
        "message",
        ""
    ).strip()

    language = data.get(
        "language",
        "Python"
    ).strip()

    task = data.get(
        "task",
        "Generate"
    ).strip()

    history = data.get(
        "history",
        []
    )

    # ------------------------------------------
    # VALIDATION
    # ------------------------------------------

    if not message:
        return jsonify({
            "success": False,
            "message":
                "Coding request is required"
        }), 400

    allowed_tasks = {
        "Generate",
        "Explain",
        "Debug",
        "Refactor"
    }

    if task not in allowed_tasks:
        return jsonify({
            "success": False,
            "message":
                "Invalid coding task"
        }), 400

    # Keep context small for local hardware
    history = history[-4:]

    # ------------------------------------------
    # CODING PROMPT
    # ------------------------------------------

    prompt = f"""
You are codegemma4, the coding specialist
inside StudyMate CodingAI.

Programming Language:
{language}

Coding Task:
{task}

Student Request:
{message}

Help the student solve the programming task.

Requirements:

1. Use the selected programming language.
2. Explain the solution clearly.
3. Generate correct and runnable code
   when code is required.
4. Include meaningful code comments.
5. For Debug tasks, identify the problem,
   explain why it occurs, and provide
   corrected code.
6. For Explain tasks, explain the code
   step by step.
7. For Refactor tasks, improve readability,
   structure, efficiency, and maintainability.
8. For Generate tasks, provide a complete
   working solution.
9. Include example input and output when
   appropriate.
10. Keep the explanation suitable for
    university students.
11. Do not use unnecessary libraries.
12. Do not discuss unrelated topics.

Return the answer directly to the student.
"""

    try:

        # --------------------------------------
        # CALL codegemma4
        # --------------------------------------

        answer = call_ollama(
            prompt=prompt,
            history=history,
            temperature=0.3,
            model=CODE_MODEL
        )

        return jsonify({
            "success": True,

            "provider":
                "Ollama",

            "model":
                CODE_MODEL,

            "language":
                language,

            "task":
                task,

            "message":
                answer
        }), 200

    except Exception as exc:

        print(
            "CodingAI Error:",
            exc
        )

        return jsonify({
            "success": False,
            "message":
                "Failed to generate coding response",
            "error":
                str(exc)
        }), 500



# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    print("--------------------------------")
    print("StudyMate Flask Backend")
    print("--------------------------------")
    print(
        "Server: http://127.0.0.1:5001"
    )
    print(
        "Ollama: " + OLLAMA_URL
    )
    print(
        "Model: " + OLLAMA_MODEL
    )
    print("--------------------------------")

    app.run(
        debug=True,
        port=int(
            os.getenv(
                "BACKEND_PORT",
                "5001"
            )
        )
    )