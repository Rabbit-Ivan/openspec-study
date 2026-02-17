// Custom Chinese content that stays fixed regardless of upstream changes

export const MANTRA = {
    characters: ['新', '续', '用', '档'],
    english: ['new', 'continue', 'apply', 'archive'],
    colors: ['jade', 'gold', 'vermilion', 'jade'],
}

export const HERO = {
    badge: 'OPSX · Artifact-Driven Workflow',
    title: 'OpenSpec',
    subtitle: '工作流指南',
    description: '从繁杂命令到四字口诀，掌握 AI 驱动的规格驱动开发工作流',
}

export const WORKFLOW_DEMOS = {
    fast: {
        title: '⚡ 快速模式',
        description: '官方推荐链路：<strong style="color: var(--jade-glow);">new → ff → apply → verify → archive</strong>',
        lines: [
            { type: 'comment', text: '# 第一步：创建变更' },
            { type: 'input', text: '/opsx:new add-product-favorites' },
            { type: 'success', text: '✓ 已创建 openspec/changes/add-product-favorites/' },
            { type: 'blank' },
            { type: 'comment', text: '# 第二步：快进生成规划文档' },
            { type: 'input', text: '/opsx:ff' },
            { type: 'success', text: '✓ 已生成 proposal.md, specs/, design.md, tasks.md' },
            { type: 'blank' },
            { type: 'comment', text: '# 第三步：执行任务' },
            { type: 'input', text: '/opsx:apply' },
            { type: 'success', text: '✓ 开始执行 tasks.md 中的任务...' },
            { type: 'blank' },
            { type: 'comment', text: '# 第四步：验证实现与规格一致' },
            { type: 'input', text: '/opsx:verify' },
            { type: 'success', text: '✓ 验证完成：0 critical，1 warning' },
            { type: 'blank' },
            { type: 'comment', text: '# 第五步：归档（如有需要会提示 sync）' },
            { type: 'input', text: '/opsx:archive' },
            { type: 'success', text: '✓ 已同步 specs 并归档到 archive/' },
        ],
    },
    detailed: {
        title: '🔍 精细模式',
        description: '每一步都可以 <strong style="color: var(--gold-glow);">审核和调整</strong>，适合重要功能',
        lines: [
            { type: 'comment', text: '# 第一步：先调研（可选）' },
            { type: 'input', text: '/opsx:explore' },
            { type: 'output', text: '帮我调研一下用户系统和数据库结构' },
            { type: 'blank' },
            { type: 'comment', text: '# 第二步：创建变更' },
            { type: 'input', text: '/opsx:new "product-favorites"' },
            { type: 'success', text: '✓ 已创建变更目录' },
            { type: 'blank' },
            { type: 'comment', text: '# 第三步：逐个生成文档（每次可审核）' },
            { type: 'input', text: '/opsx:continue' },
            { type: 'success', text: '✓ 已生成 proposal.md' },
            { type: 'input', text: '/opsx:continue' },
            { type: 'success', text: '✓ 已生成 specs/' },
            { type: 'input', text: '/opsx:continue' },
            { type: 'success', text: '✓ 已生成 design.md' },
            { type: 'input', text: '/opsx:continue' },
            { type: 'success', text: '✓ 已生成 tasks.md' },
            { type: 'blank' },
            { type: 'comment', text: '# 第四步：执行 → 验证 → 归档' },
            {
                type: 'mixed', parts: [
                    { type: 'input', text: '/opsx:apply' },
                    { type: 'text', text: ' → ' },
                    { type: 'input', text: '/opsx:verify' },
                    { type: 'text', text: ' → ' },
                    { type: 'input', text: '/opsx:archive' },
                ]
            },
        ],
    },
    parallel: {
        title: '🔀 并行模式',
        description: '支持 <strong style="color: var(--vermilion-glow);">并行开发</strong>，随时切换上下文，用 <strong style="color: var(--gold-glow);">bulk-archive</strong> 批量收尾',
        lines: [
            { type: 'comment', text: '# 同时开多个变更，随时切换' },
            { type: 'input-with-arg', command: '/opsx:ff', arg: ' add-dark-mode' },
            { type: 'success', text: '✓ 已生成所有文档' },
            { type: 'input', text: '/opsx:apply' },
            { type: 'output', text: '正在实现 dark-mode... 被紧急 bug 打断' },
            { type: 'blank' },
            { type: 'comment', text: '# 切换到紧急修复' },
            { type: 'input-with-arg', command: '/opsx:ff', arg: ' fix-login-redirect' },
            { type: 'input', text: '/opsx:apply' },
            { type: 'success', text: '✓ 修复完成' },
            { type: 'input', text: '/opsx:archive' },
            { type: 'blank' },
            { type: 'comment', text: '# 回到 dark-mode 继续' },
            { type: 'input-with-arg', command: '/opsx:apply', arg: ' add-dark-mode' },
            { type: 'success', text: '✓ 从上次中断处继续...' },
            { type: 'blank' },
            { type: 'comment', text: '# 多个变更完成后，批量归档' },
            { type: 'input', text: '/opsx:bulk-archive' },
            { type: 'success', text: '✓ 已批量归档 3 个变更，自动解决 spec 冲突' },
        ],
    },
}

