# Decisions

## 2026-02-24 Session Start

### Product decisions (user-confirmed)
1. MANTRA → ['提','探','用','档'] (propose/explore/apply/archive)
2. WORKFLOW_DEMOS.fast → core profile 3-step: propose → apply → archive
3. SCENARIO.steps[0] → /opsx:propose
4. /opsx:propose in COMMAND_CATEGORY_MAP → 'main'

### Technical decisions
- Minimal modification principle: only touch parseQuickRef/parseTools/parseWorkflows
- No new dependencies
- No framework refactoring
- Commit strategy: 3 commits (parser fix, custom.ts update, sync data)
- Types.ts: only modify if data structure genuinely changes (coordinate T2/T3 findings first)

## Two Modes section not captured (2026-02-25)
- Upstream `docs/workflows.md` added a `## Two Modes` section
- `Workflows` interface in `src/types.ts` has no `twoModes` field
- Decision: skip capturing — adding speculative fields to types.ts was out of scope for this task
- If the frontend needs this content, add `twoModes: string[]` to `Workflows` in types.ts and capture it with `extractBullets(twoModesSection.body)`
