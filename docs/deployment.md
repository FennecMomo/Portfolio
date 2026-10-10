# 部署和恢复

## 运行条件

Node.js 22.13 或更高、单机单实例、持久化磁盘。SQLite、媒体和 Demo 必须存放在持久化目录，不能放在每次重建即清空的容器临时层。

主站与 Demo 使用两个不同主机名，例如 `portfolio.example.com` 与 `demos.example.com`，都代理到同一个 Node 服务。主站登录 cookie 不设置父域 Domain。不要使用仅端口不同的同一主机名作为正式 Demo 隔离。

## 首次生产部署

```sh
npm ci
npm run setup
# 编辑 .env：设置正式 SERVER_URL、DEMO_ORIGIN、绝对 STORAGE_DIR 和 DATABASE_URL
# 设置 SEED_ADMIN_EMAIL 与 SEED_ADMIN_PASSWORD，在开放外网前创建管理员
npm run generate
```

以 `NODE_ENV=production` 执行迁移和导入，再构建启动。Linux 示例：

```sh
NODE_ENV=production npm run payload -- migrate
NODE_ENV=production npm run seed
npm run build
npm start
```

PowerShell 示例：

```powershell
$env:NODE_ENV='production'
npm run payload -- migrate
npm run seed
npm run build
npm start
```

生产环境关闭自动 schema push，表结构由 `src/migrations` 管理。不要对已经用开发模式自动建表的数据库直接执行初始迁移；首次部署使用空生产库。开发库与生产库分开。

`PAYLOAD_SECRET` 至少使用 32 字符随机值并保留备份。`SERVER_URL` 和 `DEMO_ORIGIN` 是运行时配置。`DATABASE_URL` 例如 `file:/srv/portfolio/storage/portfolio.db`，`STORAGE_DIR` 例如 `/srv/portfolio/storage`，两者须指向同一持久化区域。

## 反向代理

两个虚拟主机都保留原始 Host，传递 `X-Forwarded-Proto`，使用 HTTPS。示例片段（证书与域名由部署环境提供）：

```nginx
server {
    listen 443 ssl;
    server_name portfolio.example.com demos.example.com;
    # ssl_certificate /path/to/fullchain.pem;
    # ssl_certificate_key /path/to/privkey.pem;
    client_max_body_size 110m;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }
}
```

应用拒绝未知主机名，并拒绝在 Demo 主机访问主站、后台或 API。访问私有上传文件仍经过 Payload 访问检查。不要由代理把 `storage/media` 或 `storage/archives` 直接公开为静态目录，否则会绕过权限。

## 升级

1. 备份数据库和全部存储目录。
2. 安装锁定依赖，生成类型，执行代码检查与测试。
3. 在维护窗口停止旧进程，执行新增数据库迁移，构建启动。
4. 检查登录、公开作品、私有内容不可访问、附件及 Demo。

数据库迁移可能改变数据结构；回滚版本时应使用与旧代码匹配的备份，不盲目执行破坏性回退。

## 备份与恢复

简单可靠的备份方法是在维护窗口停止 Node 服务，然后复制 SQLite 文件及整个 `storage/media`、`storage/archives`、`storage/demos`，另行安全备份 `.env`。如数据库有 `-wal` 或 `-shm` 文件，也应随停止后的完整目录一起保留。测试用 `storage/acceptance-*` 不需要纳入正式备份。

恢复到独立路径，设置对应环境变量，用相同代码版本启动并核对作品数量、管理员登录、图片、下载与 Demo，之后再切换域名。

## 邮件与外部资源

当前没有配置邮件服务，不能依赖“忘记密码”邮件到达邮箱。管理员应保管登录凭据；生产如需邮件找回，应先接入邮件适配器再验收。旧站真实附件和 Demo 尚未迁入，网站不会伪造缺失文件。
