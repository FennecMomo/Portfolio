#!/usr/bin/env python3
"""Portfolio — 个人作品展示站（入口，公开访问）"""
import os, jwt, time, zipfile, shutil
from flask import Flask, render_template_string, abort, request, jsonify, session, make_response, redirect, send_from_directory

from db import get_config, get_projects, get_project, upsert_project, delete_project
from models import enrich, has_demo
from templates import TEMPLATE, ADMIN_TEMPLATE

# 管理 API 才需要认证
import sys
sys.path.insert(0, "/home/ubuntu/dev-projects")
from auth.shared import require_auth, JWT_SECRET

app = Flask(__name__)
app.secret_key = os.urandom(24).hex()
app.jinja_env.globals["has_demo"] = has_demo

ADMIN_USER = os.environ.get("ADMIN_USER", "CHANGE_ME_ADMIN_USER")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "CHANGE_ME_ADMIN_PASSWORD")
DEMOS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demos")
os.makedirs(DEMOS_DIR, exist_ok=True)


@app.route("/")
def index():
    config = get_config()
    sort = request.args.get("sort", "completion")
    projects = [enrich(p) for p in get_projects(sort)]
    data = {**config, "projects": projects}
    return render_template_string(TEMPLATE, data=data, project=None, sort=sort)


@app.route("/project/<pid>")
def project_page(pid):
    config = get_config()
    proj = get_project(pid)
    if not proj:
        abort(404)
    sort = request.args.get("sort", "completion")
    proj = enrich(proj)
    data = {**config, "projects": []}
    return render_template_string(TEMPLATE, data=data, project=proj, sort=sort)


# 公开读取 API
@app.route("/api/projects", methods=["GET"])
def api_list():
    sort = request.args.get("sort", "completion")
    return jsonify([enrich(p) for p in get_projects(sort)])


@app.route("/api/project/<pid>", methods=["GET"])
def api_get(pid):
    proj = get_project(pid)
    return jsonify(proj) if proj else ("Not found", 404)


# 管理 API（需登录）
@app.route("/api/project", methods=["POST"])
@require_auth
def api_save():
    upsert_project(request.get_json())
    return jsonify({"ok": True})


@app.route("/api/project/<pid>", methods=["DELETE"])
@require_auth
def api_delete(pid):
    delete_project(pid)
    return jsonify({"ok": True})


# ── Demo 静态网页 ──
@app.route("/demo/<pid>/")
def demo_index(pid):
    demo_dir = os.path.join(DEMOS_DIR, pid)
    if not os.path.isfile(os.path.join(demo_dir, "index.html")):
        abort(404)
    return send_from_directory(demo_dir, "index.html")


@app.route("/demo/<pid>/<path:filename>")
def demo_file(pid, filename):
    return send_from_directory(os.path.join(DEMOS_DIR, pid), filename)


# ── 管理后台 ──
@app.route("/admin", methods=["GET", "POST"])
def admin():
    if request.method == "POST":
        username = (request.form.get("username") or "").strip()
        password = (request.form.get("password") or "").strip()
        if username == ADMIN_USER and password == ADMIN_PASS:
            session["admin"] = True
            token = jwt.encode(
                {"sub": username, "iat": int(time.time()), "exp": int(time.time()) + 86400 * 7},
                JWT_SECRET, algorithm="HS256",
            )
            resp = make_response(redirect("/admin"))
            resp.set_cookie("hermes_auth", token, domain=".fennecmomo.top", path="/",
                            max_age=86400 * 7, httponly=True, samesite="Lax")
            return resp
        projects = get_projects("updated")
        return render_template_string(ADMIN_TEMPLATE, error="账号或密码错误", logged_in=False, projects=projects)

    if not session.get("admin"):
        projects = get_projects("updated")
        return render_template_string(ADMIN_TEMPLATE, error=None, logged_in=False, projects=projects)

    projects = [enrich(p) for p in get_projects("updated")]
    return render_template_string(ADMIN_TEMPLATE, error=None, logged_in=True, projects=projects)


@app.route("/admin/logout")
def admin_logout():
    session.pop("admin", None)
    resp = make_response(redirect("/admin"))
    resp.set_cookie("hermes_auth", "", domain=".fennecmomo.top", path="/", max_age=0)
    return resp


@app.route("/admin/upload/<pid>", methods=["POST"])
@require_auth
def admin_upload_demo(pid):
    f = request.files.get("demo")
    if not f or not f.filename:
        return jsonify({"ok": False, "error": "请选择文件"}), 400
    if not f.filename.lower().endswith(".zip"):
        return jsonify({"ok": False, "error": "仅支持 .zip 文件"}), 400

    demo_dir = os.path.join(DEMOS_DIR, pid)
    if os.path.exists(demo_dir):
        shutil.rmtree(demo_dir)
    os.makedirs(demo_dir)

    tmp = os.path.join(DEMOS_DIR, f"_{pid}_tmp.zip")
    f.save(tmp)
    try:
        with zipfile.ZipFile(tmp, "r") as zf:
            zf.extractall(demo_dir)
    except zipfile.BadZipFile:
        os.remove(tmp)
        return jsonify({"ok": False, "error": "无效的 zip 文件"}), 400
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)

    # 如果解压后有一个顶层文件夹，提出来
    items = os.listdir(demo_dir)
    if len(items) == 1 and os.path.isdir(os.path.join(demo_dir, items[0])):
        inner = os.path.join(demo_dir, items[0])
        for fn in os.listdir(inner):
            shutil.move(os.path.join(inner, fn), os.path.join(demo_dir, fn))
        os.rmdir(inner)

    if not os.path.isfile(os.path.join(demo_dir, "index.html")):
        return jsonify({"ok": False, "error": "zip 中未找到 index.html"}), 400

    return jsonify({"ok": True, "url": f"/demo/{pid}/"})


@app.route("/admin/delete-demo/<pid>", methods=["POST"])
@require_auth
def admin_delete_demo(pid):
    demo_dir = os.path.join(DEMOS_DIR, pid)
    if os.path.exists(demo_dir):
        shutil.rmtree(demo_dir)
    return jsonify({"ok": True})


# ── projs：作品子目录（静态目录，丢文件即生效）──
PROJS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "projs")
os.makedirs(PROJS_DIR, exist_ok=True)


@app.route("/projs/")
def projs_index():
    items = []
    for name in sorted(os.listdir(PROJS_DIR)):
        if name.startswith("."):
            continue
        full = os.path.join(PROJS_DIR, name)
        if os.path.isdir(full):
            items.append((name + "/", f"/projs/{name}/"))
        else:
            items.append((name, f"/projs/{name}"))
    rows = "".join(f'<li><a href="{u}">{n}</a></li>' for n, u in items) or "<li>（空）</li>"
    return (
        '<!DOCTYPE html><html lang="zh"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1"><title>作品目录</title>'
        "<style>body{font-family:system-ui;margin:40px;background:#111;color:#eee}"
        "a{color:#7cf}</style></head><body><h2>作品目录 /projs/</h2><ul>" + rows + "</ul></body></html>"
    )


@app.route("/projs/<path:filename>")
def projs_file(filename):
    return send_from_directory(PROJS_DIR, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8766, debug=False)
