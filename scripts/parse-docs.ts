// Parse upstream markdown docs into structured JSON

import type {
    CliCommand,
    CliOption,
    Command,
    CommandArg,
    Concept,
    CustomizationField,
    CustomizationSection,
    GettingStartedStep,
    GlossaryItem,
    InstallStep,
    LanguageExample,
    LegacyCommand,
    MetaInfo,
    MigrationStep,
    MultiLanguageInfo,
    OpsxCommand,
    OpsxComparison,
    OpsxContent,
    OpsxSection,
    Skill,
    Tool,
    ToolSyntax,
    TroubleshootingItem,
    UpstreamData,
    WorkflowDecision,
    WorkflowHighlights,
    WorkflowPattern,
    WorkflowQuickRef,
    Workflows,
} from '../src/types'

interface MarkdownSection {
    title: string
    body: string
    start: number
}

function uniqueStrings(values: string[]): string[] {
    return Array.from(new Set(values.filter(Boolean)))
}

function normalizeInline(text: string): string {
    return text
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[(.*?)\]\([^)]*\)/g, '$1')
        .replace(/\\\*/g, '*')
        .replace(/\s+/g, ' ')
        .trim()
}

function splitByHeading(content: string, level: number): MarkdownSection[] {
    const marker = '#'.repeat(level)
    const regex = new RegExp(`^${marker}\\s+(.+)$`, 'gm')
    const sections: MarkdownSection[] = []
    const matches: Array<{ title: string; start: number }> = []

    let match: RegExpExecArray | null = regex.exec(content)
    while (match) {
        matches.push({
            title: normalizeInline(match[1].trim()),
            start: match.index,
        })
        match = regex.exec(content)
    }

    for (let i = 0; i < matches.length; i++) {
        const current = matches[i]
        const next = matches[i + 1]
        const headerLineEnd = content.indexOf('\n', current.start)
        const bodyStart = headerLineEnd === -1 ? content.length : headerLineEnd + 1
        const bodyEnd = next ? next.start : content.length
        sections.push({
            title: current.title,
            body: content.slice(bodyStart, bodyEnd).trim(),
            start: current.start,
        })
    }

    return sections
}

function findSection(content: string, level: number, titlePattern: RegExp): MarkdownSection | null {
    const sections = splitByHeading(content, level)
    return sections.find(section => titlePattern.test(section.title)) || null
}

function extractCodeBlocks(content: string): string[] {
    const blocks: string[] = []
    const regex = /```[^\n]*\n([\s\S]*?)```/g
    let match: RegExpExecArray | null = regex.exec(content)
    while (match) {
        const code = match[1].trim()
        if (code) blocks.push(code)
        match = regex.exec(content)
    }
    return blocks
}

function extractCommandLinesFromCodeBlocks(content: string): string[] {
    const commands: string[] = []
    for (const block of extractCodeBlocks(content)) {
        for (const line of block.split('\n')) {
            const text = line.trim()
            if (!text || text.startsWith('#')) continue
            commands.push(text)
        }
    }
    return commands
}

function extractBullets(content: string): string[] {
    return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => /^[-*]\s+/.test(line))
        .map(line => normalizeInline(line.replace(/^[-*]\s+/, '')))
}

function extractParagraph(content: string): string {
    const lines = content.split('\n')
    const picked: string[] = []
    let inCode = false

    for (const rawLine of lines) {
        const line = rawLine.trim()
        if (line.startsWith('```')) {
            inCode = !inCode
            continue
        }
        if (inCode) continue
        if (!line) {
            if (picked.length > 0) break
            continue
        }
        if (/^#/.test(line) || /^\|/.test(line) || /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
            if (picked.length > 0) break
            continue
        }
        picked.push(line)
    }

    return normalizeInline(picked.join(' '))
}

