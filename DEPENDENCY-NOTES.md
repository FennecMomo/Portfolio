# Portfolio 共享登录依赖 — 导出说明

> 本文件由导出流程生成，非原工程文件。
> 导出时间：2026-10-10 15:17 (CST)
> 源目录：/home/ubuntu/dev-projects/auth（服务器 175.24.131.154）

## 为什么需要这个包
portfolio/app.py 并不自己实现登录，它靠引号共享认证模块：
```
sys.path.insert(0, "/home/ubuntu/dev-projects")
from auth.shared import require_auth, JWT_SECRET
```
所以要脱离服务器跑管理功能，就需要本包内的这几个文件。

## 包内容与依赖关系
- references/auth/__init__.py  —— 包标记（`from auth.shared import ...` 必须要有它）
- references/auth/shared.py    —— 被引用的共享中间件（require_auth / get_current_user）
- references/auth/db.py        —— shared.py 的依赖：shared.py 用 importlib 按文件路径直接加载同目录 db.py，
                                  启动时 init_db() 建 config 表、get_config("jwt_secret") 取 JWT 密钥

放置方式（Windows 解压到 E:\etc\Portfolio 后，保持与 portfolio 平级即可）：
```
E:\etc\Portfolio\          <- portfolio 源码（主包）
E:\etc\auth\               <- 本包 references/auth/* 放这里（目录名必须是 auth）
```
或放在 portfolio 同级任意目录，再改 app.py 里那句 sys.path.insert 指向它（本包不改动 portfolio 源码，需你自行决定）。

## 导出改动：无
- 三个文件与线上**字节级一致**，未做任何替换。
- 原因：这些文件里**没有硬编码秘密**。JWT 密钥不是写死在代码里的，而是运行时由 db.py 的
  `secrets.token_hex(32)` 生成后存进数据库 config 表的 `jwt_secret` 键；shared.py 只是从库里读它。
  所以没有「真实硬编码秘密」可替换，也就没有需要记录的环境变量名。
- 为防误判，导出后对副本做了全量扫描：无明文口令、无 API key、无 token、无私钥（clean）。

## 是否还依赖服务器登录服务：是
- shared.py 里有常量 `AUTH_URL = "https://auth.fennecmomo.top"`（**明文 URL，非秘密**，未加改写）。
  未登录访问受保护路由会 302 跳到 `https://auth.fennecmomo.top/login?redirect=...`。
- JWT 由该登录服务（同目录的 auth/app.py，独立服务，端口 8768，未包含在本包）用**服务器数据库里的**
  jwt_secret 签发，shared.py 本地验签。因此：
  - 公开部分（首页 `/`、`/api/projects`、`/api/project/<id>`、`/projs/`、`/demo/`）**不依赖登录服务**，本地只要有 Flask 就能跑。
  - 管理后台 `/admin` 的表单登录是 app.py 内部校验（ADMIN_USER/ADMIN_PASS，主包已脱敏为环境变量），可本地独立登录；
    但「上传 Demo / 删除 Demo」接口带 `@require_auth`，需要 auth 服务签发的 `hermes_auth` cookie → **这部分依赖服务器登录服务**。
- db.py 里的数据库路径是写死的绝对路径 `~/dev-projects/core-server/data.db`（**非秘密，属可移植性提醒**）：
  它指向 core-server 的库（config 表存 jwt_secret，users 表存账号）。本机没有该库时，shared.py 导入即会报错，
  这也是「依赖服务器登录服务」的具体原因。

## 未包含（按规则排除）
- auth/app.py、auth/templates.py（登录服务本体与登录页，不是 shared.py 的依赖）
- auth/auth.db（历史数据库）、core-server/data.db（含 jwt_secret 与用户账号）、任何 .env / 密钥 / 证书
- 无符号链接；未修改 portfolio 源码与线上任何文件

## 附带：公开内容比对结论（data.json vs 线上库/API）
- 站点信息：名称「狐漠漠」、简介文字，两侧**完全一致**。
- 作品：两侧均 25 条，ID 集合完全相同，逐字段（name/tag/summary/detail/link/completion/status/type/updated）比对
  **0 处差异**；/api/projects 实际返回与数据库一致。
- 唯一不同是**排序**：data.json 为快照写入时的原始顺序，线上首页/API 默认按「完成度降序」展示（内容本身一样）。
- 结论：内容相同 → 按「仅在不同时才导出」的条件，**未生成** references/current-public-content.json（数据库本体也未导出）。
