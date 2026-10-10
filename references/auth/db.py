"""认证数据库 — 用户账号 + JWT 密钥管理

所有新开发的项目统一走 data.db，不再单独维护 auth.db。
"""
import os, sqlite3, secrets

DB_PATH = os.path.expanduser("~/dev-projects/core-server/data.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    """确保 config 表 + JWT 密钥存在（users 表由 core-server 管理）"""
    db = get_db()
    db.execute("""CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )""")
    existing = db.execute("SELECT value FROM config WHERE key='jwt_secret'").fetchone()
    if not existing:
        db.execute("INSERT INTO config VALUES ('jwt_secret', ?)", (secrets.token_hex(32),))
    db.commit()
    db.close()


def get_config(key: str) -> str:
    db = get_db()
    row = db.execute("SELECT value FROM config WHERE key=?", (key,)).fetchone()
    db.close()
    return row["value"] if row else ""


def create_user(username: str, password_hash: str) -> bool:
    db = get_db()
    try:
        db.execute(
            "INSERT INTO users (app_id, uid, password_hash) VALUES ('hermes-chat', ?, ?)",
            (username, password_hash),
        )
        db.commit()
        db.close()
        return True
    except sqlite3.IntegrityError:
        db.close()
        return False


def get_user(username: str) -> dict | None:
    db = get_db()
    row = db.execute("SELECT * FROM users WHERE uid=?", (username,)).fetchone()
    db.close()
    return dict(row) if row else None
