# OpenSpec 工作流指南

> **口诀：新 → 续 → 用 → 档**
>
> `new → continue → apply → archive`
>
> OPSX · Artifact-Driven Workflow · 支持 22+ AI 编码工具

---

## 一、命令分类一览

### 主线命令（必须掌握）

| 命令 | 中文 | 作用 |
|------|------|------|
| `/opsx:new` | 新 | 创建一个新的变更目录 |
| `/opsx:apply` | 用 | 执行 tasks.md 中的任务 |
| `/opsx:archive` | 档 | 完成后归档 |

### 速度控制（二选一）

| 命令 | 中文 | 作用 |
|------|------|------|
| `/opsx:ff` | 快进 | 一口气生成所有文档（推荐日常使用） |
| `/opsx:continue` | 续 | 每次只生成一个文档（需要审核时用） |

### 辅助命令（按需使用）

| 命令 | 中文 | 作用 |
|------|------|------|
| `/opsx:explore` | 探 | 只思考不写文件，用于前期调研和方案比较 |
| `/opsx:verify` | 验 | 三维度验证：完整性、正确性、一致性，确保实现符合规格 |
| `/opsx:sync` | 同 | 把变更的 spec 合并到主 specs 目录（archive 时会自动提示） |
| `/opsx:bulk-archive` | 批档 | 一次归档多个已完成的变更，自动检测 spec 冲突并解决 |
| `/opsx:onboard` | 学 | 交互式引导教程，用真实代码库走一遍完整工作流 |

---

## 二、三种工作模式

### 模式 A：快速模式（日常首选）

```
/opsx:ff → /opsx:apply → /opsx:archive
```

**3 个命令搞定**，和旧版体验一致。

```bash
# 第一步：创建 + 快进生成所有文档
你：/opsx:ff
AI：你想做什么功能？
你：我想给产品添加收藏功能
✓ 已生成 proposal.md, specs/, design.md, tasks.md

# 第二步：执行任务
你：/opsx:apply
✓ 开始执行 tasks.md 中的任务...

# 第三步：归档
你：/opsx:archive
✓ 已归档到 archive/
```

---

### 模式 B：精细模式（重要功能）

```
/opsx:new → /opsx:continue(多次) → /opsx:apply → /opsx:verify → /opsx:archive
```

**每一步可审核**，适合重要功能。

```bash
# 第一步：先调研（可选）
你：/opsx:explore
帮我调研一下用户系统和数据库结构

# 第二步：创建变更
你：/opsx:new "product-favorites"
✓ 已创建变更目录

# 第三步：逐个生成文档
你：/opsx:continue   → ✓ 生成 proposal.md
你：/opsx:continue   → ✓ 生成 specs/
你：/opsx:continue   → ✓ 生成 design.md
你：/opsx:continue   → ✓ 生成 tasks.md

# 第四步：执行 → 验证 → 归档
你：/opsx:apply
你：/opsx:verify
你：/opsx:archive
```

---

### 模式 C：并行模式（多任务切换）

同时开多个变更，随时切换上下文，用 `bulk-archive` 批量收尾。

```bash
# 开始第一个变更
你：/opsx:ff add-dark-mode
✓ 已生成所有文档
你：/opsx:apply
正在实现 dark-mode... 被紧急 bug 打断

# 切换到紧急修复
你：/opsx:ff fix-login-redirect
你：/opsx:apply
✓ 修复完成
你：/opsx:archive

# 回到 dark-mode 继续
你：/opsx:apply add-dark-mode
✓ 从上次中断处继续...

# 多个变更完成后，批量归档
你：/opsx:bulk-archive
✓ 已批量归档 3 个变更，自动解决 spec 冲突
```

---

## 三、实战演练：产品收藏功能

### 场景描述

给 Benzenith 珠宝官网添加产品收藏功能，用户可以收藏喜欢的珠宝产品，在个人中心查看。

### 第一步：创建 + 快进

```bash
你：/opsx:ff
AI：你想做什么功能？
你：我想给产品添加收藏功能，用户登录后可以收藏喜欢的珠宝

# AI 自动执行：
✓ 创建变更目录 openspec/changes/product-favorites/
✓ 生成 proposal.md（为什么做）
✓ 生成 specs/favorites/spec.md（行为规格）
✓ 生成 design.md（技术方案）
✓ 生成 tasks.md（任务清单）
```

