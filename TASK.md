# OpenSpec Guide — Vite 迁移 & 自动同步

## 阶段一：项目初始化
- [x] 用 Vite + 原生 TS 初始化项目
- [x] 迁移现有 CSS 设计风格
- [x] 配置基础构建流程

## 阶段二：数据抓取脚本
- [x] 编写 `scripts/fetch-upstream.ts`，从 GitHub API 拉取上游文档
- [x] 编写 `scripts/parse-docs.ts`，Markdown 解析提取结构化数据
- [x] 编写 `scripts/translate.ts`，集成 DeepSeek AI 翻译 API
- [x] 编写 `scripts/build-data.ts`，编排入口含 SHA 对比逻辑
- [x] 首次抓取验证通过（10 命令、23 工具）

## 阶段三：页面渲染
- [x] Hero 区块
- [x] Commands 区块（数据驱动）
- [x] Workflow 区块（tab 切换验证通过）
- [x] Scenario 实战演练区块
- [x] Reference 速查表
- [x] Tools 兼容区块（数据驱动）
- [x] Footer

## 阶段四：定时构建 & 部署
- [ ] 编写 `scripts/build.sh` 构建脚本
- [ ] 部署到 Zeabur / VPS + cron 配置（需用户操作）

## 阶段五：验证
- [/] 页面视觉效果验证（上半部分通过，下半部分进行中）
- [x] 数据抓取脚本正确性
- [x] 验证"无变化跳过"优化
- [x] 验证 vite build 生产构建
