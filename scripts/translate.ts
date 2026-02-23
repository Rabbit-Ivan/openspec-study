// AI translation via DeepSeek API (OpenAI-compatible)

import OpenAI from 'openai'
import type { TranslationEntry, Translations, UpstreamData } from '../src/types'

const SYSTEM_PROMPT = `你是一个专业的技术文档翻译助手。请将以下英文内容翻译为简体中文。
要求：
1. 技术术语保持准确
2. 语言简洁自然，适合中国开发者阅读
3. 命令名称（如 /opsx:new）不翻译
4. 翻译结果只返回译文，不要加额外说明
5. 如果内容已经是中文，直接返回原文`

function nowIso(): string {
    return new Date().toISOString()
}

function normalizeEntry(value: unknown): TranslationEntry | null {
    if (!value || typeof value !== 'object') return null
    const entry = value as Partial<TranslationEntry>
    if (!entry.translated || !entry.original) return null
    return {
        original: String(entry.original),
        translated: String(entry.translated),
        updatedAt: entry.updatedAt ? String(entry.updatedAt) : nowIso(),
    }
}

function normalizeEntryMap(input: unknown): Record<string, TranslationEntry> {
    if (!input || typeof input !== 'object') return {}
    const result: Record<string, TranslationEntry> = {}
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
        if (typeof value === 'string') {
            result[key] = {
                original: value,
                translated: value,
                updatedAt: nowIso(),
            }
            continue
        }
        const normalized = normalizeEntry(value)
        if (normalized) {
            result[key] = normalized
        }
    }
    return result
}

function normalizeTranslations(existing: Partial<Translations> | null | undefined): Translations {
    const commands = (existing?.commands && typeof existing.commands === 'object')
        ? existing.commands
        : {}

    return {
        commands,
        tools: normalizeEntryMap(existing?.tools),
        meta: normalizeEntryMap(existing?.meta),
        concepts: normalizeEntryMap(existing?.concepts),
        gettingStarted: normalizeEntryMap(existing?.gettingStarted),
        installation: normalizeEntryMap(existing?.installation),
        cli: normalizeEntryMap(existing?.cli),
        customization: normalizeEntryMap(existing?.customization),
        migrationGuide: normalizeEntryMap(existing?.migrationGuide),
        multiLanguage: normalizeEntryMap(existing?.multiLanguage),
        workflows: normalizeEntryMap(existing?.workflows),
        opsx: normalizeEntryMap(existing?.opsx),
    }
}

async function translateText(client: OpenAI, text: string): Promise<string> {
    try {
        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: text },
            ],
            stream: false,
            timeout: 30000,
        })
        return response.choices[0]?.message?.content?.trim() || text
    } catch (error) {
        console.warn(`  ⚠ 翻译请求失败，回退原文：${error instanceof Error ? error.message : String(error)}`)
        return text
    }
}

async function translateByContext(client: OpenAI, context: string, source: string): Promise<string> {
    const prompt = `请翻译以下 ${context}：\n\n${source}`
    return translateText(client, prompt)
}

async function ensureEntry(
    client: OpenAI,
    target: Record<string, TranslationEntry>,
    key: string,
    source: string,
    context: string
): Promise<boolean> {
    if (!source.trim()) return false
    const current = target[key]
    if (current && current.original === source && current.translated) return false
    target[key] = {
        original: source,
        translated: await translateByContext(client, context, source),
        updatedAt: nowIso(),
    }
    return true
}