**生成的文件结构：**

```
openspec/changes/product-favorites/
├── proposal.md      # 为什么做这个功能
├── specs/
│   └── favorites/
│       └── spec.md  # 收藏功能的行为规格
├── design.md        # 技术方案（数据库、API）
└── tasks.md         # 任务清单
```

### 第二步：执行任务

```bash
你：/opsx:apply

# AI 按 tasks.md 逐项执行：
[x] 1.1 创建 favorites 数据库表
[x] 1.2 添加 Drizzle schema
[x] 2.1 实现收藏 API（POST /api/favorites）
[x] 2.2 实现取消收藏 API（DELETE /api/favorites/:id）
[x] 2.3 实现获取列表 API（GET /api/favorites）
[x] 3.1 产品卡片添加收藏按钮
[x] 3.2 个人中心收藏列表页
```

### 第三步：归档

```bash
你：/opsx:archive

✓ 已归档到 openspec/changes/archive/2025-02-01-product-favorites/
```

---

## 四、速查表

```
╔══════════════════════════════════════════════════════════════════════╗
║                       OpenSpec 中文速查                              ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  【快速流程】3 步完成                                                 ║
║  ─────────────────────                                               ║
║  /opsx:ff      → 创建+生成文档                                        ║
║  /opsx:apply   → 执行任务                                             ║
║  /opsx:archive → 归档                                                 ║
║                                                                      ║
║  【精细流程】逐步审核                                                 ║
║  ─────────────────────                                               ║
║  /opsx:new      → 创建（New = 新）                                    ║
║  /opsx:continue → 继续（Continue = 续）                               ║
║  /opsx:apply    → 应用（Apply = 用）                                  ║
║  /opsx:verify   → 三维度验证（Verify = 验）                           ║
║  /opsx:archive  → 存档（Archive = 档）                                ║
║                                                                      ║
║  【辅助命令】按需使用                                                 ║
║  ─────────────────────                                               ║
║  /opsx:explore      → 只调研不写文件（Explore = 探）                  ║
║  /opsx:sync         → 合并 delta specs（Sync = 同）                   ║
║  /opsx:bulk-archive → 批量归档多个变更（批档）                        ║
║  /opsx:onboard      → 交互式引导教程（学）                            ║
║                                                                      ║
║  【记忆口诀】                                                         ║
║                                                                      ║
║        新 → 续 → 用 → 档                                              ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 五、核心理念

### ff = 把多次 continue 合并成一次

```
/opsx:ff  =  /opsx:new + /opsx:continue × 4
```

### 按需使用，渐进深入

| 场景 | 推荐命令 |
|------|----------|
| 小功能，快速完成 | `ff` → `apply` → `archive` |
| 大功能，需要审核 | `new` → `continue`(多次) → `apply` → `archive` |
| 并行开发多个变更 | 多次 `ff`/`new`，最后 `bulk-archive` |
| 不确定要不要做 | 先 `explore`，再决定 |
| 新手入门 | `onboard` 走一遍完整流程 |

### verify 三维度验证

`/opsx:verify` 在归档前从三个维度检查实现质量：

| 维度 | 验证内容 |
|------|----------|
| **完整性 (Completeness)** | 所有任务完成、所有需求实现、场景覆盖 |
| **正确性 (Correctness)** | 实现符合规格意图、边界情况处理 |
| **一致性 (Coherence)** | 设计决策反映在代码中、模式一致 |

---

## 六、生成的 Artifacts 说明

OpenSpec 使用 **spec-driven** 工作流，会生成 4 种 artifacts：

### 1. proposal.md（提案）

回答「**为什么**」做这个功能。

```markdown
## 为什么
提升用户粘性，方便用户追踪心仪产品

## 能力范围
- favorites: 收藏/取消收藏功能

## 影响范围
- 数据库：新增 favorites 表
- API：/api/favorites
- 页面：产品详情页、个人中心
```

### 2. specs/\<capability\>/spec.md（规格）

回答「**是什么**」，使用 WHEN/THEN 格式。

```markdown
## 场景：收藏产品

