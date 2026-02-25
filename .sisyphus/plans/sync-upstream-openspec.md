# Sync Upstream OpenSpec Changes (a0608d0b → d7d18608)

## TL;DR

> **Quick Summary**: 同步上游 OpenSpec 3 个提交的变更，核心是引入 `/opsx:propose` 命令和 profile 体系。需要修复 3 个解析器函数、更新硬编码内容、运行同步、验证构建。
> 
> **Deliverables**:
> - 修复后的 `scripts/parse-docs.ts`（3 个解析函数适配上游新结构）
> - 更新后的 `src/data/custom.ts`（MANTRA、WORKFLOW_DEMOS、SCENARIO、命令映射表）
> - 同步后的 `src/data/upstream.json` 和 `src/data/translations.json`
> - 成功构建的站点（`pnpm build` 通过）
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: T1/T2/T3 (parser fixes) → T7 (sync) → T8/T9 (post-sync) → T10 (build)

---

## Context

### Original Request
用户要求将 openspec-guide 项目与上游 OpenSpec 仓库同步。经对比发现本地落后 3 个提交（a0608d0b → d7d18608），9/12 个追踪文件有变更。

### Interview Summary
**Key Discussions**:
- MANTRA 四字口诀：确认更新为「提探用档」（propose/explore/apply/archive）
- WORKFLOW_DEMOS.fast：确认改为 core profile 三步流程（propose → apply → archive）
- SCENARIO.steps：确认第一步从 `/opsx:new` 改为 `/opsx:propose`
- `/opsx:propose` 分类：确认归为 `main`（主命令）

**Research Findings**:
- 上游核心变更：新增 `/opsx:propose` 命令、profile 分层（core vs custom）、默认工作流变更
- 解析器兼容性问题：`parseQuickRef()` 无法处理双表结构、`parseTools()` section 标题改名且格式从表格变为列表、`parseWorkflows()` 新增 section
- `custom.ts` 有 7 处硬编码需更新

### Metis Review
**Identified Gaps** (addressed):
- `parseGettingStarted()` 中有硬编码 Set（5 个标题精确匹配），本次变更未涉及但记为技术债
- `parseWorkflows()` 的 `ffVsContinue` 正则极脆弱（依赖标题同时包含 `/opsx:ff` 和 `/opsx:continue`），本次变更未破坏但记为技术债
- 4 个产品决策已由用户全部确认

---

## Work Objectives

### Core Objective
将 openspec-guide 数据管道和前端内容与上游 OpenSpec 最新 3 个提交完全同步，确保所有新命令、工作流变更在站点上正确展示。

### Concrete Deliverables
- `scripts/parse-docs.ts`：3 个函数修复（parseQuickRef, parseTools, parseWorkflows）
- `src/data/custom.ts`：MANTRA + WORKFLOW_DEMOS + SCENARIO + 4 个命令映射表
- `src/data/upstream.json`：同步到 SHA `d7d18608`
- `src/data/translations.json`：包含 `/opsx:propose` 翻译
- `.last-sha`：更新为 `d7d186088eb1c5878c3d9f91bd928f06483fcb98`

### Definition of Done
- [ ] `pnpm run sync` 无错误完成
- [ ] `pnpm build` 无错误完成
- [ ] `upstream.json` 中 commitSha 为 `d7d18608` 开头
- [ ] `upstream.json` 中包含 `/opsx:propose` 命令数据
- [ ] `custom.ts` MANTRA 为 `['提','探','用','档']`

### Must Have
- `/opsx:propose` 命令在所有映射表中存在
- MANTRA 更新为「提探用档」
- WORKFLOW_DEMOS.fast 展示 core profile 三步流程
- SCENARIO 第一步使用 `/opsx:propose`
- parseTools() 能解析新的 `Generated Skill Names` bullet list 格式
- parseQuickRef() 能解析双表结构

### Must NOT Have (Guardrails)
- 不修改不相关的解析器函数（只动 parseQuickRef/parseTools/parseWorkflows）
- 不重构现有代码结构（最小化修改原则）
- 不删除对旧命令的支持（`/opsx:new` 等仍需保留在映射表中）
- 不修改前端渲染逻辑，除非数据结构变更导致必须调整
- 不引入新依赖

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO（项目无测试框架）
- **Automated tests**: None
- **Framework**: none
- **QA**: Agent-Executed QA Scenarios for every task

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Parser fixes**: Use Bash — run `pnpm run sync`, inspect `upstream.json` output
- **Custom.ts updates**: Use Bash — `grep` for expected values
- **Build verification**: Use Bash — `pnpm build`, check exit code
- **Frontend verification**: Use Playwright — open dev server, screenshot key sections

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — 6 parallel tasks):
├── Task 1: Fix parseQuickRef() for dual-table structure [quick]
├── Task 2: Fix parseTools() for heading rename + bullet list [quick]
├── Task 3: Fix parseWorkflows() for new sections [quick]
├── Task 4: Update custom.ts MANTRA + WORKFLOW_DEMOS + SCENARIO [quick]
├── Task 5: Update custom.ts command maps (4 maps) [quick]
└── Task 6: Review & update types.ts Tool interface [quick]

Wave 2 (After Wave 1 T1-T3 — sync):
└── Task 7: Run pnpm run sync (depends: T1, T2, T3) [quick]

Wave 3 (After Wave 2 — post-sync verification + translations):
├── Task 8: Verify and update translations (depends: T7) [quick]
└── Task 9: Verify frontend renderers (depends: T4, T5, T7) [quick]

Wave 4 (After Wave 3 — build & visual check):
└── Task 10: Build and visual verification (depends: T8, T9) [unspecified-high]

