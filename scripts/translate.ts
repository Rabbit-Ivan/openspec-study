// AI translation via DeepSeek API (OpenAI-compatible)

import OpenAI from 'openai'
import type { UpstreamData, Translations } from '../src/types'

const SYSTEM_PROMPT = `你是一个专业的技术文档翻译助手。请将以下英文内容翻译为简体中文。
要求：
1. 技术术语保持准确
2. 语言简洁自然，适合中国开发者阅读
3. 命令名称（如 /opsx:new）不翻译
4. 翻译结果只返回译文，不要加额外说明
5. 如果内容已经是中文，直接返回原文`

/**
 * Translate text using DeepSeek API
 */
async function translateText(client: OpenAI, text: string): Promise<string> {
    const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text },
        ],
        stream: false,
    })
    return response.choices[0]?.message?.content?.trim() || text
}

/**
 * Translate a single command's description
 */
async function translateCommandDesc(client: OpenAI, name: string, purpose: string): Promise<string> {
    const prompt = `翻译以下 AI 编码工具命令的描述（命令名 ${name}）：\n\n${purpose}`
    return translateText(client, prompt)
}

/**
 * Compute translations for new/changed content
 * Only translates entries that are missing or where the original has changed
 */
export async function computeTranslations(
    upstream: UpstreamData,
    existing: Translations
): Promise<Translations> {
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
    }

    let translated = 0

    // Translate command purposes
    for (const cmd of upstream.commands) {
        const existingEntry = existing.commands[cmd.name]
        if (existingEntry && existingEntry.description) {
            // Already translated, skip
            continue
        }
        console.log(`  Translating command: ${cmd.name}`)
        const desc = await translateCommandDesc(client, cmd.name, cmd.purpose)
        result.commands[cmd.name] = {
            chineseName: existingEntry?.chineseName || cmd.name.replace('/opsx:', ''),
            description: desc,
        }
        translated++
    }

    console.log(`  Translated ${translated} new entries`)
    return result
}