假设：用户已登录
当：点击产品的收藏按钮
那么：产品加入收藏列表
并且：按钮变为已收藏状态
```

### 3. design.md（设计）

回答「**怎么做**」，技术决策。

```markdown
## 数据库设计
favorites 表：user_id, product_id, created_at

## API 设计
POST   /api/favorites      - 添加收藏
DELETE /api/favorites/:id  - 取消收藏
GET    /api/favorites      - 获取列表
```

### 4. tasks.md（任务）

具体的实施清单。

```markdown
## 任务清单

- [ ] 1.1 创建 favorites 表
- [ ] 1.2 添加 Drizzle schema
- [ ] 2.1 实现收藏 API
- [ ] 2.2 实现取消收藏 API
- [ ] 3.1 产品卡片添加收藏按钮
- [ ] 3.2 个人中心收藏列表页
```

---

## 七、工具兼容性

OpenSpec 支持 22+ AI 编码工具，不同工具的命令语法略有差异，功能完全相同。

### 命令语法对照

| 工具 | 语法示例 | 说明 |
|------|----------|------|
| Claude Code | `/opsx:new` | 冒号分隔 |
| Cursor / Windsurf | `/opsx-new` | 连字符分隔 |
| GitHub Copilot | `/opsx-new` | 仅 IDE 扩展支持 |
| Trae | `/openspec-new-change` | 完整名称格式 |
| Gemini CLI | `/opsx:new` | 冒号分隔 |

### 完整支持列表

Claude Code · Cursor · Windsurf · GitHub Copilot · Gemini CLI · Codex · Amazon Q · Trae · Cline · RooCode · Continue · Auggie · Qwen Code · Kilo Code · OpenCode · Qoder · Factory Droid · CoStrict · Crush · iFlow · CodeBuddy · Antigravity

### 初始化

```bash
npm install -g @fission-ai/openspec@latest
cd your-project
openspec init
```

---

## 八、常见问题

### Q: 新版比旧版重吗？

**不会**。新版更灵活：
- 小改动用 `/opsx:ff` 一步到位
- 大改动用 `/opsx:continue` 逐步审核
- 按需选择，不强制

### Q: 命令记不住怎么办？

记住口诀：**新 → 续 → 用 → 档**

或者直接用自然语言，AI 会自动识别：
- "我想做一个新功能" → `/opsx:new`
- "帮我快速生成所有文档" → `/opsx:ff`
- "继续" → `/opsx:continue`
- "开始写代码" → `/opsx:apply`
- "完成了，归档吧" → `/opsx:archive`
- "帮我学一下怎么用" → `/opsx:onboard`

### Q: explore 什么时候用？

当你不确定要不要做这个功能时，先用 `/opsx:explore` 调研：
- 只思考，不创建任何文件
- 可以比较多种方案
- 想清楚了再决定是否开 change

### Q: 多个变更怎么管理？

用并行模式：
- 通过指定变更名称切换上下文：`/opsx:apply add-dark-mode`
- 完成后用 `/opsx:bulk-archive` 批量归档
- 系统会自动检测和解决 spec 冲突

---

## 九、文件结构

```
openspec/
├── config.yaml                    # 主配置文件（可选，推荐）
└── changes/
    ├── <change-name>/             # 活跃的变更
    │   ├── .openspec.yaml         # 变更元数据
    │   ├── proposal.md
    │   ├── specs/
    │   │   └── <capability>/
    │   │       └── spec.md
    │   ├── design.md
    │   └── tasks.md
    └── archive/                   # 已归档的变更
        └── YYYY-MM-DD-<name>/
```

### 项目配置（可选）

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  Tech stack: TypeScript, React, Node.js
  API conventions: RESTful, JSON responses
  Testing: Vitest for unit tests, Playwright for e2e

rules:
  proposal:
    - Include rollback plan
  specs:
    - Use Given/When/Then format for scenarios
  design:
    - Include sequence diagrams for complex flows
```

---

**记住：新 → 续 → 用 → 档，四个字搞定 OpenSpec！**