function extractTables(content: string): string[][][] {
    const lines = content.split('\n')
    const tables: string[][][] = []
    let current: string[] = []

    const flush = () => {
        if (current.length === 0) return
        const parsed = current
            .map(line => line.trim())
            .filter(line => line.startsWith('|'))
            .map(line => line.split('|').map(cell => normalizeInline(cell.trim())).filter(Boolean))
            .filter(row => row.length > 0)
            .filter(row => !row.every(cell => /^:?-{3,}:?$/.test(cell)))

        if (parsed.length >= 2) {
            tables.push(parsed)
        }
        current = []
    }

    for (const rawLine of lines) {
        const line = rawLine.trim()
        if (line.startsWith('|')) {
            current.push(line)
        } else if (current.length > 0) {
            flush()
        }
    }
    flush()

    return tables
}

function parseArgsFromTables(content: string): CommandArg[] {
    const args: CommandArg[] = []
    for (const table of extractTables(content)) {
        const header = table[0].map(cell => cell.toLowerCase())
        const argIndex = header.indexOf('argument')
        const requiredIndex = header.indexOf('required')
        const descriptionIndex = header.findIndex(cell => /description|purpose/.test(cell))
        if (argIndex === -1 || requiredIndex === -1 || descriptionIndex === -1) continue

        for (const row of table.slice(1)) {
            const name = row[argIndex] || ''
            if (!name) continue
            const requiredText = (row[requiredIndex] || '').toLowerCase()
            args.push({
                name,
                required: requiredText === 'yes' || requiredText === 'required' || requiredText === 'true',
                description: row[descriptionIndex] || '',
            })
        }
    }
    return args
}

function parseOptionsFromTables(content: string): CliOption[] {
    const options: CliOption[] = []
    for (const table of extractTables(content)) {
        const header = table[0].map(cell => cell.toLowerCase())
        const optionIndex = header.indexOf('option')
        const descriptionIndex = header.findIndex(cell => /description|purpose/.test(cell))
        if (optionIndex === -1 || descriptionIndex === -1) continue

        for (const row of table.slice(1)) {
            const name = row[optionIndex] || ''
            if (!name) continue
            options.push({
                name,
                description: row[descriptionIndex] || '',
            })
        }
    }
    return options
}

function extractListUnderLabel(content: string, label: string): string[] {
    const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n---|\\n###|\\n##|$)`)
    const matched = content.match(regex)
    if (!matched) return []
    return extractBullets(matched[1])
}

function extractCommands(content: string): string[] {
    const matches = content.match(/\/opsx:[a-z-]+/g) || []
    return uniqueStrings(matches)
}

function parseQuickRef(content: string): Array<{ name: string; purpose: string }> {
    const quickRefSection = findSection(content, 2, /^Quick Reference$/i)
    if (!quickRefSection) return []
    const result: Array<{ name: string; purpose: string }> = []
    // Handle dual-table structure: collect entries from ALL tables in the section
    for (const table of extractTables(quickRefSection.body)) {
        for (const row of table.slice(1)) {
            if (row.length < 2) continue
            result.push({
                name: row[0],
                purpose: row[1],
            })
        }
    }
    return result
}

