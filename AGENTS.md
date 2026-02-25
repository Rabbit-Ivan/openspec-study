# AGENTS

## 1. 项目概述

`openspec-guide` 是一个基于 Vite + TypeScript 的中文单页指南站点。

项目目标：

1. 自动拉取 OpenSpec 上游文档。
2. 解析 Markdown 为结构化 JSON（命令、工作流、概念、CLI、迁移、多语言等）。
3. 可选调用 DeepSeek API 做增量中文翻译。
4. 前端读取 `src/data/*.json` 并在单页内渲染。

当前数据管道已覆盖以下文档：

- `README.md`
- `docs/commands.md`
- `docs/supported-tools.md`
- `docs/workflows.md`
- `docs/opsx.md`
- `docs/concepts.md`
- `docs/getting-started.md`
- `docs/installation.md`
- `docs/cli.md`
- `docs/customization.md`
- `docs/migration-guide.md`
- `docs/multi-language.md`

---

## 2. 安装、环境变量、运行与构建

### 2.1 环境要求

- Node.js 20.19.0+
- pnpm（锁定 `pnpm@10.26.2`）

### 2.2 安装依赖

```bash
pnpm install
```

### 2.3 环境变量

| 变量名 | 必填 | 说明 |
| --- | --- | --- |
| `GITHUB_TOKEN` | 否 | 调用 GitHub API、提升限额、稳定拉取提交对比。 |
| `DEEPSEEK_API_KEY` | 否 | 调用 DeepSeek 翻译；未设置时会跳过翻译。 |
| `SYNC_ALERT_WEBHOOK` | 否 | 同步连续失败告警地址。 |

示例（`.env.local`）：

```bash
GITHUB_TOKEN=your_github_token
DEEPSEEK_API_KEY=your_deepseek_api_key
SYNC_ALERT_WEBHOOK=https://example.com/webhook
```

### 2.4 常用命令

```bash
# 拉取上游并更新 src/data/upstream.json、src/data/translations.json
pnpm run sync

# 本地开发（会先执行 predev，即自动同步数据）
pnpm dev

# 生产构建（会先执行 prebuild，即自动同步数据）
pnpm build

# 预览构建产物
pnpm preview
```

### 2.5 自动同步与自动发布机制

- 自动同步：`sync.yml` 每天 UTC 06:00（可手动触发）拉取 OpenSpec 上游文档并提交数据更新。
- 自动发布：`deploy.yml` 在 `main` 分支有新提交时自动构建并发布 GitHub Pages。
- 同步范围：`src/data/upstream.json` 与 `src/data/translations.json` 中的结构化内容会跟随上游更新。
- 定制边界：`src/data/custom.ts` 中的固定中文文案、演示剧情与品牌化表达不会被上游直接覆盖。

---

## 3. 目录结构、页面路由、项目 API 接口

### 3.1 前后端目录结构

当前仓库为“前端单页 + Node 构建脚本”，无独立后端服务。

```text
.
├── index.html
├── src/
│   ├── main.ts
│   ├── style.css
│   ├── types.ts
│   ├── data/
│   │   ├── upstream.json
│   │   ├── translations.json
│   │   └── custom.ts
│   └── sections/
│       ├── hero.ts
│       ├── commands.ts
│       ├── workflow.ts
│       ├── scenario.ts
│       ├── reference.ts
│       ├── tools.ts
│       └── footer.ts
├── scripts/
│   ├── fetch-upstream.ts
│   ├── parse-docs.ts
│   ├── translate.ts
│   └── build-data.ts
├── .github/workflows/sync.yml
├── .github/workflows/deploy.yml
└── openspec/config.yaml
```

### 3.2 页面路由与锚点

- 路由：`/`
- 锚点：
  - `#commands`
  - `#workflow`
  - `#scenario`
  - `#reference`
  - `#tools`

### 3.3 项目 API 接口

#### A. 本仓库对外 HTTP API

- 无自建后端接口。

#### B. 构建脚本调用的外部 API

- GitHub Commit API  
  `GET https://api.github.com/repos/Fission-AI/OpenSpec/commits/main`
- GitHub Compare API  
  `GET https://api.github.com/repos/Fission-AI/OpenSpec/compare/{base}...{head}`
- GitHub Raw API  
  `GET https://raw.githubusercontent.com/Fission-AI/OpenSpec/{sha}/{path}`
- DeepSeek Chat API（OpenAI 兼容）  
  Base URL：`https://api.deepseek.com`  
  Model：`deepseek-chat`

#### C. 脚本内部接口（代码级）

- `fetchUpstream(refOrSha?)`：拉取全部追踪文档。
- `parseDocs(files, commitSha)`：解析文档为结构化 `UpstreamData`。
- `computeTranslations(upstream, existing)`：增量翻译并返回 `Translations`。

---

## 4. 重要技术栈与依赖说明

### 4.1 核心技术栈

- 前端：Vite + TypeScript + 原生 DOM 渲染。
- 脚本：Node.js ESM + `tsx`。
- 数据源：OpenSpec GitHub 文档。
- 翻译：DeepSeek（通过 OpenAI SDK 兼容调用）。
- 自动同步：GitHub Actions（`sync.yml` 每天 UTC 06:00 + 手动触发）。
- 自动发布：GitHub Actions + GitHub Pages（`deploy.yml` 在 `main` 提交后自动发布）。

### 4.2 关键依赖

- `vite`
- `typescript`
- `tsx`
- `openai`
- `@types/node`

---

## 5. 规则添加

- 回答尽量用中文。
- 如果没有显式要求，尽量不要写兼容代码。
