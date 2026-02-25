# Issues

## 2026-02-24 Session Start

### Known parser compatibility issues
1. parseQuickRef(): Single-table assumption broken — upstream now has TWO sub-tables
2. parseTools(): Section renamed "What Gets Installed" → "Generated Skill Names", format table → bullet list
3. parseWorkflows(): "## Workflow Patterns" renamed to "## Workflow Patterns (Expanded Mode)", new "## Two Modes" section added

### Tech debt (NOT fixing this session)
- parseGettingStarted(): Hardcoded Set of 5 exact title strings — fragile
- parseWorkflows() ffVsContinue regex: depends on H3 title containing both /opsx:ff and /opsx:continue
