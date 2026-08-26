# AI News · AI 资讯聚合 App

> 一款集中展示 AI 行业资讯的跨端应用：桌面端以 Tauri 悬浮挂件形态常驻（始终置顶 + 开机自启），移动端通过响应式 Web 全屏访问；前后端共享 90%+ 代码。

## ✨ 特性

* **多端适配**：桌面端浮窗 + 移动端全屏，自动根据视口切换布局

* **资讯抓取**：10 个权威源（OpenAI/Anthropic/Google/Meta/Microsoft 官方博客 + ArXiv + 机器之心 + 36氪 + Hacker News），定时（每小时）+ 启动时首次抓取

* **邮箱验证码注册/登录**：JWT 鉴权，开发期固定验证码 `123456`，生产可接 SMTP

* **收藏同步**：本地 localStorage 离线缓存 + 登录后服务端持久化，自动合并

* **翻译**：可选接入 OpenAI（`OPENAI_API_KEY`），无 LLM 时走 `【译】` 占位

* **暗黑模式**：跟随系统 / 强制亮 / 强制暗，服务端持久化

* **Tauri 桌面挂件**：无边框、透明、始终置顶、跳过任务栏、可拖拽、开机自启

## 🏗 架构

```
ai-news/
├── apps/
│   ├── web/              # 前端（Vite + React 18 + TS + Tailwind v4 + Zustand）
│   │   └── src/
│   │       ├── components/   # NewsCard / Widget / FilterBar / FilterDialog / NewsItemRow
│   │       ├── pages/         # NewsPage / FavoritesPage / SettingsPage / LoginPage / RegisterPage
│   │       ├── store/         # appStore(主题/挂件态) / authStore(登录/设置) / newsStore(资讯/收藏)
│   │       ├── lib/           # api(请求封装) / device(端检测) / tauri(桌面能力) / format
│   │       └── data/mock.ts   # 离线兜底数据
│   └── desktop/         # Tauri 桌面壳（复用 web 前端）
│       └── src-tauri/
│           ├── tauri.conf.json   # 浮窗配置：decorations=false / alwaysOnTop=true / skipTaskbar=true
│           ├── Cargo.toml        # tauri + autostart + window-state 插件
│           ├── src/{main,lib}.rs
│           └── capabilities/default.json
├── backend/             # 后端（NestJS + TypeORM + SQLite/PostgreSQL + Redis 可选）
│   └── src/
│       ├── auth/            # 邮箱验证码注册/登录 + JWT
│       ├── users/           # 用户实体（bcrypt 哈希）
│       ├── settings/        # 用户设置（主题/置顶/自启/推送）
│       ├── news/            # 资讯 CRUD + 翻译 + 抓取调度
│       ├── crawler/         # RSS / ArXiv / HackerNews fetchers + 分类器
│       ├── favorites/      # 收藏 CRUD
│       ├── mailer/         # SMTP 发送 + 验证码存储（Redis 或内存）
│       └── common/         # BaseEntity + 全局异常过滤器
└── packages/shared/     # 前后端共享类型
```

## 🚀 快速开始

### 前置依赖

* Node.js ≥ 20

* pnpm ≥ 10（`corepack enable && corepack prepare pnpm@10.5.2 --activate`）

* （可选）Rust + Tauri CLI：仅打包桌面端时需要

* （可选）PostgreSQL / Redis：默认使用 SQLite + 内存验证码存储，零依赖

### 安装

```bash
cd ai-news
pnpm install
```

如遇 bcrypt / better-sqlite3 原生模块编译报错：

```bash
pnpm install --no-frozen-lockfile --config.dangerouslyAllowAllBuilds=true
```

### 配置

```bash
cp backend/.env.example backend/.env
# 编辑 backend/.env：
#   JWT_SECRET=换成一段长随机串
#   DEV_FIXED_CODE=123456   # 开发期固定验证码，跳过 SMTP
#   OPENAI_API_KEY=...       # 可选，启用真实翻译；不填走【译】占位
```

