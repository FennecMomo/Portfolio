#!/usr/bin/env python3
"""Portfolio — 个人作品展示站"""
import json, os
from flask import Flask, render_template_string, abort, request

DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")
TEMPLATE = r"""<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0"><title>{{data.name}} - Portfolio</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,"Microsoft YaHei",sans-serif;background:#0f0f1a;color:#e0e0e0;min-height:100vh}
.wrap{max-width:920px;margin:0 auto;padding:60px 20px 80px}
.hero{text-align:center;margin-bottom:40px}
.hero h1{font-size:22px;background:linear-gradient(135deg,#a78bfa,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
.hero .sub{color:#888;font-size:13px;line-height:1.8}
.hero .avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#60a5fa);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px}
.bar{display:flex;align-items:center;gap:10px;margin-bottom:24px;justify-content:flex-end}
.bar label{color:#888;font-size:12px}
.bar select{background:#1a1a2e;color:#e0e0e0;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:6px 10px;font-size:12px;font-family:inherit;cursor:pointer}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.card{background:#1a1a2e;border-radius:10px;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;border:1px solid rgba(255,255,255,0.05)}
.card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.4);border-color:rgba(167,139,250,0.3)}
.card-img{height:110px;background:linear-gradient(135deg,#1e1e3a,#2a1a3e);display:flex;align-items:center;justify-content:center;font-size:30px}
.card-body{padding:12px 14px 14px}
.card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.card-tag{font-size:10px;color:#a78bfa;letter-spacing:1px}
.card-status{font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600}
.status-running{background:rgba(76,175,80,0.2);color:#81c784}
.status-dev{background:rgba(255,152,0,0.2);color:#ffb74d}
.status-done{background:rgba(33,150,243,0.2);color:#64b5f6}
.status-archived{background:rgba(158,158,158,0.2);color:#9e9e9e}
.card h3{font-size:14px;margin-bottom:2px;color:#fff}
.card p{font-size:11px;color:#999;line-height:1.5;margin-bottom:6px}
.card-meta{display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#666}
.progress-wrap{height:3px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:6px;overflow:hidden}
.progress-bar{height:100%;border-radius:2px;transition:width .5s}
.progress-high{background:linear-gradient(90deg,#66bb6a,#aed581)}
.progress-mid{background:linear-gradient(90deg,#ffa726,#ffcc80)}
.progress-low{background:linear-gradient(90deg,#78909c,#b0bec5)}
.back{color:#a78bfa;text-decoration:none;font-size:13px;display:inline-block;margin-bottom:24px;cursor:pointer}
.back:hover{color:#c4b5fd}
.detail{background:#1a1a2e;border-radius:10px;padding:28px;border:1px solid rgba(255,255,255,0.05)}
.detail h1{font-size:24px;margin-bottom:4px}
.detail .meta-row{display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.detail .meta-row span{font-size:12px;padding:3px 8px;border-radius:4px}
.detail .desc{color:#ccc;font-size:14px;line-height:1.9;margin-bottom:20px}
.detail .btn{display:inline-block;padding:8px 20px;background:linear-gradient(135deg,#a78bfa,#60a5fa);color:#fff;border-radius:8px;text-decoration:none;font-size:13px;transition:opacity .2s}
.detail .btn:hover{opacity:.9}
.footer{text-align:center;color:#555;font-size:11px;margin-top:40px}
</style></head><body>
<div class="wrap">
{% if project %}
<div><a class="back" href="/?sort={{sort}}">← 返回作品集</a></div>
<div class="detail">
  <h1>{{project.name}}</h1>
  <div class="meta-row">
    <span class="card-status status-{{project.status_css}}">{{project.status}}</span>
    <span style="color:#a78bfa;background:rgba(167,139,250,0.1)">{{project.type}}</span>
    <span style="color:#888;background:rgba(255,255,255,0.05)">完成度 {{project.completion}}%</span>
    <span style="color:#888;background:rgba(255,255,255,0.05)">更新于 {{project.updated}}</span>
  </div>
  <div class="desc">{{project.detail}}</div>
  {% if project.link %}<a class="btn" href="{{project.link}}" target="_blank">🔗 访问项目</a>{% endif %}
</div>
{% else %}
<div class="hero">
  <div class="avatar">🪐</div>
  <h1>{{data.name}}</h1>
  <div class="sub">{{data.intro|safe}}</div>
</div>
<div class="bar">
  <label>排序：</label>
  <select onchange="location='?sort='+this.value">
    <option value="completion" {% if sort=='completion' %}selected{% endif %}>完成度 ↓</option>
    <option value="name" {% if sort=='name' %}selected{% endif %}>名称 A-Z</option>
    <option value="updated" {% if sort=='updated' %}selected{% endif %}>最近更新</option>
  </select>
</div>
<div class="grid">
{% for p in data.projects %}
  <div class="card" onclick="location='/project/{{p.id}}?sort={{sort}}'">
    <div class="card-img">{{p.icon}}</div>
    <div class="card-body">
      <div class="card-top">
        <div class="card-tag">{{p.type}}</div>
        <div class="card-status status-{{p.status_css}}">{{p.status}}</div>
      </div>
      <h3>{{p.name}}</h3>
      <p>{{p.summary}}</p>
      <div class="card-meta">
        <span>{{p.completion}}%</span>
        <span>{{p.updated}}</span>
      </div>
      <div class="progress-wrap"><div class="progress-bar {{p.progress_css}}" style="width:{{p.completion}}%"></div></div>
    </div>
  </div>
{% endfor %}
</div>
{% endif %}
<div class="footer">© {{data.name}} · Powered by Flask + Cloudflare</div>
</div>
</body></html>"""

app = Flask(__name__)

def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

ICONS = ["🚀","🎮","🛠️","📱","🌐","📦","⚙️","🎯","💡","🧩",
         "🕹️","🎨","📊","🔧","💻","🗡️","🏰","👾","🎲","🐾",
         "✨","🧪","📋","🏗️","🪐"]

def enrich(p):
    """Add derived fields for display"""
    c = p.get("completion", 0)
    p["progress_css"] = "progress-high" if c >= 80 else ("progress-mid" if c >= 40 else "progress-low")
    s = p.get("status", "")
    if s in ("运行中","日常使用","已发布","已完成","维护中"):
        p["status_css"] = "running"
    elif s in ("开发中","重构中","暂停中","待找回","待合并"):
        p["status_css"] = "dev"
    elif s in ("已归档","已废弃"):
        p["status_css"] = "archived"
    else:
        p["status_css"] = "done"
    p["icon"] = ICONS[hash(p["id"]) % len(ICONS)]
    return p

@app.route("/")
def index():
    data = load_data()
    sort = request.args.get("sort", "completion")
    projects = [enrich(p) for p in data["projects"]]
    
    if sort == "name":
        projects.sort(key=lambda p: p["name"])
    elif sort == "updated":
        projects.sort(key=lambda p: p["updated"], reverse=True)
    else:
        projects.sort(key=lambda p: p["completion"], reverse=True)
    
    data["projects"] = projects
    return render_template_string(TEMPLATE, data=data, project=None, sort=sort)

@app.route("/project/<pid>")
def project_page(pid):
    data = load_data()
    proj = next((p for p in data["projects"] if p["id"] == pid), None)
    if not proj:
        abort(404)
    sort = request.args.get("sort", "completion")
    proj = enrich(proj)
    return render_template_string(TEMPLATE, data=data, project=proj, sort=sort)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8766, debug=False)
