# AGENTS

## 1. 项目概述

`openspec-guide` 是一个基于 Vite + TypeScript 的中文单页指南站点。  
项目目标是将 OpenSpec 上游文档自动拉取、解析并展示为结构化的中文工作流页面。

核心流程：

1. 通过脚本拉取上游 Markdown 文档。
2. 解析为结构化 JSON 数据（命令、工具、语法、元信息）。
3. 可选使用 DeepSeek API 补全中文翻译。
4. 前端读取 `src/data/*.json` 并渲染页面各区块。

---

## 2. 安装、环境变量、运行与构建

### 2.1 环境要求

- Node.js（建议 20+，需支持 `fetch` 与 ESM）。
- pnpm（项目锁定：`pnpm@10.26.2`）。

### 2.2 安装依赖

```bash
pnpm install
```

### 2.3 环境变量

| 变量名 | 必填 | 说明 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | 否 | 用于调用 DeepSeek 翻译命令描述；未设置时会跳过翻译步骤，不影响页面启动和构建。 |

建议在项目根目录创建 `.env.local`：

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 2.4 运行与构建命令

```bash
# 拉取上游并生成本地数据（upstream.json / translations.json）
pnpm fetch

# 本地开发
pnpm dev

# 生产构建（会先执行 prebuild，即自动跑数据构建脚本）
pnpm build

# 预览构建产物
pnpm preview
```

---

## 3. 项目前后端目录结构、页面路由、项目 API 接口

### 3.1 前后端目录结构

当前仓库为前端展示 + 构建脚本模式，无独立后端服务目录。

```text
.
├── index.html                  # 单页入口 HTML
├── src/
│   ├── main.ts                 # 前端入口，挂载各 section
│   ├── style.css               # 全局样式
│   ├── types.ts                # 类型定义
│   ├── data/                   # 构建后数据（upstream/translations/custom）
│   └── sections/               # 页面区块渲染模块
├── scripts/
│   ├── fetch-upstream.ts       # 拉取上游文档
│   ├── parse-docs.ts           # 解析 markdown -> 结构化数据
│   ├── translate.ts            # 调用 DeepSeek 翻译
│   └── build-data.ts           # 编排 fetch/parse/translate/write 全流程
└── openspec/config.yaml        # OpenSpec 配置
```

### 3.2 页面路由

- 站点路由：`/`（单页）。
- 页面内锚点导航：
  - `#commands`
  - `#workflow`
  - `#scenario`
  - `#reference`
  - `#tools`

### 3.3 项目 API 接口

#### A. 本仓库对外 HTTP API

- 当前无后端服务，无自建 HTTP API 端点。

#### B. 构建脚本调用的外部 API

- GitHub Commit API  
  `GET https://api.github.com/repos/Fission-AI/OpenSpec/commits/main`
- GitHub Raw 内容 API  
  `GET https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/{path}`
- DeepSeek Chat API（OpenAI 兼容）  
  Base URL：`https://api.deepseek.com`  
  Model：`deepseek-chat`

#### C. 脚本内部模块接口（代码级）

- `fetchUpstream()`：拉取上游文档与最新提交 SHA。
- `parseDocs(files, commitSha)`：解析文档为结构化数据。
- `computeTranslations(upstream, existing)`：增量翻译内容。

---

## 4. 重要技术栈与依赖说明

### 4.1 核心技术栈

- 前端：Vite + TypeScript + 原生 DOM 渲染（无 React/Vue）。
- 脚本运行：Node.js ESM + `tsx`。
- 数据来源：GitHub 文档仓库。
- 翻译服务：DeepSeek（通过 OpenAI SDK 兼容调用）。

### 4.2 关键依赖

- `vite`：开发服务器与打包。
- `typescript`：类型系统。
- `tsx`：直接运行 TypeScript 脚本。
- `openai`：调用 DeepSeek 兼容接口。
- `@types/node`：Node 类型支持。

---

## 5. 规则（新增）

- 回答尽量用中文。
- 如果没有显式要求，尽量不要写兼容代码。
