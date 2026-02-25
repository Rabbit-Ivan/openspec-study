# Learnings

## 2026-02-24 Session Start

### Project conventions
- 使用 pnpm (not npm/yarn)
- TypeScript ESM + tsx for scripts
- No test framework — QA is agent-executed via Bash/Playwright
- `pnpm run sync` = scripts/build-data.ts orchestrator (fetch → parse → translate)
- Build: `pnpm build` via Vite

### Key file paths (confirmed line numbers)
- `scripts/parse-docs.ts`: parseQuickRef (237-252), parseTools (336-366), parseWorkflows (386-453)
- `src/data/custom.ts`: MANTRA (3-7), WORKFLOW_DEMOS.fast (17-41), SCENARIO.steps (107-156), COMMAND_CATEGORY_MAP (182-193), COMMAND_CHINESE_NAMES (196-207), COMMAND_TYPE_LABELS (210-221), COMMAND_USAGE_SCENARIOS (232-243)
- `src/types.ts`: Tool (30-34), Skill (42-45), Workflows (76-83), UpstreamData (214-236)

### Upstream changes (a0608d0b → d7d18608)
- New `/opsx:propose` command (combines new+ff)
- profile system: core (propose/explore/apply/archive) vs custom (expanded)
- Default workflow: propose → apply → archive (was new → ff → apply → archive)
- New tools: kiro, pi, trae
- `docs/supported-tools.md`: "What Gets Installed" → "Generated Skill Names", table → bullet list
- `docs/commands.md`: ## Quick Reference now has TWO sub-tables
- `docs/workflows.md`: ## Workflow Patterns → ## Workflow Patterns (Expanded Mode), new ## Two Modes section

### User-confirmed decisions
- MANTRA: ['提','探','用','档']
- WORKFLOW_DEMOS.fast: propose → apply → archive (3 steps)
- SCENARIO.steps[0]: /opsx:propose
- /opsx:propose COMMAND_CATEGORY_MAP: 'main'

## T1/T2/T3 Parser Fixes (2026-02-25)

### T1 — parseQuickRef() dual-table fix
- Pattern: loop `for (const table of extractTables(...))` instead of `extractTables(...)[0]`
- This handles any number of tables in the section body without structural assumptions

### T2 — parseTools() bullet list parsing
- Regex: `/^[-*]\s+\*\*([^*]+)\*\*/` extracts bold name from bullet line
- Description: strip optional parenthetical `(SKILL.md)` then leading dash/em-dash
- `afterName.replace(/^\([^)]+\)\s*/, '').replace(/^[-—]\s*/, '').trim()`

### T3 — parseWorkflows() heading regex relaxation
- Changed `/^Workflow Patterns$/i` → `/^Workflow Patterns/i` (dropped `$`)
- Now matches "Workflow Patterns (Expanded Mode)" and any future variants
- `## Two Modes` section NOT captured: `Workflows` interface has no field for it; noted in decisions.md

## T6 Types Review Decision
Review date: 2026-02-25

**`Tool.commandsLocation`**: NO CHANGE. `parseTools()` (parse-docs.ts:344) checks `row.length < 3` and skips rows with fewer than 3 columns. When a row is included, `commandsLocation: row[2]` is always assigned as a string (possibly empty string `""`). TypeScript type `commandsLocation: string` is accurate — the field always exists for any tool that makes it into the array.

**`Workflows.twoModes`**: NO CHANGE. `parseWorkflows()` (parse-docs.ts:450-457) returns exactly 6 fields: `philosophy`, `patterns`, `ffVsContinue`, `updateVsNew`, `bestPractices`, `quickReference`. No `twoModes` field is captured, so no interface change warranted.

**TSC result**: Pre-existing error in `scripts/translate.ts:72` (openai API `timeout` param type mismatch) — unrelated to types.ts. No errors in src/types.ts itself.

**Conclusion**: `src/types.ts` needed zero changes. The parser output fully matches the existing interfaces.

## T4+T5 (2026-02-25)

### MANTRA 改法
- `characters` 和 `english` 数组同步改，保持顺序对应
- 最终：`['提','探','用','档']` / `['propose','explore','apply','archive']`

### WORKFLOW_DEMOS.fast 改法
- 从5步（new → ff → apply → verify → archive）缩短为3步（propose → apply → archive）
- lines 数组行数从15行减至11行，title 改为"核心模式"

### SCENARIO.steps[0] 改法
- 整个 step 对象替换（command + desc + results 全部更新）
- results 改为反映 propose 语义（自动生成方案，一步完成）

### 4个 map 追加 /opsx:propose
- COMMAND_CATEGORY_MAP: 'main'
- COMMAND_CHINESE_NAMES: '提出变更'  
- COMMAND_TYPE_LABELS: '提出'
- COMMAND_USAGE_SCENARIOS: 完整描述 new+ff 合并语义

### 预存 TS 错误
- `scripts/translate.ts:72` 有 openai SDK timeout 参数类型错误，与本次改动无关