Wave FINAL (After ALL tasks — independent review, 4 parallel):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: T1/T2/T3 → T7 → T8/T9 → T10 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 6 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | — | T7 |
| T2 | — | T7 |
| T3 | — | T7 |
| T4 | — | T9 |
| T5 | — | T9 |
| T6 | — | T7 |
| T7 | T1, T2, T3, T6 | T8, T9 |
| T8 | T7 | T10 |
| T9 | T4, T5, T7 | T10 |
| T10 | T8, T9 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: **6** — T1-T6 → `quick`
- **Wave 2**: **1** — T7 → `quick`
- **Wave 3**: **2** — T8-T9 → `quick`
- **Wave 4**: **1** — T10 → `unspecified-high`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Fix `parseQuickRef()` for dual-table structure

  **What to do**:
  - Open `scripts/parse-docs.ts`, locate `parseQuickRef()` (lines 237-252)
  - Current code finds a single `## Quick Reference` section and parses ONE table
  - Upstream now has TWO sub-sections: `### Default Quick Path` (core commands table) and `### Expanded Workflow Commands` (expanded commands table)
  - Modify the function to:
    1. Find the `## Quick Reference` H2 section
    2. Within it, find ALL markdown tables (there are now 2)
    3. Parse each table's rows into `QuickRefEntry[]` just like the current logic does for one table
    4. Concatenate both tables' entries into the returned array
  - Keep the existing `QuickRefEntry` type and return shape unchanged
  - The parsing logic for individual table rows (split by `|`, trim cells) should stay the same — just loop over multiple tables instead of one

  **Must NOT do**:
  - Do NOT rename the function or change its signature
  - Do NOT modify any other parser function
  - Do NOT change `QuickRefEntry` type definition

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single function fix, ~15 lines of change, clear scope
  - **Skills**: `[]`
    - No special skills needed — pure TypeScript string parsing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3, T4, T5, T6)
  - **Blocks**: T7 (sync depends on parser fixes)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `scripts/parse-docs.ts:237-252` — Current `parseQuickRef()` implementation. Shows how tables are found and rows parsed via `|` splitting. Extend this pattern to handle multiple tables.
  - `scripts/parse-docs.ts:170-235` — `parseCommands()` for reference on how other parsers handle H2/H3 section extraction.

  **API/Type References**:
  - `src/types.ts:QuickRefEntry` — The return type. Must remain unchanged.

  **External References**:
  - Upstream `docs/commands.md` new structure: `### Default Quick Path` table + `### Expanded Workflow Commands` table under `## Quick Reference`.

  **WHY Each Reference Matters**:
  - `parseQuickRef()` current code: Understand the exact regex/split pattern to reuse for multi-table.
  - `parseCommands()`: Shows H3 sub-section extraction pattern if needed for finding `### Default Quick Path` vs `### Expanded Workflow Commands`.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Quick reference parses both core and expanded tables
    Tool: Bash
    Preconditions: Parser fix applied, upstream docs fetched (or use existing upstream.json after sync)
    Steps:
      1. Run `pnpm run sync` (if T2/T3 also done) OR write a quick test script:
         `npx tsx -e "import {parseDocs} from './scripts/parse-docs'; ..."` to test parse output
      2. Inspect `src/data/upstream.json` — search for `quickRef` key
      3. Count entries: `grep -c '"command":' src/data/upstream.json` in the quickRef section
    Expected Result: quickRef array has entries from BOTH tables (core + expanded commands, ~12+ total entries)
    Failure Indicators: quickRef has only 4-5 entries (only core table parsed) or is empty
    Evidence: .sisyphus/evidence/task-1-quickref-dual-table.txt

  Scenario: Quick reference includes /opsx:propose entry
    Tool: Bash
    Preconditions: Sync completed successfully
    Steps:
      1. Run `grep 'propose' src/data/upstream.json | head -5`
      2. Verify `/opsx:propose` appears in quickRef entries
    Expected Result: At least one quickRef entry contains "propose"
    Failure Indicators: No "propose" in quickRef section
    Evidence: .sisyphus/evidence/task-1-quickref-propose.txt
  ```

  **Evidence to Capture:**
  - [ ] task-1-quickref-dual-table.txt — count of quickRef entries
  - [ ] task-1-quickref-propose.txt — grep output confirming propose entry

  **Commit**: YES (groups with T2, T3, T6)
  - Message: `fix(parser): adapt parseQuickRef/parseTools/parseWorkflows for upstream restructure`
  - Files: `scripts/parse-docs.ts`
  - Pre-commit: `pnpm run sync`

- [ ] 2. Fix `parseTools()` for heading rename + bullet list format

  **What to do**:
  - Open `scripts/parse-docs.ts`, locate `parseTools()` (lines 336-366)
  - Current code looks for `## What Gets Installed` section and parses a **markdown table** for skills
  - Upstream has renamed this to `## Generated Skill Names` and changed the format from a table to a **bullet list**
  - Modify the function to:
    1. Change the section heading match from `## What Gets Installed` to `## Generated Skill Names`
    2. Replace the table-parsing logic with bullet-list parsing:
       - Each bullet line format: `- **skill-name** — description` (or similar)
       - Extract skill name and description from each bullet
    3. Return the same `Skill[]` type as before
  - Also update the tool directory table parsing if needed — upstream reformatted with explicit path patterns (`openspec-*/SKILL.md`)
  - The `Tool` interface in `types.ts` may need a minor update if the `skillsLocation` field format changed — coordinate with T6

  **Must NOT do**:
  - Do NOT change the function signature or return type shape
  - Do NOT modify any other parser function
  - Do NOT remove table-parsing logic entirely if some tables still exist (defensive coding)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single function fix with format change, ~20 lines of modification
  - **Skills**: `[]`
    - No special skills needed — markdown string parsing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3, T4, T5, T6)
  - **Blocks**: T7 (sync depends on parser fixes)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `scripts/parse-docs.ts:336-366` — Current `parseTools()` implementation. Shows current table-parsing logic. The overall structure (find section → extract content → parse entries) should remain the same, just swap table parsing for bullet parsing.
  - `scripts/parse-docs.ts:237-252` — `parseQuickRef()` table parsing as reference for how current table logic works.

  **API/Type References**:
  - `src/types.ts:42-45` — `Skill` interface: `{ name: string; description: string }`. Return shape must match.
  - `src/types.ts:30-34` — `Tool` interface: fields `name`, `skillsLocation`, `commandsLocation`. Check if `skillsLocation` value format changed in upstream.

  **External References**:
  - Upstream `docs/supported-tools.md` new structure: `## Generated Skill Names` with bullet list instead of table.
  - New tool entries: `kiro`, `pi`, `trae` — verify these are parsed.

  **WHY Each Reference Matters**:
  - Current `parseTools()`: Understand exact parsing approach to minimally modify.
  - `Skill` interface: Ensure return type contract is preserved.
  - `Tool` interface: Know if field semantics changed (e.g., `skillsLocation` now shows `openspec-*/SKILL.md` pattern).

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Skills parsed from bullet list format
    Tool: Bash
    Preconditions: Parser fix applied, sync completed
    Steps:
      1. Run `pnpm run sync`
      2. Inspect `src/data/upstream.json` for `skills` entries
      3. Run `node -e "const d=require('./src/data/upstream.json'); console.log(d.tools?.skills?.length || 'missing')"` (or equivalent tsx)
    Expected Result: skills array is populated (non-empty, matches upstream bullet count)
    Failure Indicators: skills is empty array `[]` or missing entirely
    Evidence: .sisyphus/evidence/task-2-skills-parsed.txt

  Scenario: New tools (kiro, pi, trae) present in tool directory
    Tool: Bash
    Preconditions: Sync completed
    Steps:
      1. Run `grep -E '(kiro|pi|trae)' src/data/upstream.json`
      2. Count matches for each tool name
    Expected Result: All three tool names appear in upstream.json tools section
    Failure Indicators: Any of kiro/pi/trae missing from output
    Evidence: .sisyphus/evidence/task-2-new-tools.txt

  Scenario: Parse error handling — missing section gracefully handled
    Tool: Bash
    Preconditions: None
    Steps:
      1. Verify parseTools() doesn't throw if `## Generated Skill Names` section is absent (defensive check)
      2. Check that the function returns empty arrays gracefully
    Expected Result: No uncaught exceptions; empty/default return
    Failure Indicators: Uncaught error or crash during sync
    Evidence: .sisyphus/evidence/task-2-parse-error-handling.txt
  ```

  **Evidence to Capture:**
  - [ ] task-2-skills-parsed.txt — skills array contents/count
  - [ ] task-2-new-tools.txt — grep output for kiro/pi/trae
  - [ ] task-2-parse-error-handling.txt — error handling verification

  **Commit**: YES (groups with T1, T3, T6)
  - Message: `fix(parser): adapt parseQuickRef/parseTools/parseWorkflows for upstream restructure`
  - Files: `scripts/parse-docs.ts`
  - Pre-commit: `pnpm run sync`

- [ ] 3. Fix `parseWorkflows()` for new sections and renamed headings

  **What to do**:
  - Open `scripts/parse-docs.ts`, locate `parseWorkflows()` (lines 386-453)
  - Three changes needed:
    1. **`patternsSection` heading**: Current code looks for `## Workflow Patterns`. Upstream renamed to `## Workflow Patterns (Expanded Mode)`. Update the heading match to handle both (e.g., startsWith match or regex).
    2. **New `## Two Modes` section**: Upstream added a new `## Two Modes` section explaining core vs expanded profiles. Add extraction logic to capture this section content (store as a new field or append to existing workflow data).
    3. **`ffVsContinue` sub-section**: The H3 heading that contains both `/opsx:ff` and `/opsx:continue` may have changed wording. Verify the regex at line 389 still matches. If not, relax the match pattern.
  - Check `parseWorkflowHighlights()` (lines 455-459) — may also need heading match update if upstream renamed related sections
  - Ensure the `Workflows` interface in `types.ts` can accommodate any new data fields (coordinate with T6)

  **Must NOT do**:
  - Do NOT change the function signature
  - Do NOT modify unrelated parsers
  - Do NOT remove existing workflow data fields

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused function fix, ~20 lines of change
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T4, T5, T6)
  - **Blocks**: T7 (sync depends on parser fixes)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `scripts/parse-docs.ts:386-453` — Current `parseWorkflows()` implementation. Shows section extraction by H2/H3 headings, `patternsSection`, `ffVsContinue` sub-section parsing.
  - `scripts/parse-docs.ts:455-459` — `parseWorkflowHighlights()`. May need parallel heading update.

  **API/Type References**:
  - `src/types.ts:76-83` — `Workflows` interface. Check if a new field is needed for "Two Modes" content.

  **External References**:
  - Upstream `docs/workflows.md`: New `## Two Modes` section, renamed `## Workflow Patterns (Expanded Mode)`.

  **WHY Each Reference Matters**:
  - Current parser code: Understand exact heading match patterns to minimally adjust.
  - `Workflows` interface: Determine if structural change needed for new section data.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Workflow patterns section parsed despite heading rename
    Tool: Bash
    Preconditions: Parser fix applied, sync completed
    Steps:
      1. Run `pnpm run sync`
      2. Check `src/data/upstream.json` for workflow patterns data
      3. Run `node -e "const d=require('./src/data/upstream.json'); console.log(JSON.stringify(d.workflows?.patterns?.length || 'missing'))"` (or equivalent)
    Expected Result: Workflow patterns array is populated (non-empty)
    Failure Indicators: patterns is empty or undefined
    Evidence: .sisyphus/evidence/task-3-workflow-patterns.txt

  Scenario: Two Modes section captured
    Tool: Bash
    Preconditions: Sync completed
    Steps:
      1. Search upstream.json for "Two Modes" or "core" profile content
      2. Run `grep -i 'two modes\|core.*profile\|expanded.*mode' src/data/upstream.json | head -5`
    Expected Result: Two Modes content appears in workflow section data
    Failure Indicators: No mention of modes/profiles in workflows section
    Evidence: .sisyphus/evidence/task-3-two-modes.txt
  ```

  **Evidence to Capture:**
  - [ ] task-3-workflow-patterns.txt — patterns array status
  - [ ] task-3-two-modes.txt — two modes content verification

  **Commit**: YES (groups with T1, T2, T6)
  - Message: `fix(parser): adapt parseQuickRef/parseTools/parseWorkflows for upstream restructure`
  - Files: `scripts/parse-docs.ts`
  - Pre-commit: `pnpm run sync`

- [ ] 4. Update `custom.ts` MANTRA + WORKFLOW_DEMOS + SCENARIO

  **What to do**:
  - Open `src/data/custom.ts`
  - **MANTRA** (lines 3-7): Change `['新','续','用','档']` to `['提','探','用','档']`
    - '提' = propose (提出), '探' = explore, '用' = apply, '档' = archive
  - **WORKFLOW_DEMOS.fast** (lines 17-41): Replace the entire `fast` demo object with the new core profile three-step flow:
    - Steps: `propose → apply → archive`
    - Update title, description, and step descriptions to reflect the propose-based workflow
    - Remove references to `/opsx:new` and `/opsx:ff` from the fast path
  - **SCENARIO.steps** (lines 107-156): Change the first step from `/opsx:new` to `/opsx:propose`
    - Update the step's command reference
    - Update the Chinese description to match the propose command's purpose (一键提出变更并生成实现方案 or similar)

  **Must NOT do**:
  - Do NOT change the `full`/`custom` workflow demo — only modify `fast`
  - Do NOT remove any steps from SCENARIO that still exist upstream
  - Do NOT change the data structure shape (array of steps, etc.)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Direct value replacements in a single file, ~30 lines of edits
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T5, T6)
  - **Blocks**: T9 (frontend rendering depends on correct custom data)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/data/custom.ts:3-7` — Current MANTRA definition. Direct value replacement.
  - `src/data/custom.ts:17-41` — Current WORKFLOW_DEMOS.fast object. Restructure steps to propose→apply→archive.
  - `src/data/custom.ts:107-156` — Current SCENARIO.steps array. First step object needs command update.

  **API/Type References**:
  - `src/types.ts` — Check `WorkflowDemo` and `Scenario` types for field names.

  **External References**:
  - Upstream core profile: propose → apply → archive (three-step default workflow).

  **WHY Each Reference Matters**:
  - Each line range shows exact current values that need replacing — no guessing needed.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: MANTRA updated to propose-based values
    Tool: Bash
    Preconditions: Edit applied
    Steps:
      1. Run `grep -A5 'MANTRA' src/data/custom.ts`
      2. Verify array contains ['提','探','用','档']
    Expected Result: MANTRA = ['提','探','用','档']
    Failure Indicators: Still shows '新' or '续'
    Evidence: .sisyphus/evidence/task-4-mantra.txt

  Scenario: WORKFLOW_DEMOS.fast shows propose flow
    Tool: Bash
    Preconditions: Edit applied
    Steps:
      1. Run `grep -A30 'fast:' src/data/custom.ts | grep -i 'propose\|apply\|archive'`
      2. Verify three-step flow: propose → apply → archive
      3. Verify NO references to `/opsx:new` or `/opsx:ff` in fast section
    Expected Result: fast demo contains propose/apply/archive steps only
    Failure Indicators: Contains /opsx:new or /opsx:ff references
    Evidence: .sisyphus/evidence/task-4-workflow-fast.txt

  Scenario: SCENARIO first step uses /opsx:propose
    Tool: Bash
    Preconditions: Edit applied
    Steps:
      1. Run `grep -A3 'steps' src/data/custom.ts | head -10`
      2. Search for 'propose' in the first step definition
    Expected Result: First step references `/opsx:propose`
    Failure Indicators: First step still references `/opsx:new`
    Evidence: .sisyphus/evidence/task-4-scenario-propose.txt
  ```

  **Evidence to Capture:**
  - [ ] task-4-mantra.txt — MANTRA grep output
  - [ ] task-4-workflow-fast.txt — fast demo content
  - [ ] task-4-scenario-propose.txt — first scenario step

  **Commit**: YES (standalone)
  - Message: `feat(custom): update MANTRA, workflow demos, scenario for propose command`
  - Files: `src/data/custom.ts`
  - Pre-commit: none (custom.ts has no test)


- [ ] 5. Update `custom.ts` command maps (4 maps for `/opsx:propose`)

  **What to do**:
  - Open `src/data/custom.ts`
  - Add `/opsx:propose` entry to ALL FOUR command mapping objects:
    1. **COMMAND_CATEGORY_MAP** (lines 182-193): Add `'/opsx:propose': 'main'`
    2. **COMMAND_CHINESE_NAMES** (lines 196-207): Add `'/opsx:propose': '提出变更'` (or similar Chinese name)
    3. **COMMAND_TYPE_LABELS** (lines 210-221): Add `'/opsx:propose': '主命令'` (main command type)
    4. **COMMAND_USAGE_SCENARIOS** (lines 232-243): Add `'/opsx:propose': '提出新变更并自动生成实现方案'` (usage scenario description)
  - Do NOT remove existing entries for `/opsx:new`, `/opsx:ff`, etc. — old commands still exist in expanded profile
  - Ensure the entry position is consistent with alphabetical or logical ordering of existing entries

  **Must NOT do**:
  - Do NOT remove any existing command entries
  - Do NOT modify values of existing entries
  - Do NOT change the object structure (remains Record<string, string>)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 4 single-line additions across 4 objects in one file
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T4, T6)
  - **Blocks**: T9 (frontend rendering needs correct command maps)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/data/custom.ts:182-193` — COMMAND_CATEGORY_MAP. Follow existing entry pattern: `'/opsx:xxx': 'category'`.
  - `src/data/custom.ts:196-207` — COMMAND_CHINESE_NAMES. Follow existing pattern for Chinese name.
  - `src/data/custom.ts:210-221` — COMMAND_TYPE_LABELS. Follow existing pattern for type label.
  - `src/data/custom.ts:232-243` — COMMAND_USAGE_SCENARIOS. Follow existing pattern for usage description.

  **API/Type References**:
  - None — these are plain string-to-string Record objects.

  **External References**:
  - Upstream `docs/commands.md`: `/opsx:propose` command description for accurate Chinese naming.

  **WHY Each Reference Matters**:
  - Each line range shows exact insertion point and entry pattern to follow.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: /opsx:propose present in all 4 command maps
    Tool: Bash
    Preconditions: Edits applied to custom.ts
    Steps:
      1. Run `grep -c 'propose' src/data/custom.ts`
      2. Verify count is >= 4 (one per map, plus possibly MANTRA/SCENARIO references)
      3. Run `grep 'propose' src/data/custom.ts` to see all occurrences
    Expected Result: At least 4 'propose' entries in the maps + SCENARIO/DEMOS references
    Failure Indicators: Count < 4 or any map missing propose entry
    Evidence: .sisyphus/evidence/task-5-propose-maps.txt

  Scenario: Existing commands NOT removed
    Tool: Bash
    Preconditions: Edits applied
    Steps:
      1. Run `grep -c 'opsx:new' src/data/custom.ts`
      2. Verify /opsx:new entries still exist in all 4 maps
    Expected Result: /opsx:new appears in all 4 command maps (count >= 4)
    Failure Indicators: Any /opsx:new entry missing
    Evidence: .sisyphus/evidence/task-5-existing-preserved.txt
  ```

  **Evidence to Capture:**
  - [ ] task-5-propose-maps.txt — grep output of propose entries
  - [ ] task-5-existing-preserved.txt — grep output of existing entries preserved

  **Commit**: YES (groups with T4)
  - Message: `feat(custom): update MANTRA, workflow demos, scenario for propose command`
  - Files: `src/data/custom.ts`
  - Pre-commit: none

- [ ] 6. Review & update `types.ts` if needed

  **What to do**:
  - Open `src/types.ts` (236 lines)
  - **Tool interface** (lines 30-34): Check if upstream changes to `docs/supported-tools.md` require field updates:
    - Current fields: `name`, `skillsLocation`, `commandsLocation`
    - Upstream now uses path patterns like `openspec-*/SKILL.md` for tool installation locations
    - If the tool directory table format changed, may need to update field semantics
    - If Trae (no command adapter) breaks the assumption that all tools have `commandsLocation`, may need to make `commandsLocation` optional
  - **Workflows interface** (lines 76-83): Check if the new `## Two Modes` section needs a dedicated field:
    - If T3 stores it as part of existing `highlights` or `patterns`, no change needed
    - If T3 needs a new field like `twoModes: string`, add it here
  - **Coordinate with T2 and T3**: If those tasks identify type changes needed, this task applies them
  - If NO type changes are needed after review, mark task as complete with "no changes required" evidence

  **Must NOT do**:
  - Do NOT add speculative fields "just in case"
  - Do NOT rename existing fields
  - Do NOT change the overall interface structure

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Review + possibly 1-2 line additions
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T2, T3, T4, T5)
  - **Blocks**: T7 (sync uses types for output shape)
  - **Blocked By**: None (but should review T2/T3 findings if available)

  **References**:

  **Pattern References**:
  - `src/types.ts:30-34` — `Tool` interface current definition.
  - `src/types.ts:42-45` — `Skill` interface.
  - `src/types.ts:76-83` — `Workflows` interface.
  - `src/types.ts:214-236` — `UpstreamData` top-level interface.

  **API/Type References**:
  - Same as above — these ARE the type definitions.

  **External References**:
  - Upstream `docs/supported-tools.md`: New tool directory table format.
  - Upstream `docs/workflows.md`: New `## Two Modes` section structure.

  **WHY Each Reference Matters**:
  - Each interface is a contract consumed by both parsers and renderers. Changes here ripple.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: TypeScript compilation succeeds after type changes
    Tool: Bash
    Preconditions: Type changes applied (if any)
    Steps:
      1. Run `npx tsc --noEmit`
      2. Check exit code
    Expected Result: Exit code 0, no type errors
    Failure Indicators: Type errors in parse-docs.ts or section renderers
    Evidence: .sisyphus/evidence/task-6-tsc-check.txt

  Scenario: No unnecessary type additions (if no changes needed)
    Tool: Bash
    Preconditions: Review completed
    Steps:
      1. Run `git diff src/types.ts` (should be empty or minimal)
      2. Document finding in evidence
    Expected Result: Either minimal targeted changes or no changes (with justification)
    Failure Indicators: Large diff with speculative fields
    Evidence: .sisyphus/evidence/task-6-types-diff.txt
  ```

  **Evidence to Capture:**
  - [ ] task-6-tsc-check.txt — tsc compilation output
  - [ ] task-6-types-diff.txt — git diff output for types.ts

  **Commit**: YES (groups with T1, T2, T3)
  - Message: `fix(parser): adapt parseQuickRef/parseTools/parseWorkflows for upstream restructure`
  - Files: `src/types.ts`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 7. Run `pnpm run sync` to sync upstream data

  **What to do**:
  - Ensure T1, T2, T3, T6 are all complete (parser fixes + types)
  - Run `pnpm run sync` which executes `scripts/build-data.ts`
  - This will:
    1. Fetch latest upstream docs from GitHub (SHA `d7d186088eb1c5878c3d9f91bd928f06483fcb98`)
    2. Parse all 12 tracked docs using the fixed parsers
    3. Write `src/data/upstream.json` with new data
    4. Compute incremental translations and write `src/data/translations.json`
    5. Update `.last-sha` to the new commit SHA
  - If sync fails, read error output carefully:
    - Parser errors → likely a T1/T2/T3 fix was incomplete
    - Network errors → GitHub API rate limit (retry or set GITHUB_TOKEN)
    - Translation errors → DeepSeek API key missing (acceptable, translations will be skipped)
  - Verify the output files are updated correctly

  **Must NOT do**:
  - Do NOT manually edit `upstream.json` or `translations.json`
  - Do NOT manually edit `.last-sha`
  - Do NOT modify any scripts during this task

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single command execution + output verification
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (solo)
  - **Blocks**: T8, T9
  - **Blocked By**: T1, T2, T3, T6

  **References**:

  **Pattern References**:
  - `scripts/build-data.ts` — Main sync orchestrator. Calls fetchUpstream() → parseDocs() → computeTranslations(). Shows the full sync pipeline.
  - `scripts/fetch-upstream.ts` — FILES_TO_FETCH array (12 files), compareCommits() for SHA diff detection.

  **API/Type References**:
  - `.last-sha` — Current SHA file. Should update from `a0608d0b...` to `d7d18608...`.
  - `src/data/upstream.json` — Output file. commitSha should start with `d7d18608`.

  **External References**:
  - GitHub API: `GITHUB_TOKEN` env var for rate limit avoidance.
  - DeepSeek API: `DEEPSEEK_API_KEY` env var for translations (optional).

  **WHY Each Reference Matters**:
  - build-data.ts: Know the full pipeline to debug any failures.
  - .last-sha: Verify sync actually detected the upstream update.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Sync completes without errors
    Tool: Bash
    Preconditions: T1-T3, T6 completed (parser fixes applied)
    Steps:
      1. Run `pnpm run sync 2>&1`
      2. Check exit code: `echo $?`
      3. Check for error strings in output: `pnpm run sync 2>&1 | grep -i 'error\|fail\|exception'`
    Expected Result: Exit code 0, no error strings in output
    Failure Indicators: Non-zero exit code, error messages about parsing or API
    Evidence: .sisyphus/evidence/task-7-sync-output.txt

  Scenario: upstream.json updated to new SHA
    Tool: Bash
    Preconditions: Sync completed
    Steps:
      1. Run `node -e "const d=require('./src/data/upstream.json'); console.log(d.commitSha)"`
      2. Verify SHA starts with `d7d18608`
      3. Run `head -c 8 .last-sha`
    Expected Result: commitSha starts with 'd7d18608', .last-sha matches
    Failure Indicators: Old SHA still present (a0608d0b)
    Evidence: .sisyphus/evidence/task-7-sha-check.txt

  Scenario: /opsx:propose command data present in upstream.json
    Tool: Bash
    Preconditions: Sync completed
    Steps:
      1. Run `grep -c 'propose' src/data/upstream.json`
      2. Run `node -e "const d=require('./src/data/upstream.json'); const cmds=d.commands?.items||[]; const p=cmds.find(c=>c.name?.includes('propose')); console.log(p?'FOUND':'MISSING', JSON.stringify(p?.name))"`
    Expected Result: 'propose' appears multiple times; command entry found
    Failure Indicators: Zero occurrences or MISSING
    Evidence: .sisyphus/evidence/task-7-propose-data.txt
  ```

  **Evidence to Capture:**
  - [ ] task-7-sync-output.txt — full sync stdout/stderr
  - [ ] task-7-sha-check.txt — SHA verification
  - [ ] task-7-propose-data.txt — propose command data verification

  **Commit**: YES (standalone after Wave 2-3 completion)
  - Message: `chore(sync): sync upstream to d7d18608 with translations`
  - Files: `src/data/upstream.json`, `src/data/translations.json`, `.last-sha`
  - Pre-commit: `pnpm run sync` (already run)