function parseCommands(content: string): {
    commands: Command[]
    legacyCommands: LegacyCommand[]
    troubleshooting: TroubleshootingItem[]
    toolSyntax: ToolSyntax[]
} {
    const commandSection = findSection(content, 2, /^Command Reference$/i)
    const quickRefMap = new Map(parseQuickRef(content).map(item => [item.name, item.purpose]))
    const commandHeaders = commandSection ? splitByHeading(commandSection.body, 3) : []
    const commands: Command[] = []

    for (const header of commandHeaders) {
        const nameMatch = header.title.match(/(\/opsx:[^\s]+)/)
        if (!nameMatch) continue
        const name = nameMatch[1]
        const syntaxMatch = header.body.match(/\*\*Syntax:\*\*\s*```[^\n]*\n([\s\S]*?)```/)
        const syntax = syntaxMatch?.[1]?.trim() || extractCodeBlocks(header.body)[0] || ''
        const descriptionItems = extractListUnderLabel(header.body, 'What it does')
        const tips = extractListUnderLabel(header.body, 'Tips')
        const exampleMatch = header.body.match(/\*\*Example:\*\*\s*```[^\n]*\n([\s\S]*?)```/)
        const purpose = quickRefMap.get(name) || extractParagraph(header.body)

        commands.push({
            name,
            purpose,
            syntax,
            args: parseArgsFromTables(header.body),
            description: descriptionItems.join('；'),
            example: exampleMatch?.[1]?.trim() || '',
            tips,
            category: 'main',
        })
    }

    const legacySection = findSection(content, 2, /^Legacy Commands$/i)
    const legacyTable = legacySection ? extractTables(legacySection.body)[0] : null
    const legacyCommands: LegacyCommand[] = []
    if (legacyTable) {
        for (const row of legacyTable.slice(1)) {
            if (row.length < 2) continue
            legacyCommands.push({
                command: row[0],
                purpose: row[1],
            })
        }
    }

    const troubleshootingSection = findSection(content, 2, /^Troubleshooting$/i)
    const troubleshooting: TroubleshootingItem[] = []
    if (troubleshootingSection) {
        const issueSections = splitByHeading(troubleshootingSection.body, 3)
        for (const issueSection of issueSections) {
            const solutions = extractListUnderLabel(issueSection.body, 'Solutions')
            troubleshooting.push({
                issue: issueSection.title.replace(/^"|"$/g, ''),
                solutions: solutions.length ? solutions : extractBullets(issueSection.body),
            })
        }
    }

    const syntaxSection = findSection(content, 2, /^Command Syntax by AI Tool$/i)
    const syntaxTable = syntaxSection ? extractTables(syntaxSection.body)[0] : null
    const toolSyntax: ToolSyntax[] = []
    if (syntaxTable) {
        for (const row of syntaxTable.slice(1)) {
            if (row.length < 2) continue
            toolSyntax.push({
                tool: row[0],
                syntax: row[1],
                note: row[2] || '',
            })
        }
    }

    return {
        commands,
        legacyCommands,
        troubleshooting,
        toolSyntax,
    }
}

function parseTools(content: string): { tools: Tool[]; skills: Skill[] } {
    const tools: Tool[] = []
    const skills: Skill[] = []

    const toolSection = findSection(content, 2, /^Tool Directory Reference$/i)
    const toolTable = toolSection ? extractTables(toolSection.body)[0] : null
    if (toolTable) {
        for (const row of toolTable.slice(1)) {
            if (row.length < 3) continue
            tools.push({
                name: row[0],
                skillsLocation: row[1],
                commandsLocation: row[2],
            })
        }
    }

    // Section renamed from 'What Gets Installed' to 'Generated Skill Names'; format changed from table to bullet list
    const skillsSection = findSection(content, 2, /^Generated Skill Names$/i)
    if (skillsSection) {
        for (const line of skillsSection.body.split('\n')) {
            const trimmed = line.trim()
            if (!/^[-*]\s+/.test(trimmed)) continue
            // Parse: - **name** — description or - **name** (SKILL.md) — description
            const nameMatch = trimmed.match(/^[-*]\s+\*\*([^*]+)\*\*/)
            if (!nameMatch) continue
            const name = nameMatch[1].trim()
            const afterName = trimmed.slice(nameMatch[0].length).trim()
            // Strip parenthetical notes like (SKILL.md) and leading dash/em-dash
            const purpose = afterName.replace(/^\([^)]+\)\s*/, '').replace(/^[-—]\s*/, '').trim()
            skills.push({ name, purpose })
        }
    }

    return { tools, skills }
}

function parseMeta(readme: string, installation: string, toolCount: number): MetaInfo {
    const nodeFromInstall = installation.match(/Node\.js\s+([\d.]+)\s+or higher/i)?.[1]
    const nodeFromReadme = readme.match(/Node\.js\s+([\d.]+)\s+or higher/i)?.[1]
    const nodeVersion = nodeFromInstall || nodeFromReadme || ''

    const modelLine = readme.match(/recommend\s+([^\n]+?)\s+for both/i)?.[1] || ''
    const recommendedModels = modelLine
        .split(/\s+and\s+|,\s*/)
        .map(item => normalizeInline(item))
        .filter(Boolean)

    return {
        nodeVersion,
        recommendedModels,
        toolCount,
    }
}

