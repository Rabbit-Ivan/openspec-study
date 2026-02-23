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

export interface LegacyCommand {
    command: string
    purpose: string
}

export interface TroubleshootingItem {
    issue: string
    solutions: string[]
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

export interface WorkflowPattern {
    title: string
    description: string
    commands: string[]
    bestFor: string
}

export interface WorkflowDecision {
    situation: string
    use: string
}

export interface WorkflowQuickRef {
    command: string
    purpose: string
    whenToUse: string
}

export interface Workflows {
    philosophy: string[]
    patterns: WorkflowPattern[]
    ffVsContinue: WorkflowDecision[]
    updateVsNew: string[]
    bestPractices: string[]
    quickReference: WorkflowQuickRef[]
}

export interface Concept {
    title: string
    description: string
}

export interface GlossaryItem {
    term: string
    definition: string
}

export interface GettingStartedStep {
    title: string
    description: string
    bullets: string[]
    codeBlocks: string[]
}

export interface InstallStep {
    title: string
    description: string
    commands: string[]
    codeBlocks: string[]
}

export interface CliOption {
    name: string
    description: string
}

export interface CliCommand {
    name: string
    category: string
    description: string
    syntax: string
    args: CommandArg[]
    options: CliOption[]
}

export interface CustomizationField {
    name: string
    purpose: string
}

export interface CustomizationSection {
    title: string
    description: string
    options: CustomizationField[]
    examples: string[]
}

export interface MigrationStep {
    title: string
    description: string
    bullets: string[]
}

export interface LanguageExample {
    language: string
    snippet: string
}

export interface MultiLanguageInfo {
    quickSetup: string
    examples: LanguageExample[]
    tips: string[]
    verification: string[]
}

export interface OpsxCommand {
    command: string
    description: string
}

export interface OpsxComparison {
    aspect: string
    legacy: string
    opsx: string
}

export interface OpsxSection {
    title: string
    description: string
    bullets: string[]
    commands: string[]
}

export interface OpsxContent {
    sections: OpsxSection[]
    commands: OpsxCommand[]
    comparisons: OpsxComparison[]
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

export interface CommandTranslation {
    chineseName: string
    description: string
    source?: string
}

export interface Translations {
    commands: Record<string, CommandTranslation>
    tools: Record<string, TranslationEntry>
    meta: Record<string, TranslationEntry>
    concepts: Record<string, TranslationEntry>
    gettingStarted: Record<string, TranslationEntry>
    installation: Record<string, TranslationEntry>
    cli: Record<string, TranslationEntry>
    customization: Record<string, TranslationEntry>
    migrationGuide: Record<string, TranslationEntry>
    multiLanguage: Record<string, TranslationEntry>
    workflows: Record<string, TranslationEntry>
    opsx: Record<string, TranslationEntry>
}

export interface UpstreamData {
    commands: Command[]
    legacyCommands: LegacyCommand[]
    troubleshooting: TroubleshootingItem[]
    tools: Tool[]
    toolSyntax: ToolSyntax[]
    skills: Skill[]
    workflowHighlights: WorkflowHighlights
    workflows: Workflows
    concepts: Concept[]
    glossary: GlossaryItem[]
    gettingStarted: GettingStartedStep[]
    installation: InstallStep[]
    cli: CliCommand[]
    customization: CustomizationSection[]
    migrationGuide: MigrationStep[]
    multiLanguage: MultiLanguageInfo
    opsx: OpsxContent
    meta: MetaInfo
    fetchedAt: string
    commitSha: string
    sync: SyncInfo
}
