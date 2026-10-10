"""数据模型 — 字段衍生、排序、展示逻辑"""
import os, hashlib

ICONS = ["🚀","🎮","🛠️","📱","🌐","📦","⚙️","🎯","💡","🧩",
         "🕹️","🎨","📊","🔧","💻","🗡️","🏰","👾","🎲","🐾",
         "✨","🧪","📋","🏗️","🪐"]

DEMOS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demos")


def has_demo(pid: str) -> bool:
    d = os.path.join(DEMOS_DIR, pid)
    return os.path.isdir(d) and os.path.isfile(os.path.join(d, "index.html"))


def enrich(p):
    """为项目字典添加展示用衍生字段"""
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

    # 稳定图标（用 id 的 SHA256 取模，避免 hash() 跨进程不稳定）
    h = int(hashlib.sha256(p["id"].encode()).hexdigest(), 16)
    p["icon"] = ICONS[h % len(ICONS)]
    return p