### 启动（Web + 后端联调）

终端 1：后端

```bash
pnpm build:backend && pnpm start:backend
# 🚀 API ready at http://localhost:3000/api
# 📧 验证码模式：固定码 123456（仅开发用）
```

终端 2：前端

```bash
pnpm dev:web
# Vite dev server: http://localhost:5173
# /api 请求自动代理到 :3000
```

打开浏览器访问 <http://localhost:5173> 即可。

### 启动桌面挂件（可选）

需先安装 Rust 工具链：

```bash
# 安装 Rust（macOS / Linux）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Tauri 系统依赖（Ubuntu）
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

# 启动桌面挂件（自动复用 web 前端）
pnpm dev:desktop
```

打包为可执行文件：

```bash
pnpm build:desktop
# 产物在 apps/desktop/src-tauri/target/release/bundle/
```

> 桌面端默认窗口：380×560、无边框、透明、始终置顶、跳过任务栏，左上角偏移 (24, 80)。可通过设置页开关「悬浮窗置顶」「开机自启动」控制。

## 🔌 API 速览

所有路由前缀 `/api`，除 `/auth/*` 与 `/news` 列表外均需 `Authorization: Bearer <token>`。

| 方法     | 路径                                            | 说明                                                                 |
| ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| POST   | `/auth/send-code`                             | 发送邮箱验证码（开发固定 123456）                                               |
| POST   | `/auth/register`                              | 注册：邮箱 + 密码 + 验证码 → `{ token, user }`                               |
| POST   | `/auth/login`                                 | 登录：邮箱 + 密码 → `{ token, user }`                                     |
| GET    | `/auth/me`                                    | 当前用户信息                                                             |
| GET    | `/settings`                                   | 读取当前用户设置                                                           |
| PATCH  | `/settings`                                   | 部分更新设置（notifyPush/dailyTime/widgetTop/autoStart/darkMode/dataSync） |
| GET    | `/news?category=行业新闻,模型更新&page=1&pageSize=50` | 资讯列表（按发布时间倒序）                                                      |
| GET    | `/news/:id`                                   | 资讯详情                                                               |
| POST   | `/news/refresh`                               | 触发一次完整抓取                                                           |
| POST   | `/news/:id/translate`                         | 翻译并持久化（配置 OPENAI\_API\_KEY 走 LLM，否则走【译】占位）                         |
| GET    | `/favorites`                                  | 当前用户收藏 ID 列表                                                       |
| GET    | `/favorites/full`                             | 当前用户收藏的完整资讯                                                        |
| POST   | `/favorites`                                  | 新增收藏 `{ newsId }`                                                  |
| DELETE | `/favorites/:newsId`                          | 取消收藏                                                               |

## 📰 资讯源

启动时自动注入以下默认源（`news_sources` 表为空时触发）：

| 名称                | 类型    | 权威等级 |
| ----------------- | ----- | ---- |
| OpenAI Blog       | rss   | 5    |
| Anthropic News    | rss   | 5    |
| Google AI Blog    | rss   | 5    |
| Meta AI Blog      | rss   | 5    |
| Microsoft AI Blog | rss   | 5    |
| ArXiv (cs.AI)     | arxiv | 5    |
| 机器之心              | rss   | 4    |
| 36氪 AI            | rss   | 4    |
| Hacker News (AI)  | hn    | 3    |
| Hacker News (LLM) | hn    | 3    |

抓取策略：URL 规范化去重（剥除 utm 等跟踪参数）+ 启动首次抓取（异步、不阻塞 HTTP）+ `@Cron(EVERY_HOUR)` 定时增量；网络受限时自动降级到 `seed-news.ts` 内置 mock 数据。

## 🧪 联调验证清单

* ✅ 后端启动 → SQLite 自动建表 + 注入 10 源 + 异步首次抓取

