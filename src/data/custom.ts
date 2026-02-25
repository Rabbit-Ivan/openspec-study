// Custom Chinese content that stays fixed regardless of upstream changes

export const MANTRA = {
    characters: ['提', '探', '用', '档'],
    english: ['propose', 'explore', 'apply', 'archive'],
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
        title: '⚡ 核心模式',
        description: '最简链路：<strong style="color: var(--jade-glow);">propose → apply → archive</strong>',
        lines: [
            { type: 'comment', text: '# 默认核心流（core）：提出 → 实施 → 归档' },
            { type: 'input', text: '/opsx:propose add-product-favorites' },
            { type: 'success', text: '✓ 已生成 proposal.md, specs/, design.md, tasks.md' },
            { type: 'blank' },
            { type: 'comment', text: '# 第二步：执行任务' },
            { type: 'input', text: '/opsx:apply' },
            { type: 'success', text: '✓ 开始执行 tasks.md 中的任务...' },
            { type: 'blank' },
            { type: 'comment', text: '# 第三步：归档（完成后收尾）' },
            { type: 'input', text: '/opsx:archive' },
            { type: 'success', text: '✓ 已同步 specs 并归档到 archive/' },
        ],
    },
    detailed: {
        title: '🔍 精细模式',
        description: '进阶扩展流（需先启用 profile），每一步都可 <strong style="color: var(--gold-glow);">审核和调整</strong>',
        lines: [
            { type: 'comment', text: '# 前置：启用扩展命令（仅需一次）' },
            { type: 'input', text: 'openspec config profile' },
            { type: 'input', text: 'openspec update' },
            { type: 'success', text: '✓ 扩展命令已启用（new/continue/ff/verify/...）' },
            { type: 'blank' },
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
        description: '扩展模式下支持 <strong style="color: var(--vermilion-glow);">并行开发</strong>，可用 <strong style="color: var(--gold-glow);">bulk-archive</strong> 批量收尾',
        lines: [
            { type: 'comment', text: '# 并行模式（扩展命令）' },
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
            command: '/opsx:propose',
            desc: '默认核心流起点：提出变更并自动生成实现方案',
            results: [
                '✓ 已创建 openspec/changes/product-favorites/',
                '✓ 已生成 proposal.md、specs/、design.md、tasks.md',
                '✓ 变更已就绪，可直接执行 /opsx:apply',
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
            command: '/opsx:archive',
            desc: '功能完成后归档，必要时会提示先同步 specs',
            results: [
                '✓ 检测到 delta specs 未同步时，会提示是否 /opsx:sync',
                '✓ 已归档到 openspec/changes/archive/2025-02-01-product-favorites/',
            ],
        },
        {
            command: '进阶可选（Expanded）',
            desc: '需要更细粒度控制时，再启用扩展命令链路',
            results: [
                '• /opsx:new + /opsx:continue：逐步产出工件，适合每步审查',
                '• /opsx:ff：一次性生成规划工件，适合需求清晰场景',
                '• /opsx:verify / /opsx:sync / /opsx:bulk-archive：用于验证、同步与批量收尾',
            ],
        },
    ],
}

export const SECTION_LABELS = {
    commands: '核心命令',
    commandsTitle: '命令分类一览',
    commandsDesc: '看似命令很多，实则分为三类：主线命令（必用）、速度控制（二选一）、辅助命令（按需）',
    workflow: '工作流程',
    workflowTitle: '核心默认流 + 进阶扩展流',
    workflowDesc: '默认先走 core（propose → apply → archive），需要更多控制时再启用扩展命令。',
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
    '/opsx:propose': 'main',
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
    '/opsx:propose': '提出变更',
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
    '/opsx:propose': '提出',
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
    '/opsx:explore': '需求不清楚，需要调研',
    '/opsx:new': '扩展模式下开始新变更',
    '/opsx:continue': '扩展模式下逐步生成产物（想每步审核）',
    '/opsx:ff': '扩展模式下范围明确，准备开写',
    '/opsx:apply': '准备写代码',
    '/opsx:verify': '扩展模式下归档前检查',
    '/opsx:sync': '扩展模式下把 delta specs 合并回主 specs',
    '/opsx:archive': '完成后归档（可能提示 sync）',
    '/opsx:bulk-archive': '扩展模式下多个变更一起归档',
    '/opsx:onboard': '新手走一遍完整流程',
    '/opsx:propose': '默认核心流起点：提出变更并生成规划工件',
}
