// Data types for upstream OpenSpec data

export interface Command {
    name: string
    purpose: string
    syntax: string
    args: CommandArg[]
    description: string
    example: string
    tips: string[]
    category: 'main' | 'speed' | 'auxiliary'
}

export interface CommandArg {
    name: string
    required: boolean
    description: string
}

export interface Tool {
    name: string
    skillsLocation: string
    commandsLocation: string
}

export interface ToolSyntax {
    tool: string
    syntax: string
    note: string
}

export interface UpstreamData {
    commands: Command[]
    tools: Tool[]
    toolSyntax: ToolSyntax[]
    skills: Skill[]
    workflowHighlights: WorkflowHighlights
    meta: MetaInfo
    fetchedAt: string
    commitSha: string
    sync: SyncInfo
}

export interface Skill {
    name: string
    purpose: string
}

export interface MetaInfo {
    nodeVersion: string
    recommendedModels: string[]
    toolCount: number
}

export interface WorkflowHighlights {
    quickFeature: string[]
    completion: string[]
}

export interface SyncInfo {
    lastSyncAt: string
    sourceCommitSha: string
    contentCommitSha: string
    status: 'ok' | 'warn' | 'error'
    message: string
    changedFiles: string[]
    untrackedChanges: string[]
}

export interface TranslationEntry {
    original: string
    translated: string
    updatedAt: string
}

export interface Translations {
    commands: Record<string, {
        chineseName: string
        description: string
        source?: string
    }>
    tools: Record<string, string>
    meta: Record<string, string>
}
