"""HTML 模板"""
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
  {% if has_demo(project.id) %}
  <a class="btn" href="/demo/{{project.id}}/" target="_blank">🎮 在线演示</a>
  {% endif %}
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

ADMIN_TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Portfolio 管理后台</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,"Microsoft YaHei",sans-serif;background:#0f0f1a;color:#e0e0e0;min-height:100vh}
.wrap{max-width:1100px;margin:0 auto;padding:40px 20px}
h1{font-size:20px;background:linear-gradient(135deg,#a78bfa,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:24px}
/* Login */
.login-box{max-width:360px;margin:100px auto;background:#1a1a2e;border-radius:10px;padding:40px;border:1px solid rgba(255,255,255,0.05);text-align:center}
.login-box h2{font-size:18px;margin-bottom:8px;color:#fff}
.login-box .sub{color:#888;font-size:12px;margin-bottom:24px}
.login-box input{width:100%;background:#0f0f1a;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 14px;color:#e0e0e0;font-size:14px;margin-bottom:12px;font-family:inherit;outline:none}
.login-box input:focus{border-color:#a78bfa}
.login-box button{width:100%;padding:10px;background:linear-gradient(135deg,#a78bfa,#60a5fa);color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;font-family:inherit}
.login-box .err{color:#f87171;font-size:12px;margin-top:8px}
/* Header bar */
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px}
.header .actions{display:flex;gap:10px}
.btn{padding:8px 18px;border-radius:6px;font-size:13px;cursor:pointer;border:none;font-family:inherit;transition:opacity .2s}
.btn:hover{opacity:.9}
.btn-primary{background:linear-gradient(135deg,#a78bfa,#60a5fa);color:#fff}
.btn-outline{background:transparent;border:1px solid rgba(255,255,255,0.15);color:#ccc}
.btn-danger{background:rgba(248,113,113,0.15);color:#f87171;border:1px solid rgba(248,113,113,0.2)}
.btn-sm{padding:4px 10px;font-size:11px}
/* Table */
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse}
th,td{padding:10px 14px;text-align:left;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap}
th{color:#888;font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
tr:hover{background:rgba(255,255,255,0.02)}
td.name-col{color:#fff;font-weight:500}
td.tag-col{color:#a78bfa;font-size:11px}
td.summary-col{color:#999;font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis}
.status-badge{font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600}
.s-running{background:rgba(76,175,80,0.2);color:#81c784}
.s-dev{background:rgba(255,152,0,0.2);color:#ffb74d}
.s-done{background:rgba(33,150,243,0.2);color:#64b5f6}
.s-archived{background:rgba(158,158,158,0.2);color:#9e9e9e}
.act-cell{display:flex;gap:4px}
/* Modal */
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:100;align-items:center;justify-content:center}
.modal-overlay.show{display:flex}
.modal{background:#1a1a2e;border-radius:10px;padding:32px;width:90%;max-width:560px;max-height:85vh;overflow-y:auto;border:1px solid rgba(255,255,255,0.08)}
.modal h2{font-size:18px;margin-bottom:20px;color:#fff}
.modal label{display:block;font-size:11px;color:#888;margin-bottom:4px;margin-top:12px}
.modal label:first-of-type{margin-top:0}
.modal input,.modal textarea,.modal select{width:100%;background:#0f0f1a;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:8px 12px;color:#e0e0e0;font-size:13px;font-family:inherit;outline:none;resize:vertical}
.modal textarea{min-height:60px}
.modal input:focus,.modal textarea:focus,.modal select:focus{border-color:#a78bfa}
.modal .row{display:flex;gap:12px}
.modal .row>div{flex:1}
.modal .btns{display:flex;gap:10px;margin-top:20px;justify-content:flex-end}
.toast{position:fixed;top:20px;right:20px;background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);padding:12px 20px;border-radius:8px;font-size:13px;z-index:200;opacity:0;transition:opacity .3s}
.toast.show{opacity:1}
.toast.success{border-color:rgba(76,175,80,0.4);color:#81c784}
.toast.error{border-color:rgba(248,113,113,0.4);color:#f87171}
@media(max-width:768px){.modal .row{flex-direction:column;gap:0}}
</style>
</head><body>
{% if not logged_in %}
<div class="login-box">
  <h2>🔐 Portfolio 管理后台</h2>
  <div class="sub">请输入账号密码</div>
  <form method="post">
    <input name="username" placeholder="账号" required autofocus>
    <input name="password" type="password" placeholder="密码" required>
    <button type="submit">登 录</button>
    {% if error %}<div class="err">{{ error }}</div>{% endif %}
  </form>
</div>
{% else %}
<div class="wrap">
  <h1>📋 Portfolio 管理后台</h1>
  <div class="header">
    <span style="color:#888;font-size:12px">共 {{ projects|length }} 个项目</span>
    <div class="actions">
      <a class="btn btn-outline" href="/" target="_blank">预览前台</a>
      <button class="btn btn-primary" onclick="openModal()">+ 新增作品</button>
      <a class="btn btn-outline" href="/admin/logout">退出</a>
    </div>
  </div>
  <div class="table-wrap">
    <table>
      <thead><tr>
        <th>ID</th><th>名称</th><th>类型</th><th>状态</th><th>进度</th><th>Demo</th><th>简介</th><th>更新</th><th>操作</th>
      </tr></thead>
      <tbody>
      {% for p in projects %}
      <tr>
        <td style="color:#666;font-size:11px">{{ p.id }}</td>
        <td class="name-col">{{ p.name }}</td>
        <td class="tag-col">{{ p.type }}</td>
        <td><span class="status-badge s-{{ p.status_css }}">{{ p.status }}</span></td>
        <td>{{ p.completion }}%</td>
        <td>
          {% if has_demo(p.id) %}
          <a href="/demo/{{ p.id }}/" target="_blank" style="color:#81c784;font-size:11px;text-decoration:none">✓ 查看</a>
          {% else %}<span style="color:#555;font-size:11px">—</span>{% endif %}
        </td>
        <td class="summary-col">{{ p.summary }}</td>
        <td style="color:#888;font-size:11px">{{ p.updated }}</td>
        <td class="act-cell">
          <button class="btn btn-outline btn-sm" onclick='editProject({{ p|tojson }})'>编辑</button>
          <button class="btn btn-outline btn-sm" onclick='uploadDemo("{{ p.id }}")'>传Demo</button>
          <button class="btn btn-danger btn-sm" onclick='deleteProject("{{ p.id }}")'>删除</button>
        </td>
      </tr>
      {% endfor %}
      </tbody>
    </table>
  </div>
</div>
{% endif %}

<div class="modal-overlay" id="modal">
  <div class="modal">
    <h2 id="modalTitle">新增作品</h2>
    <form onsubmit="saveProject(event)">
      <input type="hidden" id="fid" value="">
      <label>ID（英文标识）</label><input id="fid_disp" required placeholder="my-project">
      <label>名称</label><input id="fname" required placeholder="作品名称">
      <label>标签</label><input id="ftag" placeholder="Web · AI">
      <div class="row">
        <div><label>类型</label><input id="ftype" placeholder="Web应用"></div>
        <div><label>状态</label>
          <select id="fstatus">
            <option value="运行中">运行中</option>
            <option value="开发中">开发中</option>
            <option value="已完成">已完成</option>
            <option value="已归档">已归档</option>
          </select>
        </div>
        <div><label>完成度 %</label><input id="fcompletion" type="number" min="0" max="100" value="0"></div>
      </div>
      <label>简介</label><input id="fsummary" placeholder="一句话描述">
      <label>详细介绍</label><textarea id="fdetail" rows="3" placeholder="详细描述..."></textarea>
      <label>链接</label><input id="flink" placeholder="https://...">
      <label>更新日期</label><input id="fupdated" type="date">
      <div class="btns">
        <button type="button" class="btn btn-outline" onclick="closeModal()">取消</button>
        <button type="submit" class="btn btn-primary">保 存</button>
      </div>
    </form>
  </div>
</div>
<div class="toast" id="toast"></div>
<input type="file" id="demoFile" accept=".zip" style="display:none" onchange="handleDemoUpload(event)">

<script>
const API = '/api/project';
const modal = document.getElementById('modal');
const toast = document.getElementById('toast');

function openModal(data) {
  const isEdit = !!data;
  document.getElementById('modalTitle').textContent = isEdit ? '编辑作品' : '新增作品';
  document.getElementById('fid').value = isEdit ? data.id : '';
  const disp = document.getElementById('fid_disp');
  disp.value = isEdit ? data.id : '';
  disp.readOnly = isEdit;
  document.getElementById('fname').value = isEdit ? data.name||'' : '';
  document.getElementById('ftag').value = isEdit ? data.tag||'' : '';
  document.getElementById('ftype').value = isEdit ? data.type||'' : '';
  document.getElementById('fstatus').value = isEdit ? data.status||'开发中' : '开发中';
  document.getElementById('fcompletion').value = isEdit ? data.completion||0 : 0;
  document.getElementById('fsummary').value = isEdit ? data.summary||'' : '';
  document.getElementById('fdetail').value = isEdit ? data.detail||'' : '';
  document.getElementById('flink').value = isEdit ? data.link||'' : '';
  document.getElementById('fupdated').value = isEdit ? data.updated||today() : today();
  modal.classList.add('show');
}

function closeModal() { modal.classList.remove('show'); }

function today() {
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function editProject(p) { openModal(p); }

async function saveProject(e) {
  e.preventDefault();
  const data = {
    id: document.getElementById('fid_disp').value.trim(),
    name: document.getElementById('fname').value.trim(),
    tag: document.getElementById('ftag').value.trim(),
    type: document.getElementById('ftype').value.trim(),
    status: document.getElementById('fstatus').value,
    completion: parseInt(document.getElementById('fcompletion').value)||0,
    summary: document.getElementById('fsummary').value.trim(),
    detail: document.getElementById('fdetail').value.trim(),
    link: document.getElementById('flink').value.trim(),
    updated: document.getElementById('fupdated').value
  };
  try {
    const r = await fetch(API, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    if (!r.ok) throw new Error('保存失败');
    showToast('✅ 保存成功', 'success');
    closeModal();
    setTimeout(() => location.reload(), 400);
  } catch(err) {
    showToast('❌ '+err.message, 'error');
  }
}

async function deleteProject(id) {
  if (!confirm('确认删除 "'+id+'"？此操作不可恢复。')) return;
  try {
    const r = await fetch(API+'/'+id, {method:'DELETE'});
    if (!r.ok) throw new Error('删除失败');
    showToast('🗑 已删除', 'success');
    setTimeout(() => location.reload(), 400);
  } catch(err) {
    showToast('❌ '+err.message, 'error');
  }
}

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = 'toast show '+type;
  setTimeout(() => toast.classList.remove('show'), 2000);
}

let _uploadPid = '';
function uploadDemo(pid) {
  _uploadPid = pid;
  document.getElementById('demoFile').click();
}
async function handleDemoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  showToast('⏳ 上传中...', 'success');
  const fd = new FormData();
  fd.append('demo', file);
  try {
    const r = await fetch('/admin/upload/' + _uploadPid, {method:'POST', body:fd});
    const data = await r.json();
    if (!data.ok) throw new Error(data.error);
    showToast('✅ 上传成功', 'success');
    setTimeout(() => location.reload(), 500);
  } catch(err) {
    showToast('❌ '+err.message, 'error');
  }
  e.target.value = '';
}
async function deleteDemo(pid) {
  if (!confirm('确认删除 Demo？')) return;
  try {
    const r = await fetch('/admin/delete-demo/' + pid, {method:'POST'});
    const data = await r.json();
    if (!data.ok) throw new Error('删除失败');
    showToast('🗑 Demo已删除', 'success');
    setTimeout(() => location.reload(), 500);
  } catch(err) {
    showToast('❌ '+err.message, 'error');
  }
}

modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
</script>
</body></html>"""