- [ ] 8. Verify and update translations for new content

  **What to do**:
  - After T7 sync, check `src/data/translations.json` for new entries
  - If `DEEPSEEK_API_KEY` was set, translations should have been auto-generated during sync
  - If translations were NOT generated (no API key), the file may have gaps:
    1. Check for `/opsx:propose` related translations
    2. Check for new tool names (kiro, pi, trae) translations
    3. Check for "Two Modes" / profile content translations
  - If translations are missing, either:
    a. Set `DEEPSEEK_API_KEY` and re-run `pnpm run sync` (preferred)
    b. Or manually add minimal Chinese translations for critical new entries
  - Review `scripts/translate.ts` to understand translation computation logic
  - Verify translation coverage: compare keys in upstream.json vs translations.json

  **Must NOT do**:
  - Do NOT machine-translate without DeepSeek API (no Google Translate, etc.)
  - Do NOT modify translation logic in scripts/translate.ts
  - Do NOT delete existing translations

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification + possible re-sync, no complex logic
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T9)
  - **Blocks**: T10 (build needs translations)
  - **Blocked By**: T7 (sync must complete first)

  **References**:

  **Pattern References**:
  - `scripts/translate.ts` — Translation computation logic. Shows how incremental translations work, key matching, DeepSeek API calls.
  - `src/data/translations.json` — Current translations file. Compare before/after sync for new entries.

  **API/Type References**:
  - `src/types.ts:Translations` — Translation type structure.

  **External References**:
  - DeepSeek API: `DEEPSEEK_API_KEY` for auto-translation.

  **WHY Each Reference Matters**:
  - translate.ts: Understand incremental translation logic to verify correctness.
  - translations.json: Compare before/after to identify gaps.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Translation file updated after sync
    Tool: Bash
    Preconditions: T7 sync completed
    Steps:
      1. Run `wc -l src/data/translations.json` (compare with pre-sync line count ~1331)
      2. Check if file was modified: `git diff --stat src/data/translations.json`
    Expected Result: Line count increased or file modified (new translations added)
    Failure Indicators: File unchanged (no new translations at all)
    Evidence: .sisyphus/evidence/task-8-translations-diff.txt

  Scenario: Critical new content has translations
    Tool: Bash
    Preconditions: Sync with translations completed
    Steps:
      1. Run `grep -i 'propose' src/data/translations.json | head -5`
      2. Check for profile/mode related translations
    Expected Result: At least some propose-related content has Chinese translations
    Failure Indicators: No propose-related translations (acceptable if no API key, document in evidence)
    Evidence: .sisyphus/evidence/task-8-propose-translations.txt
  ```

  **Evidence to Capture:**
  - [ ] task-8-translations-diff.txt — file diff/stats
  - [ ] task-8-propose-translations.txt — new translation entries

  **Commit**: YES (groups with T7)
  - Message: `chore(sync): sync upstream to d7d18608 with translations`
  - Files: `src/data/translations.json`
  - Pre-commit: none

- [ ] 9. Verify frontend renderers handle new data correctly

  **What to do**:
  - After T4, T5 (custom.ts updates) and T7 (sync) are complete
  - Start dev server: `pnpm dev`
  - Check each section renderer for compatibility with updated data:
    1. **`src/sections/commands.ts`** (120 lines): Does it render `/opsx:propose` command card? Check if it reads from COMMAND_CATEGORY_MAP/COMMAND_CHINESE_NAMES — if so, the T5 additions should flow through automatically.
    2. **`src/sections/workflow.ts`**: Does it render WORKFLOW_DEMOS.fast correctly? Check if it reads the step array and displays them.
    3. **`src/sections/scenario.ts`**: Does it render the updated SCENARIO.steps with `/opsx:propose` as first step?
    4. **`src/sections/tools.ts`**: Does it render the new tool entries (kiro, pi, trae)?
    5. **`src/sections/hero.ts`**: Does it display the updated MANTRA '提探用档'?
    6. **`src/sections/reference.ts`**: Does it render the updated quickRef table with dual-table entries?
  - If a renderer breaks due to data structure changes, apply MINIMAL fixes
  - Use Playwright to navigate and screenshot each section for evidence

  **Must NOT do**:
  - Do NOT refactor renderers beyond what's needed for data compatibility
  - Do NOT change styling or layout
  - Do NOT add new UI features

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification + possible 1-2 line fixes per renderer
  - **Skills**: `['playwright']`
    - `playwright`: Needed for browser-based visual verification and screenshot capture

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T8)
  - **Blocks**: T10 (build requires all renderers working)
  - **Blocked By**: T4, T5, T7

  **References**:

  **Pattern References**:
  - `src/sections/commands.ts` — Command card renderer. Check how it reads command data and maps.
  - `src/sections/workflow.ts` — Workflow demo renderer.
  - `src/sections/scenario.ts` — Scenario step renderer.
  - `src/sections/tools.ts` — Tool directory renderer.
  - `src/sections/hero.ts` — Hero section with MANTRA display.
  - `src/sections/reference.ts` — Quick reference table renderer.

  **API/Type References**:
  - `src/data/custom.ts` — All custom data constants consumed by renderers.
  - `src/data/upstream.json` — Parsed upstream data consumed by renderers.

  **External References**:
  - None — all local verification.

  **WHY Each Reference Matters**:
  - Each renderer file shows how data is consumed — any type mismatch will be caught here.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Commands section shows /opsx:propose card
    Tool: Playwright (via playwright skill)
    Preconditions: Dev server running (`pnpm dev`), T4, T5, T7 complete
    Steps:
      1. Navigate to `http://localhost:5173/#commands`
      2. Search page for text containing 'propose'
      3. Verify a command card for /opsx:propose exists with correct category label
      4. Screenshot the commands section
    Expected Result: /opsx:propose card visible with '主命令' category
    Failure Indicators: No propose card, or card with wrong category
    Evidence: .sisyphus/evidence/task-9-commands-propose.png

  Scenario: Hero section shows updated MANTRA
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:5173/`
      2. Check hero section for MANTRA characters
      3. Verify '提', '探', '用', '档' are displayed
    Expected Result: MANTRA shows '提探用档' (not '新续用档')
    Failure Indicators: Old MANTRA characters visible
    Evidence: .sisyphus/evidence/task-9-hero-mantra.png

  Scenario: Workflow fast demo shows propose flow
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:5173/#workflow`
      2. Find the fast/quick workflow demo section
      3. Verify steps mention propose → apply → archive
    Expected Result: Fast workflow shows three-step propose flow
    Failure Indicators: Old flow with new/ff/verify steps visible
    Evidence: .sisyphus/evidence/task-9-workflow-fast.png

  Scenario: Tools section includes new tools
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:5173/#tools`
      2. Search for 'kiro', 'pi', 'trae' in the tools section
    Expected Result: All three new tools appear in the directory
    Failure Indicators: Any of kiro/pi/trae missing
    Evidence: .sisyphus/evidence/task-9-tools-new.png
  ```

  **Evidence to Capture:**
  - [ ] task-9-commands-propose.png — commands section screenshot
  - [ ] task-9-hero-mantra.png — hero section screenshot
  - [ ] task-9-workflow-fast.png — workflow section screenshot
  - [ ] task-9-tools-new.png — tools section screenshot

  **Commit**: NO (verification only, fixes grouped with relevant commits)

- [ ] 10. Build and visual verification

  **What to do**:
  - Run `pnpm build` and verify it completes without errors
  - Run `pnpm preview` to serve the production build
  - Use Playwright to navigate the full production site:
    1. Verify all sections render correctly
    2. Verify no console errors in browser DevTools
    3. Verify anchor navigation works (#commands, #workflow, #scenario, #reference, #tools)
    4. Verify footer shows updated sync SHA
  - Take final evidence screenshots of each section
  - Kill the preview server after verification

  **Must NOT do**:
  - Do NOT modify any source files during this task
  - This is a VERIFICATION-ONLY task

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multi-step verification with build + Playwright, but no code changes
  - **Skills**: `['playwright']`
    - `playwright`: Browser-based visual verification and console error checking

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (solo)
  - **Blocks**: F1-F4 (final verification wave)
  - **Blocked By**: T8, T9

  **References**:

  **Pattern References**:
  - `package.json` — `build` and `preview` scripts.
  - `index.html` — Entry point, verify it loads correctly.

  **API/Type References**:
  - None — verification only.

  **External References**:
  - Vite build: `pnpm build` produces `dist/` directory.
  - Vite preview: `pnpm preview` serves on port 4173.

  **WHY Each Reference Matters**:
  - Build scripts: Know exact commands and expected behavior.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Production build succeeds
    Tool: Bash
    Preconditions: All T1-T9 complete
    Steps:
      1. Run `pnpm build 2>&1`
      2. Check exit code: `echo $?`
      3. Verify `dist/` directory exists: `ls dist/`
    Expected Result: Exit code 0, dist/ contains index.html + assets
    Failure Indicators: Build errors, missing dist/ directory
    Evidence: .sisyphus/evidence/task-10-build-output.txt

  Scenario: Production site renders all sections
    Tool: Playwright (via playwright skill)
    Preconditions: `pnpm preview` running
    Steps:
      1. Start `pnpm preview &` in background
      2. Navigate to `http://localhost:4173/`
      3. Scroll through all sections: hero, commands, workflow, scenario, reference, tools, footer
      4. Verify no blank sections or error messages
      5. Screenshot full page
    Expected Result: All sections render with content, no broken layouts
    Failure Indicators: Blank sections, JS errors in console, layout breaks
    Evidence: .sisyphus/evidence/task-10-full-page.png

  Scenario: No console errors in production build
    Tool: Playwright
    Preconditions: Preview server running
    Steps:
      1. Navigate to `http://localhost:4173/`
      2. Open console log collection
      3. Navigate through all anchor links
      4. Check collected console messages for errors/warnings
    Expected Result: Zero error-level console messages
    Failure Indicators: Any console.error or uncaught exceptions
    Evidence: .sisyphus/evidence/task-10-console-log.txt

  Scenario: Footer shows updated SHA
    Tool: Playwright
    Preconditions: Preview server running
    Steps:
      1. Navigate to `http://localhost:4173/`
      2. Scroll to footer
      3. Find SHA text element
      4. Verify it contains 'd7d18608' (first 8 chars of new SHA)
    Expected Result: Footer displays sync SHA starting with 'd7d18608'
    Failure Indicators: Old SHA 'a0608d0b' visible or SHA missing
    Evidence: .sisyphus/evidence/task-10-footer-sha.png
  ```

  **Evidence to Capture:**
  - [ ] task-10-build-output.txt — full build stdout/stderr
  - [ ] task-10-full-page.png — production full page screenshot
  - [ ] task-10-console-log.txt — browser console messages
  - [ ] task-10-footer-sha.png — footer SHA screenshot

  **Commit**: NO (verification only, no source changes)

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, grep for expected strings). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start `pnpm dev`. Navigate to each section: commands (verify `/opsx:propose` card exists with correct category), workflow (verify fast mode shows propose flow), scenario (verify step 1 is propose), tools (verify kiro/pi/trae present), reference (verify propose in table). Save screenshots to `.sisyphus/evidence/final-qa/`.
  Output: `Sections [N/N pass] | New Content [N/N visible] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Commit 1** (after Wave 1): `fix(parser): adapt parseQuickRef/parseTools/parseWorkflows for upstream restructure`
  - Files: `scripts/parse-docs.ts`, `src/types.ts`
- **Commit 2** (after Wave 1): `feat(custom): update MANTRA, workflows demos, scenario for propose command`
  - Files: `src/data/custom.ts`
- **Commit 3** (after Wave 2-3): `chore(sync): sync upstream to d7d18608 with translations`
  - Files: `src/data/upstream.json`, `src/data/translations.json`, `.last-sha`

---

## Success Criteria

### Verification Commands
```bash
pnpm run sync      # Expected: exit 0, no errors
pnpm build         # Expected: exit 0, no TypeScript/Vite errors
grep -c "propose"  src/data/upstream.json   # Expected: > 0
grep "提"          src/data/custom.ts       # Expected: MANTRA contains 提
grep "d7d18608"    .last-sha 2>/dev/null || head -c 8 .last-sha  # Expected: matches
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] `pnpm build` passes
- [ ] Site renders correctly in browser
