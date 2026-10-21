from datetime import datetime, timezone
from apscheduler.schedulers.background import BackgroundScheduler

from database import get_db
from email_service import send_reminder

scheduler = BackgroundScheduler(daemon=True)


def _deliver(reminder_id):
    conn = get_db()
    try:
        reminder = conn.execute("""SELECT reminders.*, users.email FROM reminders JOIN users ON users.id = reminders.user_id WHERE reminders.id = ? AND reminders.status = 'scheduled'""", (reminder_id,)).fetchone()
        if not reminder:
            return
        send_reminder(reminder["email"], dict(reminder))
        conn.execute("UPDATE reminders SET status = 'sent' WHERE id = ?", (reminder_id,))
        conn.commit()
    except Exception as exc:
        print("Reminder delivery error:", exc)
    finally:
        conn.close()


def start_scheduler():
    if not scheduler.running:
        scheduler.start()
    conn = get_db()
    try:
        reminders = conn.execute("SELECT id, reminder_datetime FROM reminders WHERE status = 'scheduled'").fetchall()
    finally:
        conn.close()
    for reminder in reminders:
        schedule_reminder(reminder["id"], reminder["reminder_datetime"])


def schedule_reminder(reminder_id, reminder_datetime):
    due = datetime.fromisoformat(reminder_datetime.replace("Z", "+00:00"))
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)
    scheduler.add_job(_deliver, "date", run_date=due, args=[reminder_id], id=f"reminder-{reminder_id}", replace_existing=True)


def create_reminder(user_id, data):
    reminder_datetime = data.get("reminder_datetime") or data.get("dateTime")
    if not data.get("subject") or not data.get("topic") or not reminder_datetime:
        raise ValueError("Subject, topic, and reminder date/time are required")
    datetime.fromisoformat(reminder_datetime.replace("Z", "+00:00"))
    conn = get_db()
    try:
        cursor = conn.execute("""INSERT INTO reminders (user_id, subject, topic, reminder_datetime, status, created_at) VALUES (?, ?, ?, ?, 'scheduled', ?)""", (user_id, data["subject"].strip(), data["topic"].strip(), reminder_datetime, datetime.now(timezone.utc).isoformat()))
        conn.commit()
        reminder_id = cursor.lastrowid
    finally:
        conn.close()
    schedule_reminder(reminder_id, reminder_datetime)
    return reminder_id
