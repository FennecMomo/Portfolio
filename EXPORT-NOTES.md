# Portfolio（个人作品展示站）— 源码导出说明

> 本文件由导出流程生成（自带说明），非原工程文件。
> 导出时间：2026-10-10 15:14 (CST)
> 源目录：/home/ubuntu/dev-projects/portfolio（服务器 175.24.131.154）
> git：分支 master @ 0af694a303d4

## 项目简介
狐漠漠的个人作品展示站（公开访问）。单文件 Flask 应用 + 内联 HTML 模板渲染，
作品数据存 SQLite（db.sqlite，未随本包导出），另有早期单文件版本 web.py（直接读 data.json，保留作参考）。

## 文件结构
- app.py       入口（Flask，公开页 / + 读取 API /api/* + 管理后台 /admin + 静态作品目录 /projs/ + Demo /demo/）
- db.py        SQLite 数据层（config / projects 表）
- models.py    展示字段衍生（进度条样式、状态标签、稳定 emoji 图标）
- templates.py 页面 HTML 模板（TEMPLATE / ADMIN_TEMPLATE，内联 CSS+JS）
- web.py       早期版本（data.json 直读版，无后台），保留作参考
- data.json    站点内容快照（公开信息；25 条作品记录）
- projs/       作品静态子目录（丢文件即生效）
- demos/       上传的 Demo 静态目录（zip 解包）

## 运行依赖
- Python 3（服务器实测 /usr/bin/python3 + flask 3.1.3 + PyJWT 2.12.1）
- 无 requirements.txt / 锁文件（原工程就没有；服务器直接用系统 python3 跑）

## 启动
```
python3 app.py          # 监听 0.0.0.0:8766
```

## 服务器上的部署方式（仅供参考，未改动）
- systemd：/etc/systemd/system/portfolio.service
  ExecStart=/usr/bin/python3 /home/ubuntu/dev-projects/portfolio/app.py，WorkingDirectory 同上
- Cloudflare Tunnel：portfolio.fennecmomo.top → http://localhost:8766
- 共享登录：app.py 通过 sys.path 引入 /home/ubuntu/dev-projects/auth/shared.py（**独立工程，未随本包导出**），
  登录页 https://auth.fennecmomo.top ，JWT cookie Domain=.fennecmomo.top

## 本包内的安全处理
- app.py 里硬编码的 ADMIN_USER / ADMIN_PASS 已替换为
  os.environ.get("ADMIN_USER", "CHANGE_ME_ADMIN_USER") / os.environ.get("ADMIN_PASS", "CHANGE_ME_ADMIN_PASSWORD")
  （**仅本导出副本**；线上源码未动，原值不随包提供）
- 未包含 .git、__pycache__、db.sqlite（数据库）、任何密钥/证书/真实 .env

## 本地接收记录（2026-10-10）

- 目标目录：`E:\etc\Portfolio`。当前为源码取回基线，未修改网站功能、未启动本地服务、未修改线上部署。
- 主源码包与补充依赖包均已校验压缩包及逐文件 SHA-256，合计 14 个文件；8 个 Python 文件通过本地语法解析。两个压缩包的原始清单和服务器导出报告保存在 `docs/import/`。清单记录的是原始导出包，本说明的这一节为本地追加。
- 补充共享登录源码已放在 `references/auth/`，依赖关系与公开内容比对说明见 `DEPENDENCY-NOTES.md`。这是原始主包之外的补充，不是已接入的本地登录实现。
- 已通过只读导出补齐实际数据库表结构：`references/portfolio-schema.sql`。没有复制运行数据库或账号数据。公开站点内容位于 `data.json`；服务器核对确认其中 25 条作品及站点信息与当前线上一致，仅排序不同。
- 本地尚不能直接按原启动命令运行：入口仍引用 Linux 绝对路径；共享登录模块依赖服务器 `core-server` 数据库及登录服务；Portfolio 的 SQLite 库尚未初始化；原工程没有依赖清单。这些留待后续本地开发适配，不把语法校验当作运行成功。
- 原 Git 历史包含历史凭据，未导入本地；保留服务器原始提交标识于 `docs/import/site-export-report.json`，本地建立新的干净 Git 基线，无远程仓库绑定。
- 原始接收材料保存在 `E:\etc\FurtherAgent\artifacts\integration\personal-site-import`，属于传输存档；后续开发使用当前 Portfolio 目录。
