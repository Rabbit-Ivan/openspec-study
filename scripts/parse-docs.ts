// Parse upstream markdown docs into structured JSON

import type {
    Command,
    CommandArg,
    Tool,
    ToolSyntax,
    Skill,
    MetaInfo,
    UpstreamData,
    WorkflowHighlights,
} from '../src/types'

/**
 * Parse commands.md to extract command list
 */
function parseCommands(content: string): Command[] {
    const commands: Command[] = []

    // Split by ### headers to get each command section
    const sections = content.split(/^### /m).slice(1)

    for (const section of sections) {
        const lines = section.trim().split('\n')
        const nameLine = lines[0]

        // Extract command name like `/opsx:new`
        const nameMatch = nameLine.match(/`(\/opsx:\S+)`/)
        if (!nameMatch) continue

        const name = nameMatch[1]

        // Extract purpose from Quick Reference table or first paragraph
        const purposeMatch = section.match(/\n([A-Z][^|*#\n]+?)\n/)
        const purpose = purposeMatch ? purposeMatch[1].trim() : ''

        // Extract syntax
        const syntaxMatch = section.match(/\*\*Syntax:\*\*\s*```[^\n]*\n([\s\S]*?)```/)
        const syntax = syntaxMatch ? syntaxMatch[1].trim() : ''

        // Extract arguments table
        const args = parseArgsTable(section)

        // Extract "What it does" section
        const whatItDoesMatch = section.match(/\*\*What it does:\*\*\s*\n([\s\S]*?)(?=\n\*\*|---|\n###|$)/)
        const description = whatItDoesMatch
            ? whatItDoesMatch[1]
                .split('\n')
                .filter(l => l.trim().startsWith('-'))
                .map(l => l.replace(/^-\s*/, '').trim())
                .join('；')
            : ''

        // Extract example
        const exampleMatch = section.match(/\*\*Example:\*\*\s*```[^\n]*\n([\s\S]*?)```/)
        const example = exampleMatch ? exampleMatch[1].trim() : ''

        // Extract tips
        const tipsMatch = section.match(/\*\*Tips:\*\*\s*\n([\s\S]*?)(?=\n---|\n###|$)/)
        const tips = tipsMatch
            ? tipsMatch[1]
                .split('\n')
                .filter(l => l.trim().startsWith('-'))
                .map(l => l.replace(/^-\s*/, '').trim())
            : []

        commands.push({
            name, purpose, syntax, args, description, example, tips,
            category: 'main', // will be overridden by custom.ts mapping
        })
    }

    return commands
}

/**
 * Parse arguments table from a command section
 */
function parseArgsTable(section: string): CommandArg[] {
    const args: CommandArg[] = []
    const tableMatch = section.match(/\| Argument.*?\n\|[-\s|]+\n([\s\S]*?)(?=\n\n|\n\*\*|$)/)
    if (!tableMatch) return args

    const rows = tableMatch[1].trim().split('\n')
    for (const row of rows) {
        const cols = row.split('|').map(c => c.trim()).filter(Boolean)
        if (cols.length >= 3) {
            args.push({
                name: cols[0].replace(/`/g, ''),
                required: cols[1].toLowerCase() === 'yes',
                description: cols[2],
            })
        }
    }
    return args
}

/**
 * Parse supported-tools.md to extract tool list
 */
function parseTools(content: string): { tools: Tool[], syntax: ToolSyntax[], skills: Skill[] } {
    const tools: Tool[] = []
    const syntax: ToolSyntax[] = []
    const skills: Skill[] = []

    // Parse Tool Directory Reference table
    const toolTableMatch = content.match(/## Tool Directory Reference\s*\n\|.*?\n\|[-\s|]+\n([\s\S]*?)(?=\n\n|\n##)/)
    if (toolTableMatch) {
        const rows = toolTableMatch[1].trim().split('\n')
        for (const row of rows) {
            const cols = row.split('|').map(c => c.trim()).filter(Boolean)
            if (cols.length >= 3) {
                tools.push({
                    name: cols[0].replace(/\\\*/g, '').trim(),
                    skillsLocation: cols[1].replace(/`/g, '').trim(),
                    commandsLocation: cols[2].replace(/`/g, '').replace(/\\\*/g, '').trim(),
                })
            }
        }
    }

    // Parse skills table (What Gets Installed)
    const skillsTableMatch = content.match(/\| Skill \| Purpose \|\s*\n\|[-\s|]+\n([\s\S]*?)(?=\n\n|\n##|$)/)
    if (skillsTableMatch) {
        const rows = skillsTableMatch[1].trim().split('\n')
        for (const row of rows) {
            const cols = row.split('|').map(c => c.trim()).filter(Boolean)
            if (cols.length >= 2) {
                skills.push({
                    name: cols[0].replace(/`/g, '').trim(),
                    purpose: cols[1].trim(),
                })
            }
        }
    }

    return { tools, syntax, skills }
}

/**
 * Parse command syntax by tool table from commands.md
 */
function parseToolSyntax(content: string): ToolSyntax[] {
    const syntax: ToolSyntax[] = []
    const tableMatch = content.match(/## Command Syntax by AI Tool\s*[\s\S]*?\| Tool.*?\n\|[-\s|]+\n([\s\S]*?)(?=\n\n|\n>|\n##|$)/)
    if (tableMatch) {
        const rows = tableMatch[1].trim().split('\n')
        for (const row of rows) {
            const cols = row.split('|').map(c => c.trim()).filter(Boolean)
            if (cols.length >= 2) {
                syntax.push({
                    tool: cols[0],
                    syntax: cols[1].replace(/`/g, ''),
                    note: cols[2] || '',
                })
            }
        }
    }
    return syntax
}

/**
 * Parse README.md for meta info
 */
function parseMeta(readme: string, toolCount: number): MetaInfo {
    // Extract Node.js version
    const nodeMatch = readme.match(/Node\.js\s+([\d.]+)/)
    const nodeVersion = nodeMatch ? nodeMatch[1] : ''

    // Extract recommended models
    const modelLineMatch = readme.match(/We recommend\s+([^\n]+)/i)
    const recommendedModels = modelLineMatch
        ? modelLineMatch[1]
            .replace(/\s+for\b[\s\S]*$/i, '')
            .replace(/\.$/, '')
            .split(/\s+and\s+/)
            .map(m => m.trim())
            .filter(Boolean)
        : []

    return { nodeVersion, recommendedModels, toolCount }
}

/**
 * Parse workflow highlights from workflows.md
 */
function parseWorkflowHighlights(content: string): WorkflowHighlights {
    const extractCommands = (section: string): string[] => {
        const matches = section.match(/\/opsx:[a-z-]+/g) || []
        const deduped: string[] = []
        for (const cmd of matches) {
            if (!deduped.includes(cmd)) deduped.push(cmd)
        }
        return deduped
    }

    const quickFeatureBlock = content.match(/### Quick Feature[\s\S]*?```text([\s\S]*?)```/i)?.[1] || ''
    const completionBlock = content.match(/### Completing a Change[\s\S]*?```text([\s\S]*?)```/i)?.[1] || ''

    return {
        quickFeature: extractCommands(quickFeatureBlock),
        completion: extractCommands(completionBlock),
    }
}

/**
 * Parse quick reference table from commands.md
 */
function parseQuickRef(content: string): Array<{ name: string; purpose: string }> {
    const refs: Array<{ name: string; purpose: string }> = []
    const tableMatch = content.match(/## Quick Reference\s*\n\|.*?\n\|[-\s|]+\n([\s\S]*?)(?=\n---|\n##)/)
    if (tableMatch) {
        const rows = tableMatch[1].trim().split('\n')
        for (const row of rows) {
            const cols = row.split('|').map(c => c.trim()).filter(Boolean)
            if (cols.length >= 2) {
                refs.push({
                    name: cols[0].replace(/`/g, '').trim(),
                    purpose: cols[1].trim(),
                })
            }
        }
    }
    return refs
}

/**
 * Main parse function: takes all raw markdown files and produces structured data
 */
export function parseDocs(files: Record<string, string>, commitSha: string): UpstreamData {
    const commandsMd = files['docs/commands.md'] || ''
    const toolsMd = files['docs/supported-tools.md'] || ''
    const workflowsMd = files['docs/workflows.md'] || ''
    const readmeMd = files['README.md'] || ''

    const commands = parseCommands(commandsMd)
    const { tools, skills } = parseTools(toolsMd)
    const toolSyntax = parseToolSyntax(commandsMd)
    const workflowHighlights = parseWorkflowHighlights(workflowsMd)
    const meta = parseMeta(readmeMd, tools.length)

    // Merge purpose from quick reference
    const quickRef = parseQuickRef(commandsMd)
    for (const ref of quickRef) {
        const cmd = commands.find(c => c.name === ref.name)
        if (cmd && !cmd.purpose) {
            cmd.purpose = ref.purpose
        }
        // Also set purpose even if already exists, prefer quickRef
        if (cmd) {
            cmd.purpose = ref.purpose
        }
    }

    return {
        commands,
        tools,
        toolSyntax,
        skills,
        workflowHighlights,
        meta,
        fetchedAt: new Date().toISOString(),
        commitSha,
    }
}