function parseWorkflows(content: string): Workflows {
    const philosophySection = findSection(content, 2, /^Philosophy:/i)
    const patternsSection = findSection(content, 2, /^Workflow Patterns/i)
    const ffVsContinueSection = findSection(content, 3, /\/opsx:ff.*\/opsx:continue/i)
    const updateVsNewSection = findSection(content, 3, /^When to Update vs Start Fresh$/i)
    const bestPracticesSection = findSection(content, 2, /^Best Practices$/i)
    const quickRefSection = findSection(content, 2, /^Command Quick Reference$/i)

    const patterns: WorkflowPattern[] = []
    if (patternsSection) {
        for (const section of splitByHeading(patternsSection.body, 3)) {
            const bestForMatch = section.body.match(/\*\*Best for:\*\*\s*([^\n]+)/i)
            const firstCode = extractCodeBlocks(section.body)[0] || ''
            patterns.push({
                title: section.title,
                description: extractParagraph(section.body),
                commands: extractCommands(firstCode || section.body),
                bestFor: bestForMatch ? normalizeInline(bestForMatch[1]) : '',
            })
        }
    }

    const ffVsContinue: WorkflowDecision[] = []
    if (ffVsContinueSection) {
        const decisionTable = extractTables(ffVsContinueSection.body)[0]
        if (decisionTable) {
            for (const row of decisionTable.slice(1)) {
                if (row.length < 2) continue
                ffVsContinue.push({
                    situation: row[0],
                    use: row[1],
                })
            }
        }
    }

    const quickReference: WorkflowQuickRef[] = []
    if (quickRefSection) {
        const table = extractTables(quickRefSection.body)[0]
        if (table) {
            for (const row of table.slice(1)) {
                if (row.length < 3) continue
                quickReference.push({
                    command: row[0],
                    purpose: row[1],
                    whenToUse: row[2],
                })
            }
        }
    }

    const bestPractices = bestPracticesSection
        ? splitByHeading(bestPracticesSection.body, 3)
            .map(section => `${section.title}：${extractParagraph(section.body)}`.trim())
            .filter(item => item !== '：')
        : []

    const updateVsNew = updateVsNewSection ? extractBullets(updateVsNewSection.body) : []

    return {
        philosophy: philosophySection ? extractBullets(philosophySection.body) : [],
        patterns,
        ffVsContinue,
        updateVsNew,
        bestPractices,
        quickReference,
    }
}

function parseWorkflowHighlights(workflows: Workflows): WorkflowHighlights {
    const quickFeature = workflows.patterns.find(item => /^Quick Feature$/i.test(item.title))?.commands || []
    const completion = workflows.patterns.find(item => /^Completing a Change$/i.test(item.title))?.commands || []
    return { quickFeature, completion }
}

function parseConcepts(content: string): { concepts: Concept[]; glossary: GlossaryItem[] } {
    const concepts: Concept[] = []
    for (const section of splitByHeading(content, 2)) {
        if (/^Next Steps$/i.test(section.title) || /^Glossary$/i.test(section.title)) continue
        concepts.push({
            title: section.title,
            description: extractParagraph(section.body),
        })
    }

    const glossarySection = findSection(content, 2, /^Glossary$/i)
    const glossaryTable = glossarySection ? extractTables(glossarySection.body)[0] : null
    const glossary: GlossaryItem[] = []
    if (glossaryTable) {
        for (const row of glossaryTable.slice(1)) {
            if (row.length < 2) continue
            glossary.push({
                term: row[0],
                definition: row[1],
            })
        }
    }

    return { concepts, glossary }
}

function toGettingStartedStep(title: string, body: string): GettingStartedStep {
    return {
        title,
        description: extractParagraph(body),
        bullets: extractBullets(body),
        codeBlocks: extractCodeBlocks(body),
    }
}