* ✅ `POST /auth/send-code` → `POST /auth/register` → `POST /auth/login` → `GET /auth/me` 链路通

* ✅ `GET /settings` 默认值正确；`PATCH /settings` 部分更新（已修复缺 `@IsOptional` 的 bug）

* ✅ `GET /news` 返回真实 ArXiv + Hacker News 数据（沙箱代理环境下可联网）

* ✅ `POST /news/:id/translate` 走 stub 模式入库并返回 `translatedTitle/Summary`

* ✅ `POST /favorites` / `GET /favorites` / `GET /favorites/full` / `DELETE /favorites/:newsId`

* ✅ 前端浏览器实测：资讯列表渲染、筛选弹窗开关、收藏 toggle（离线 + 在线合并）、登录跳转、设置切换（亮/暗主题，`<html>` class 与 `localStorage` 同步）、收藏页渲染

* ✅ 移动端视口（≤640px）自动切全屏卡片布局；桌面端默认展开为浮窗

## 🛠 常见问题

**Q:** **`nest build`** **后** **`dist/main.js`** **不存在？**
A: 删除 `backend/tsconfig.tsbuildinfo` 缓存后重新构建（`incremental` 缓存偶尔会失效）。

**Q:** **`Data type "Object" ... is not supported by 'better-sqlite3'`？**
A: 实体所有 `@Column` 都已显式声明 `type: 'varchar' | 'text' | 'int' | 'datetime' | 'boolean'`，无需再处理。

**Q: 登录返回 401「邮箱或密码错误」，但注册明明成功？**
A: 已修复 `UsersService.findByEmail` 中 `addSelect('u.password_hash')` 用列名而非属性名的 bug，改为 `addSelect('u.passwordHash')`。

**Q:** **`PATCH /settings`** **报** **`notifyPush must be a boolean value`？**
A: 已为 `UpdateSettingsDto` 所有字段补 `@IsOptional()`，允许部分更新。

**Q: Tauri 启动后翻译按钮无反应？**
A: Tauri 的 CSP 已在 `tauri.conf.json` 中放行 `connect-src 'self' http://localhost:3000 https://api.openai.com ...`；如自定义后端地址请同步更新。

## 📦 生产部署

* **数据库**：把 `DATABASE_URL` 改为 PostgreSQL 连接串即可，TypeORM 自动迁移

* **验证码存储**：配置 `REDIS_URL` 后自动切换到 Redis 验证码存储（支持多实例）

* **邮件**：填写 `SMTP_HOST/PORT/USER/PASS/FROM`，关闭 `DEV_FIXED_CODE`

* **翻译**：填写 `OPENAI_API_KEY`（建议 `gpt-4o-mini` 性价比高）

* **前端**：`pnpm build:web` 后产物在 `apps/web/dist/`，由 Nginx 静态托管并反代 `/api` 到后端

* **桌面端**：`pnpm build:desktop` 产出各平台安装包

## 📁 关键文件速查

* 后端入口与全局管道：[backend/src/main.ts](backend/src/main.ts)

* 资讯抓取与翻译：[backend/src/news/news.service.ts](backend/src/news/news.service.ts)

* 多源 fetcher：[backend/src/crawler/fetchers/](backend/src/crawler/fetchers/)

* 鉴权服务：[backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)

* 前端路由与初始化：[apps/web/src/App.tsx](apps/web/src/App.tsx)

* 资讯/收藏 store：[apps/web/src/store/newsStore.ts](apps/web/src/store/newsStore.ts)

* 主题/挂件态 store：[apps/web/src/store/appStore.ts](apps/web/src/store/appStore.ts)

* Tauri 桌面能力封装：[apps/web/src/lib/tauri.ts](apps/web/src/lib/tauri.ts)

* Tauri 配置：[apps/desktop/src-tauri/tauri.conf.json](apps/desktop/src-tauri/tauri.conf.json)

