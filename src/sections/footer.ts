// Footer section renderer

import { MANTRA } from '../data/custom'
import type { Translations, UpstreamData } from '../types'

export function renderFooter(container: HTMLElement, upstream: UpstreamData, _translations: Translations) {
    const toolCount = upstream.tools.length || 22
    const sync = upstream.sync
    const sourceSha = sync?.sourceCommitSha || upstream.commitSha
    const contentSha = sync?.contentCommitSha || upstream.commitSha
    const shortSourceSha = sourceSha ? sourceSha.slice(0, 7) : 'unknown'
    const shortContentSha = contentSha ? contentSha.slice(0, 7) : 'unknown'
    const syncTime = sync?.lastSyncAt
        ? new Date(sync.lastSyncAt).toLocaleString('zh-CN', { hour12: false })
        : 'unknown'
    const hasUntracked = Boolean(sync?.untrackedChanges?.length)
    const statusText = sync?.status === 'warn'
        ? '部分更新未纳入展示'
        : '已同步'
    const statusClass = sync?.status === 'warn'
        ? 'sync-status warn'
        : 'sync-status ok'
    const untrackedPreview = (sync?.untrackedChanges || []).slice(0, 5)
    const moreCount = Math.max((sync?.untrackedChanges?.length || 0) - untrackedPreview.length, 0)

    container.innerHTML = `
    <div class="footer-mantra">
      ${MANTRA.characters.map((c, i) =>
        `<span>${c}</span>`
    ).join(' → ')}
    </div>
    <p class="footer-text">
      OpenSpec 工作流指南 · 用四个字掌握规格驱动开发 · 支持 ${toolCount}+ AI 编码工具
    </p>
    <div class="sync-card">
      <div class="${statusClass}">
        <span class="dot"></span>
        ${statusText}
      </div>
      <div class="sync-meta">上游提交：<code>${shortSourceSha}</code> · 展示内容提交：<code>${shortContentSha}</code></div>
      <div class="sync-meta">最近同步：${syncTime}</div>
      ${hasUntracked ? `
      <div class="sync-warning-title">未接入的上游变更文件：</div>
      <ul class="sync-warning-list">
        ${untrackedPreview.map(file => `<li><code>${file}</code></li>`).join('')}
        ${moreCount > 0 ? `<li>... 以及另外 ${moreCount} 个文件</li>` : ''}
      </ul>
      ` : ''}
    </div>
  `
}
