"""共享认证中间件 — 其他应用导入此模块即可接入认证

用法:
    from auth.shared import require_auth, get_current_user

    @app.route("/")
    @require_auth
    def index():
        user = get_current_user(request)
        return f"Hello {user}"
"""

import functools, jwt, os, importlib.util
from flask import request, redirect

# 直接用文件路径加载 db.py，不污染 sys.path
_here = os.path.dirname(os.path.abspath(__file__))
_db_spec = importlib.util.spec_from_file_location("auth_db", os.path.join(_here, "db.py"))
_db = importlib.util.module_from_spec(_db_spec)
_db_spec.loader.exec_module(_db)

# 初始化（确保 DB 和密钥存在）
_db.init_db()
JWT_SECRET = _db.get_config("jwt_secret")
AUTH_URL = "https://auth.fennecmomo.top"


def require_auth(f):
    """装饰器：未登录则跳转登录页"""

    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        token = request.cookies.get("hermes_auth", "")
        if not token or not _verify_token(token):
            current = request.url
            return redirect(f"{AUTH_URL}/login?redirect={current}")
        return f(*args, **kwargs)

    return wrapper


def get_current_user(req) -> str | None:
    """从请求中提取当前用户名，未登录返回 None"""
    token = req.cookies.get("hermes_auth", "")
    payload = _verify_token(token)
    return payload["sub"] if payload else None


def _verify_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