function parseGettingStarted(content: string): GettingStartedStep[] {
    const result: GettingStartedStep[] = []
    const sections = splitByHeading(content, 2)
    const keepTopLevel = new Set([
        'How It Works',
        'What OpenSpec Creates',
        'Understanding Artifacts',
        'How Delta Specs Work',
        'Verifying and Reviewing',
    ])

    for (const section of sections) {
        if (keepTopLevel.has(section.title)) {
            result.push(toGettingStartedStep(section.title, section.body))
        }
        if (section.title === 'Example: Your First Change') {
            for (const step of splitByHeading(section.body, 3)) {
                result.push(toGettingStartedStep(step.title, step.body))
            }
        }
    }

    return result
}

function parseInstallation(content: string): InstallStep[] {
    const steps: InstallStep[] = []
    const sections = splitByHeading(content, 2)

    for (const section of sections) {
        if (section.title === 'Package Managers') {
            for (const manager of splitByHeading(section.body, 3)) {
                steps.push({
                    title: `Package Managers · ${manager.title}`,
                    description: extractParagraph(manager.body) || `使用 ${manager.title} 安装 OpenSpec。`,
                    commands: extractCommandLinesFromCodeBlocks(manager.body),
                    codeBlocks: extractCodeBlocks(manager.body),
                })
            }
            continue
        }

        steps.push({
            title: section.title,
            description: extractParagraph(section.body),
            commands: extractCommandLinesFromCodeBlocks(section.body),
            codeBlocks: extractCodeBlocks(section.body),
        })
    }

    return steps
}

function parseCli(content: string): CliCommand[] {
    const commands: CliCommand[] = []
    const level2Sections = splitByHeading(content, 2)
    const level3Sections = splitByHeading(content, 3)

    const findCategory = (start: number): string => {
        let category = 'General'
        for (const section of level2Sections) {
            if (section.start < start) {
                category = section.title
            } else {
                break
            }
        }
        return category
    }

    for (const section of level3Sections) {
        const nameMatch = section.title.match(/(openspec.+)$/)
        if (!nameMatch) continue
        const name = nameMatch[1]
        const codeBlocks = extractCodeBlocks(section.body)
        const syntax = codeBlocks[0] || name
        commands.push({
            name,
            category: findCategory(section.start),
            description: extractParagraph(section.body),
            syntax,
            args: parseArgsFromTables(section.body),
            options: parseOptionsFromTables(section.body),
        })
    }

    return commands
}

function parseCustomization(content: string): CustomizationSection[] {
    const sections: CustomizationSection[] = []
    for (const section of splitByHeading(content, 2)) {
        if (/^See Also$/i.test(section.title)) continue

        const options: CustomizationField[] = []
        for (const table of extractTables(section.body)) {
            const header = table[0].map(cell => cell.toLowerCase())
            const nameIndex = header.findIndex(cell => /field|level/.test(cell))
            const purposeIndex = header.findIndex(cell => /purpose|what it does|best for/.test(cell))
            if (nameIndex === -1 || purposeIndex === -1) continue
            for (const row of table.slice(1)) {
                if (!row[nameIndex] || !row[purposeIndex]) continue
                options.push({
                    name: row[nameIndex],
                    purpose: row[purposeIndex],
                })
            }
        }

        sections.push({
            title: section.title,
            description: extractParagraph(section.body),
            options,
            examples: extractCodeBlocks(section.body),
        })
    }
    return sections
}

function parseMigrationGuide(content: string): MigrationStep[] {
    const steps: MigrationStep[] = []
    for (const section of splitByHeading(content, 2)) {
        if (/^Getting Help$/i.test(section.title)) continue
        steps.push({
            title: section.title,
            description: extractParagraph(section.body),
            bullets: extractBullets(section.body),
        })
    }
    return steps
}

