-- Portfolio (portfolio.fennecmomo.top) 数据库表结构导出
-- 来源：/home/ubuntu/dev-projects/portfolio/db.sqlite（SQLite，只读连接 mode=ro 读 sqlite_master）
-- 导出时间：2026-10-10 15:19 (CST)
-- 范围：仅 config、projects 两表及相关索引的建表语句；不含数据行、不含其他数据库
-- 说明：db.py 无 CREATE TABLE 初始化脚本，本文件即线上真实表结构（原样取自 sqlite_master，未改写）

-- table: config
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- table: projects
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tag TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    detail TEXT DEFAULT '',
    link TEXT DEFAULT '',
    completion INTEGER DEFAULT 0,
    status TEXT DEFAULT '开发中',
    type TEXT DEFAULT '',
    updated TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0
);

-- index sqlite_autoindex_config_1：由 PRIMARY KEY 自动生成的隐式索引，无显式 DDL
-- index sqlite_autoindex_projects_1：由 PRIMARY KEY 自动生成的隐式索引，无显式 DDL