export async function computeTranslations(
    upstream: UpstreamData,
    existingRaw: Partial<Translations>
): Promise<Translations> {
    const existing = normalizeTranslations(existingRaw)
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
        console.warn('  ⚠ DEEPSEEK_API_KEY not set, skipping translations')
        return existing
    }

    const client = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey,
    })

    const result: Translations = {
        commands: { ...existing.commands },
        tools: { ...existing.tools },
        meta: { ...existing.meta },
        concepts: { ...existing.concepts },
        gettingStarted: { ...existing.gettingStarted },
        installation: { ...existing.installation },
        cli: { ...existing.cli },
        customization: { ...existing.customization },
        migrationGuide: { ...existing.migrationGuide },
        multiLanguage: { ...existing.multiLanguage },
        workflows: { ...existing.workflows },
        opsx: { ...existing.opsx },
    }

    let translated = 0

    for (const cmd of upstream.commands) {
        const existingEntry = existing.commands[cmd.name]
        if (existingEntry?.description && existingEntry.source === cmd.purpose) {
            continue
        }
        console.log(`  Translating command: ${cmd.name}`)
        result.commands[cmd.name] = {
            chineseName: existingEntry?.chineseName || cmd.name.replace('/opsx:', ''),
            description: await translateByContext(client, `AI 编码命令说明（命令名 ${cmd.name}）`, cmd.purpose),
            source: cmd.purpose,
        }
        translated++
    }

    for (const tool of upstream.tools) {
        if (await ensureEntry(client, result.tools, tool.name, tool.name, 'AI 编码工具名称')) translated++
    }

    if (await ensureEntry(client, result.meta, 'nodeVersion', upstream.meta.nodeVersion, 'Node.js 版本说明')) translated++
    for (const model of upstream.meta.recommendedModels) {
        if (await ensureEntry(client, result.meta, `model:${model}`, model, '推荐模型名称')) translated++
    }

    for (const concept of upstream.concepts) {
        if (await ensureEntry(client, result.concepts, `title:${concept.title}`, concept.title, '核心概念标题')) translated++
        if (await ensureEntry(client, result.concepts, `desc:${concept.title}`, concept.description, '核心概念描述')) translated++
    }
    for (const item of upstream.glossary) {
        if (await ensureEntry(client, result.concepts, `glossary-term:${item.term}`, item.term, '术语名称')) translated++
        if (await ensureEntry(client, result.concepts, `glossary-def:${item.term}`, item.definition, '术语定义')) translated++
    }

    for (const step of upstream.gettingStarted) {
        if (await ensureEntry(client, result.gettingStarted, `title:${step.title}`, step.title, '快速上手步骤标题')) translated++
        if (await ensureEntry(client, result.gettingStarted, `desc:${step.title}`, step.description, '快速上手步骤描述')) translated++
    }

    for (const step of upstream.installation) {
        if (await ensureEntry(client, result.installation, `title:${step.title}`, step.title, '安装步骤标题')) translated++
        if (await ensureEntry(client, result.installation, `desc:${step.title}`, step.description, '安装步骤描述')) translated++
    }

    for (const command of upstream.cli) {
        if (await ensureEntry(client, result.cli, `name:${command.name}`, command.name, 'CLI 命令名称')) translated++
        if (await ensureEntry(client, result.cli, `desc:${command.name}`, command.description, 'CLI 命令描述')) translated++
    }

    for (const section of upstream.customization) {
        if (await ensureEntry(client, result.customization, `title:${section.title}`, section.title, 'Schema 自定义章节标题')) translated++
        if (await ensureEntry(client, result.customization, `desc:${section.title}`, section.description, 'Schema 自定义章节描述')) translated++
    }

    for (const step of upstream.migrationGuide) {
        if (await ensureEntry(client, result.migrationGuide, `title:${step.title}`, step.title, '迁移指南标题')) translated++
        if (await ensureEntry(client, result.migrationGuide, `desc:${step.title}`, step.description, '迁移指南描述')) translated++
    }

    if (await ensureEntry(client, result.multiLanguage, 'quickSetup', upstream.multiLanguage.quickSetup, '多语言快速配置示例')) translated++
    for (const example of upstream.multiLanguage.examples) {
        if (await ensureEntry(client, result.multiLanguage, `lang:${example.language}`, example.language, '语言名称')) translated++
        if (await ensureEntry(client, result.multiLanguage, `snippet:${example.language}`, example.snippet, '多语言配置示例')) translated++
    }
    for (const tip of upstream.multiLanguage.tips) {
        if (await ensureEntry(client, result.multiLanguage, `tip:${tip}`, tip, '多语言最佳实践')) translated++
    }

    for (const pattern of upstream.workflows.patterns) {
        if (await ensureEntry(client, result.workflows, `pattern-title:${pattern.title}`, pattern.title, '工作流模式标题')) translated++
        if (await ensureEntry(client, result.workflows, `pattern-desc:${pattern.title}`, pattern.description, '工作流模式描述')) translated++
        if (await ensureEntry(client, result.workflows, `pattern-bestfor:${pattern.title}`, pattern.bestFor, '工作流适用场景')) translated++
    }
    for (const tip of upstream.workflows.bestPractices) {
        if (await ensureEntry(client, result.workflows, `best:${tip}`, tip, '工作流最佳实践')) translated++
    }

    for (const section of upstream.opsx.sections) {
        if (await ensureEntry(client, result.opsx, `title:${section.title}`, section.title, 'OPSX 章节标题')) translated++
        if (await ensureEntry(client, result.opsx, `desc:${section.title}`, section.description, 'OPSX 章节描述')) translated++
    }
    for (const comparison of upstream.opsx.comparisons) {
        const key = comparison.aspect
        if (await ensureEntry(client, result.opsx, `compare:${key}:legacy`, comparison.legacy, 'Legacy 工作流描述')) translated++
        if (await ensureEntry(client, result.opsx, `compare:${key}:opsx`, comparison.opsx, 'OPSX 工作流描述')) translated++
    }

    console.log(`  Translated ${translated} new entries`)
    return result
}
