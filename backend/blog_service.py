from datetime import datetime, timezone
from database import get_db


def _post_row(row):
    return dict(row) if row else None


def list_posts(include_drafts=False, category=None, search=None):
    query = "SELECT * FROM blog_posts"
    clauses = []
    params = []
    if not include_drafts:
        clauses.append("status = 'published'")
    if category and category != "all":
        clauses.append("category = ?")
        params.append(category)
    if search:
        clauses.append("(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)")
        term = f"%{search}%"
        params.extend([term, term, term])
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY datetime(created_at) DESC"
    conn = get_db()
    try:
        return [dict(row) for row in conn.execute(query, params).fetchall()]
    finally:
        conn.close()


def get_post(slug):
    conn = get_db()
    try:
        return _post_row(conn.execute("SELECT * FROM blog_posts WHERE slug = ?", (slug,)).fetchone())
    finally:
        conn.close()


def get_post_by_id(post_id):
    conn = get_db()
    try:
        return _post_row(conn.execute("SELECT * FROM blog_posts WHERE id = ?", (post_id,)).fetchone())
    finally:
        conn.close()


def save_post(data, post_id=None):
    now = datetime.now(timezone.utc).isoformat()
    values = (
        data.get("title", "").strip(), data.get("slug", "").strip(),
        data.get("category", "Study Skills").strip(), data.get("excerpt", "").strip(),
        data.get("content", "").strip(), data.get("author", "StudyMate Team").strip(),
        data.get("status", "draft") if data.get("status") in ("draft", "published") else "draft",
    )
    if not values[0] or not values[1] or not values[4]:
        raise ValueError("Title, slug, and content are required")
    conn = get_db()
    try:
        if post_id:
            conn.execute("""UPDATE blog_posts SET title=?, slug=?, category=?, excerpt=?, content=?, author=?, status=?, updated_at=? WHERE id=?""", (*values, now, post_id))
        else:
            conn.execute("""INSERT INTO blog_posts (title, slug, category, excerpt, content, author, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""", (*values, now, now))
        conn.commit()
        return get_post_by_id(post_id or conn.execute("SELECT last_insert_rowid()").fetchone()[0])
    finally:
        conn.close()


def delete_post(post_id):
    conn = get_db()
    try:
        cursor = conn.execute("DELETE FROM blog_posts WHERE id = ?", (post_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def set_status(post_id, status):
    conn = get_db()
    try:
        conn.execute("UPDATE blog_posts SET status=?, updated_at=? WHERE id=?", (status, datetime.now(timezone.utc).isoformat(), post_id))
        conn.commit()
        return get_post_by_id(post_id)
    finally:
        conn.close()
