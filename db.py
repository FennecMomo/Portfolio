"""数据库层 — 连接与 CRUD"""
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), "db.sqlite")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def get_config():
    db = get_db()
    rows = db.execute("SELECT key, value FROM config").fetchall()
    db.close()
    return {r["key"]: r["value"] for r in rows}

def get_projects(sort="completion"):
    db = get_db()
    order = {
        "name": "name ASC",
        "updated": "updated DESC",
    }.get(sort, "completion DESC")
    rows = db.execute(f"SELECT * FROM projects ORDER BY {order}").fetchall()
    db.close()
    return [dict(r) for r in rows]

def get_project(pid):
    db = get_db()
    row = db.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone()
    db.close()
    return dict(row) if row else None

def upsert_project(data):
    """插入或更新项目"""
    db = get_db()
    cols = ["id","name","tag","summary","detail","link","completion","status","type","updated"]
    vals = [data.get(c, "") for c in cols]
    # 获取当前最大 sort_order
    max_ord = db.execute("SELECT MAX(sort_order) FROM projects").fetchone()[0] or 0
    db.execute("""
        INSERT INTO projects (id,name,tag,summary,detail,link,completion,status,type,updated,sort_order)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name, tag=excluded.tag, summary=excluded.summary,
            detail=excluded.detail, link=excluded.link, completion=excluded.completion,
            status=excluded.status, type=excluded.type, updated=excluded.updated
    """, vals + [max_ord + 1 if not data.get("id") else None])  # 新项目加末尾
    db.commit()
    db.close()

def delete_project(pid):
    db = get_db()
    db.execute("DELETE FROM projects WHERE id = ?", (pid,))
    db.commit()
    db.close()

def update_config(key, value):
    db = get_db()
    db.execute("INSERT INTO config VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (key, value))
    db.commit()
    db.close()