export const SCENARIO = {
    icon: '💎',
    title: '产品收藏功能',
    subtitle: '用户可以收藏喜欢的珠宝产品，在个人中心查看',
    steps: [
        {
            command: '/opsx:new',
            desc: '先创建变更并命名，进入标准工作流',
            results: [
                '✓ 已创建 openspec/changes/product-favorites/',
                '✓ 选择 schema：spec-driven',
                '✓ 下一步可用：/opsx:continue 或 /opsx:ff',
            ],
        },
        {
            command: '/opsx:ff',
            desc: '一口气生成 proposal/specs/design/tasks',
            results: [
                '✓ 生成 proposal.md（为什么做）',
                '✓ 生成 specs/favorites/spec.md（行为规格）',
                '✓ 生成 design.md（技术方案）',
                '✓ 生成 tasks.md（任务清单）',
            ],
        },
        {
            command: '/opsx:apply',
            desc: 'AI 按 tasks.md 逐项执行代码任务',
            results: [
                '[x] 1.1 创建 favorites 数据库表',
                '[x] 1.2 添加 Drizzle schema',
                '[x] 2.1 实现收藏 API',
                '[x] 2.2 实现取消收藏 API',
                '[x] 3.1 产品卡片添加收藏按钮',
                '[x] 3.2 个人中心收藏列表页',
            ],
        },
        {
            command: '/opsx:verify',
            desc: '归档前核对完整性、正确性、一致性',
            results: [
                '✓ Completeness：任务与需求都已覆盖',
                '✓ Correctness：关键场景行为符合规格',
                '✓ Coherence：设计决策已体现在代码中',
            ],
        },
        {
            command: '/opsx:archive',
            desc: '功能完成后归档，必要时先提示同步 specs',
            results: [
                '✓ 检测到 delta specs 未同步，已提示是否 sync',
                '✓ 已归档到 openspec/changes/archive/2025-02-01-product-favorites/',
            ],
        },
    ],
}

export const SECTION_LABELS = {
    commands: '核心命令',
    commandsTitle: '命令分类一览',
    commandsDesc: '看似命令很多，实则分为三类：主线命令（必用）、速度控制（二选一）、辅助命令（按需）',
    workflow: '工作流程',
    workflowTitle: '两种模式对比',
    workflowDesc: '根据功能复杂度选择：快速模式适合日常开发，精细模式适合重要功能',
    scenario: '实战演练',
    scenarioTitle: '场景：给 Benzenith 添加产品收藏功能',
    scenarioDesc: '让我们用一个真实场景，完整走一遍 OpenSpec 工作流',
    reference: '速查表',
    tools: '工具兼容',
    toolsDesc: '不同工具的命令语法略有差异，功能完全相同。运行 <code style="color: var(--gold-glow); background: rgba(243,156,18,0.1); padding: 0.15rem 0.4rem; border-radius: 4px; font-family: \'JetBrains Mono\', monospace; font-size: 0.9rem;">openspec init</code> 自动配置。',
}

// Command category labels
export const COMMAND_CATEGORIES = {
    main: { label: '主线命令 · 必须掌握', color: 'var(--jade-glow)' },
    speed: { label: '速度控制 · 二选一', color: 'var(--gold-glow)' },
    auxiliary: { label: '辅助命令 · 按需使用', color: 'var(--text-secondary)' },
}

// Command category type mapping
export const COMMAND_CATEGORY_MAP: Record<string, 'main' | 'speed' | 'auxiliary'> = {
    '/opsx:new': 'main',
    '/opsx:apply': 'main',
    '/opsx:archive': 'main',
    '/opsx:ff': 'speed',
    '/opsx:continue': 'speed',
    '/opsx:explore': 'auxiliary',
    '/opsx:verify': 'auxiliary',
    '/opsx:sync': 'auxiliary',
    '/opsx:bulk-archive': 'auxiliary',
    '/opsx:onboard': 'auxiliary',
}

// Command Chinese name mapping (fallback if translation not available)
export const COMMAND_CHINESE_NAMES: Record<string, string> = {
    '/opsx:new': '新',
    '/opsx:apply': '用',
    '/opsx:archive': '档',
    '/opsx:ff': '快进',
    '/opsx:continue': '续',
    '/opsx:explore': '探',
    '/opsx:verify': '验',
    '/opsx:sync': '同',
    '/opsx:bulk-archive': '批档',
    '/opsx:onboard': '学',
}

// Command type labels
export const COMMAND_TYPE_LABELS: Record<string, string> = {
    '/opsx:new': '创建',
    '/opsx:apply': '实施',
    '/opsx:archive': '归档',
    '/opsx:ff': '快进模式',
    '/opsx:continue': '逐步模式',
    '/opsx:explore': '调研',
    '/opsx:verify': '验证',
    '/opsx:sync': '同步',
    '/opsx:bulk-archive': '批量归档',
    '/opsx:onboard': '引导教程',
}

// Reference table columns
export const REFERENCE_TABLE_HEADERS = {
    command: '命令',
    chinese: '中文',
    purpose: '作用',
    scenario: '使用场景',
}

// Reference table usage scenario mapping
export const COMMAND_USAGE_SCENARIOS: Record<string, string> = {
    '/opsx:ff': 'new 后快速推进',
    '/opsx:new': '需要逐步审核时',
    '/opsx:continue': '配合 new 使用',
    '/opsx:apply': '开始写代码',
    '/opsx:verify': '归档前检查（推荐）',
    '/opsx:archive': '收尾必用（会提示 sync）',
    '/opsx:explore': '不确定要不要做时',
    '/opsx:sync': 'archive 会自动提示',
    '/opsx:bulk-archive': '并行开发收尾',
    '/opsx:onboard': '新手入门首选',
}
