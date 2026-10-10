# 狐漠漠 Portfolio

个人作品展示站，使用 Next.js App Router、Payload CMS 和 SQLite。公开站点与中文网页管理后台在同一个应用中；在线 Demo 通过独立主机名提供。

## 已实现

- 首页、作品列表、详情、关于我和可选开发计划栏目。
- 搜索、类型/技术/状态筛选、推荐/名称/更新时间排序。
- 作品封面、截图、富文本、项目状态、可选完成度、相关链接和附件下载。
- Payload 中文后台：管理员、作品草稿/预览/发布/历史版本、媒体、计划、站点资料。
- Demo ZIP 验证、独立版本、短时私密预览、发布与回退。失败上传不会替换已发布版本。
- 导入旧 Flask 快照的 25 条作品；重复导入不会覆盖已编辑内容。
- SQLite 生产迁移、隔离的 HTTP 集成验收、基础安全测试。

## 本地启动

需要 Node.js 22.13 或更新版本（开发与验收使用 Node.js 24）。

```sh
npm ci
npm run setup
npm run seed
npm run dev
```

打开 http://localhost:3000，管理后台为 http://localhost:3000/admin。

首次使用在本机后台创建管理员。没有默认账号密码。应在对外开放服务之前完成此步骤。也可以在 `.env` 中设置 `SEED_ADMIN_EMAIL` 与至少 16 字符的 `SEED_ADMIN_PASSWORD` 后执行 `npm run seed`；已有管理员时不会重建账号。创建后从 `.env` 移除这两个引导字段。

`npm run setup` 生成随机 `PAYLOAD_SECRET`，已有 `.env` 会保留。不要把 `.env`、数据库、上传文件或管理凭据提交到 Git。

首次导入不创建虚构计划，不把任意项目标成精选。首页在没有精选时显示作品一览。封面未迁入的作品使用抽象图形占位，不代表作品截图。

## 常用命令

```sh
npm run generate       # 更新 Payload 类型与后台 import map
npm run typecheck
npm test
npm run build
npm run test:e2e       # 先 build；使用 3100 端口和独立临时数据库
npm run start
```

集成验收会从空库执行生产迁移，再启动真实生产服务，覆盖认证、草稿、公开权限、上传下载、Demo 验证/发布/回退及计划管理。测试账号随机生成，仅存在 `storage/acceptance-*` 测试库中。

## 文件组织

| 位置                         | 用途                                          |
| ---------------------------- | --------------------------------------------- |
| `src/app/(site)`             | 公开页面和样式                                |
| `src/app/(payload)`          | Payload 后台与 REST API                       |
| `src/collections`            | 内容字段、访问规则、生命周期逻辑              |
| `src/lib`                    | 内容查询、Demo 验证与预览签名                 |
| `src/migrations`             | SQLite 生产数据库迁移                         |
| `scripts`                    | 初始化、旧内容导入、集成验收                  |
| `data.json`                  | 原网站公开内容快照，作为导入来源              |
| `legacy/flask`               | 保留的旧实现，仅用于参考                      |
| `references` / `docs/import` | 原始导入说明与依赖参考，非新版运行依赖        |
| `storage`                    | 本地数据库、媒体、Demo 包与解压版本，不入 Git |

## 部署与操作

详见 [部署说明](docs/deployment.md)、[内容管理手册](docs/editor-guide.md)、[功能沿用与数据设计](docs/design.md)。

这是需要 Node.js 服务与持久化磁盘的应用，不能直接部署到 GitHub Pages。GitHub 仓库保存源码，不等于公网网站已部署。

旧服务器上的真实数据库、封面、附件和 Demo 包没有包含在源码快照中。当前导入的是 25 条公开文字记录；这些历史记录的状态、日期与链接仍需内容维护者按现状更新。
