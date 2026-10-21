import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))


def _mail_config():
    return {
        "host": os.getenv("MAIL_HOST", ""),
        "port": int(os.getenv("MAIL_PORT", "587")),
        "username": os.getenv("MAIL_USERNAME", ""),
        "password": os.getenv("MAIL_PASSWORD", ""),
        "sender": os.getenv("MAIL_FROM") or os.getenv("MAIL_USERNAME", ""),
        "use_tls": os.getenv("MAIL_USE_TLS", "true").lower() == "true",
        "use_auth": os.getenv("MAIL_USE_AUTH", "true").lower() == "true",
    }


def send_email(recipient, subject, body):
    config = _mail_config()
    missing = [key for key in ("host", "sender") if not config[key]]
    if missing:
        raise RuntimeError("SMTP is not configured. Missing: " + ", ".join(missing))

    message = EmailMessage()
    message["From"] = config["sender"]
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(config["host"], config["port"], timeout=30) as server:
        if config["use_tls"]:
            server.starttls()
        if config["use_auth"]:
            if not config["username"] or not config["password"]:
                raise RuntimeError("SMTP authentication is enabled but credentials are missing")
            server.login(config["username"], config["password"])
        server.send_message(message)


def send_feedback(sender, data):
    body = f"""StudyMate User Feedback

From: {sender.get('name', 'StudyMate user')}
Email: {sender.get('email', '')}
Category: {data.get('category', 'General feedback')}
Subject: {data.get('subject', 'StudyMate feedback')}

Message:
{data.get('message', '')}
"""
    send_email(
        "admin@mailcore.com",
        f"StudyMate feedback: {data.get('subject', 'New feedback')}",
        body
    )


def send_study_summary(recipient, data):
    key_points = "\n".join(f"- {point}" for point in data.get("keyPoints", [])) or "- See the study summary above."
    next_steps = "\n".join(f"- {step}" for step in data.get("nextSteps", [])) or "- Review the topic and practise with questions."
    body = f"""StudyMate
Study Session Summary

Subject: {data.get('subject', '')}
Topic: {data.get('topic', '')}
AI Model: {data.get('model', 'Ollama')}

Study Summary:
{data.get('summary', '')}

Key Learning Points:
{key_points}

Suggested Next Steps:
{next_steps}
"""
    send_email(recipient, f"StudyMate study summary: {data.get('topic', 'Study session')}", body)


def send_prompt(recipient, data):
    body = f"""StudyMate
Your Generated Study Prompt

Subject: {data.get('subject', '')}
Topic: {data.get('topic', '')}

{data.get('prompt', '')}
"""
    send_email(recipient, data.get("subject") or "Your StudyMate generated prompt", body)


def send_blog_notification(recipient, post, article_url):
    body = f"""New StudyMate Learning Resource

Title: {post['title']}
Category: {post['category']}

{post.get('excerpt', '')}

Read Article -> {article_url}
"""
    send_email(recipient, f"New StudyMate resource: {post['title']}", body)


def send_reminder(recipient, reminder):
    body = f"""StudyMate Study Reminder

Subject: {reminder['subject']}
Topic: {reminder['topic']}

It is time to study this topic.
"""
    send_email(recipient, f"Study reminder: {reminder['topic']}", body)