function parseMultiLanguage(content: string): MultiLanguageInfo {
    const quickSetupSection = findSection(content, 2, /^Quick Setup$/i)
    const examplesSection = findSection(content, 2, /^Language Examples$/i)
    const tipsSection = findSection(content, 2, /^Tips$/i)
    const verificationSection = findSection(content, 2, /^Verification$/i)

    const examples: LanguageExample[] = []
    if (examplesSection) {
        for (const section of splitByHeading(examplesSection.body, 3)) {
            const snippet = extractCodeBlocks(section.body)[0] || ''
            examples.push({
                language: section.title,
                snippet,
            })
        }
    }

    return {
        quickSetup: extractCodeBlocks(quickSetupSection?.body || '')[0] || '',
        examples,
        tips: tipsSection
            ? splitByHeading(tipsSection.body, 3).map(section => `${section.title}：${extractParagraph(section.body)}`)
            : [],
        verification: extractCommandLinesFromCodeBlocks(verificationSection?.body || ''),
    }
}

function parseOpsx(content: string): OpsxContent {
    const sections: OpsxSection[] = []
    const allLevel2 = splitByHeading(content, 2)
    let commands: OpsxCommand[] = []
    let comparisons: OpsxComparison[] = []

    for (const section of allLevel2) {
        const bullets = extractBullets(section.body)
        sections.push({
            title: section.title,
            description: extractParagraph(section.body),
            bullets,
            commands: extractCommands(section.body),
        })

        if (section.title === 'Commands') {
            const table = extractTables(section.body)[0]
            if (table) {
                commands = table.slice(1).map(row => ({
                    command: row[0] || '',
                    description: row[1] || '',
                })).filter(item => item.command)
            }
        }

        if (section.title === "What's Different?") {
            const table = extractTables(section.body)[0]
            if (table) {
                comparisons = table.slice(1).map(row => ({
                    aspect: row[0] || '',
                    legacy: row[1] || '',
                    opsx: row[2] || '',
                })).filter(item => item.aspect)
            }
        }
    }

    return {
        sections,
        commands,
        comparisons,
    }
}

// Main parse function: takes all raw markdown files and produces structured data
export function parseDocs(files: Record<string, string>, commitSha: string): UpstreamData {
    const commandsMd = files['docs/commands.md'] || ''
    const toolsMd = files['docs/supported-tools.md'] || ''
    const workflowsMd = files['docs/workflows.md'] || ''
    const opsxMd = files['docs/opsx.md'] || ''
    const conceptsMd = files['docs/concepts.md'] || ''
    const gettingStartedMd = files['docs/getting-started.md'] || ''
    const installationMd = files['docs/installation.md'] || ''
    const cliMd = files['docs/cli.md'] || ''
    const customizationMd = files['docs/customization.md'] || ''
    const migrationGuideMd = files['docs/migration-guide.md'] || ''
    const multiLanguageMd = files['docs/multi-language.md'] || ''
    const readmeMd = files['README.md'] || ''

    const parsedCommands = parseCommands(commandsMd)
    const { tools, skills } = parseTools(toolsMd)
    const workflows = parseWorkflows(workflowsMd)
    const workflowHighlights = parseWorkflowHighlights(workflows)
    const { concepts, glossary } = parseConcepts(conceptsMd)
    const meta = parseMeta(readmeMd, installationMd, tools.length)

    return {
        commands: parsedCommands.commands,
        legacyCommands: parsedCommands.legacyCommands,
        troubleshooting: parsedCommands.troubleshooting,
        tools,
        toolSyntax: parsedCommands.toolSyntax,
        skills,
        workflowHighlights,
        workflows,
        concepts,
        glossary,
        gettingStarted: parseGettingStarted(gettingStartedMd),
        installation: parseInstallation(installationMd),
        cli: parseCli(cliMd),
        customization: parseCustomization(customizationMd),
        migrationGuide: parseMigrationGuide(migrationGuideMd),
        multiLanguage: parseMultiLanguage(multiLanguageMd),
        opsx: parseOpsx(opsxMd),
        meta,
        fetchedAt: new Date().toISOString(),
        commitSha,
        sync: {
            lastSyncAt: new Date().toISOString(),
            sourceCommitSha: commitSha,
            contentCommitSha: commitSha,
            status: 'ok',
            message: '内容已同步到最新上游提交。',
            changedFiles: [],
            untrackedChanges: [],
        },
    }
}
