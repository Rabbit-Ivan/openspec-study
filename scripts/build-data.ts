// Build data orchestrator: fetch → compare → parse → translate → output

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { fetchUpstream, getLatestCommitSha, compareCommits, FILES_TO_FETCH } from './fetch-upstream'
import { parseDocs } from './parse-docs'
import { computeTranslations } from './translate'
import type { SyncInfo, Translations, UpstreamData } from '../src/types'

const ROOT = resolve(import.meta.dirname, '..')
const SHA_FILE = resolve(ROOT, '.last-sha')
const STATE_FILE = resolve(ROOT, '.sync-state.json')
const UPSTREAM_FILE = resolve(ROOT, 'src/data/upstream.json')
const TRANSLATIONS_FILE = resolve(ROOT, 'src/data/translations.json')

interface SyncRunState {
    consecutiveFailures: number
    lastSuccessAt: string
    lastSuccessSha: string
}

function createSyncInfo(input: {
    sourceCommitSha: string
    contentCommitSha: string
    changedFiles?: string[]
    untrackedChanges?: string[]
}): SyncInfo {
    const untrackedChanges = input.untrackedChanges || []
    const changedFiles = input.changedFiles || []
    const status: SyncInfo['status'] = untrackedChanges.length > 0 ? 'warn' : 'ok'
    const message = untrackedChanges.length > 0
        ? `检测到 ${untrackedChanges.length} 个未接入文档更新。`
        : '内容已同步到最新上游提交。'

    return {
        lastSyncAt: new Date().toISOString(),
        sourceCommitSha: input.sourceCommitSha,
        contentCommitSha: input.contentCommitSha,
        status,
        message,
        changedFiles,
        untrackedChanges,
    }
}

function readJsonFile<T>(path: string, fallback: T): T {
    if (!existsSync(path)) return fallback
    try {
        return JSON.parse(readFileSync(path, 'utf-8')) as T
    } catch {
        return fallback
    }
}

function readPreviousCommitSha(existingUpstream: UpstreamData | null): string {
    if (existsSync(SHA_FILE)) {
        return readFileSync(SHA_FILE, 'utf-8').trim()
    }
    return existingUpstream?.sync?.sourceCommitSha || existingUpstream?.commitSha || ''
}

function readSyncRunState(): SyncRunState {
    return readJsonFile<SyncRunState>(STATE_FILE, {
        consecutiveFailures: 0,
        lastSuccessAt: '',
        lastSuccessSha: '',
    })
}

function writeSyncRunState(state: SyncRunState) {
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8')
}

function markSyncSuccess(commitSha: string) {
    const state: SyncRunState = {
        consecutiveFailures: 0,
        lastSuccessAt: new Date().toISOString(),
        lastSuccessSha: commitSha,
    }
    writeSyncRunState(state)
}

async function sendSyncAlert(message: string) {
    const webhook = process.env.SYNC_ALERT_WEBHOOK
    if (!webhook) return

    const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
    })
    if (!res.ok) {
        console.warn(`⚠ 告警发送失败: ${res.status}`)
    }
}

async function markSyncFailure(err: unknown, latestSha?: string) {
    const prev = readSyncRunState()
    const next: SyncRunState = {
        ...prev,
        consecutiveFailures: prev.consecutiveFailures + 1,
    }
    writeSyncRunState(next)

    if (next.consecutiveFailures >= 2) {
        const details = err instanceof Error ? err.message : String(err)
        const alertMessage = [
            'OpenSpec 自动同步连续失败',
            `失败次数: ${next.consecutiveFailures}`,
            `最新上游 SHA: ${latestSha || 'unknown'}`,
            `错误: ${details}`,
            `时间: ${new Date().toISOString()}`,
        ].join('\n')
        await sendSyncAlert(alertMessage)
    }
}

async function main() {
    console.log('🔄 OpenSpec Guide — 数据同步\n')

    const existingUpstream = readJsonFile<UpstreamData | null>(UPSTREAM_FILE, null)

    console.log('📡 检查上游提交...')
    const latestSha = await getLatestCommitSha()
    const previousSha = readPreviousCommitSha(existingUpstream)
    if (previousSha === latestSha) {
        console.log(`\n✅ 上游无新提交（${latestSha.slice(0, 7)}），跳过同步。`)
        markSyncSuccess(latestSha)
        return
    }
    console.log(`  新提交: ${latestSha.slice(0, 7)}（上次检查: ${previousSha.slice(0, 7) || 'none'}）`)

    let changedFiles: string[] = []
    let untrackedChanges: string[] = []
    let hasTrackedChanges = true

    if (previousSha) {
        try {
            const compareResult = await compareCommits(previousSha, latestSha, FILES_TO_FETCH)
            changedFiles = compareResult.changedFiles
            untrackedChanges = compareResult.untrackedChanges
            hasTrackedChanges = compareResult.hasTrackedChanges
            console.log(`  变更文件: ${changedFiles.length}（已接入: ${compareResult.trackedChanges.length}，未接入: ${untrackedChanges.length}）`)
        } catch (err) {
            console.warn(`  ⚠ 无法对比提交，改为全量同步：${err instanceof Error ? err.message : String(err)}`)
        }
    }

    if (!hasTrackedChanges && existingUpstream) {
        console.log('\nℹ 未检测到已接入文档变更，仅更新同步状态。')
        existingUpstream.sync = createSyncInfo({
            sourceCommitSha: latestSha,
            contentCommitSha: existingUpstream.commitSha,
            changedFiles,
            untrackedChanges,
        })
        writeFileSync(UPSTREAM_FILE, JSON.stringify(existingUpstream, null, 2), 'utf-8')
        writeFileSync(SHA_FILE, latestSha, 'utf-8')
        markSyncSuccess(latestSha)
        console.log('✅ 同步状态已更新。')
        return
    }

    // Fetch and build if tracked docs changed.
    console.log('\n📥 拉取已接入文档...')
    const { files, commitSha } = await fetchUpstream(latestSha)

    console.log('\n📝 解析文档...')
    const upstream = parseDocs(files, commitSha)
    upstream.sync = createSyncInfo({
        sourceCommitSha: commitSha,
        contentCommitSha: commitSha,
        changedFiles,
        untrackedChanges,
    })
    console.log(`  Commands: ${upstream.commands.length}`)
    console.log(`  Tools: ${upstream.tools.length}`)
    console.log(`  Tool syntax: ${upstream.toolSyntax.length}`)

    console.log('\n🌐 检查翻译...')
    const existingTranslations: Translations = existsSync(TRANSLATIONS_FILE)
        ? JSON.parse(readFileSync(TRANSLATIONS_FILE, 'utf-8'))
        : { commands: {}, tools: {}, meta: {} }
    const translations = await computeTranslations(upstream, existingTranslations)

    console.log('\n💾 写入数据文件...')
    writeFileSync(UPSTREAM_FILE, JSON.stringify(upstream, null, 2), 'utf-8')
    writeFileSync(TRANSLATIONS_FILE, JSON.stringify(translations, null, 2), 'utf-8')
    writeFileSync(SHA_FILE, commitSha, 'utf-8')
    markSyncSuccess(commitSha)

    console.log('\n✅ 同步完成！')
    console.log(`  upstream.json: ${upstream.commands.length} commands, ${upstream.tools.length} tools`)
    console.log(`  translations.json: ${Object.keys(translations.commands).length} commands translated`)
}

main().catch(async (err) => {
    let latestSha = ''
    try {
        latestSha = await getLatestCommitSha()
    } catch {
        latestSha = ''
    }
    await markSyncFailure(err, latestSha)
    console.error('❌ 数据同步失败:', err)
    process.exit(1)
})
