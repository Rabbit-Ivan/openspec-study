// Quick Reference section renderer

import type { Translations, UpstreamData } from '../types'
import {
    REFERENCE_TABLE_HEADERS,
    COMMAND_CHINESE_NAMES,
    COMMAND_USAGE_SCENARIOS,
    MANTRA,
} from '../data/custom'

function getTranslated(entry: { translated: string } | undefined, fallback: string): string {
    return entry?.translated || fallback
}

export function renderReference(container: HTMLElement, upstream: UpstreamData, translations: Translations) {
    const commands = upstream.commands

    const order = [
        '/opsx:ff', '/opsx:new', '/opsx:continue', '/opsx:apply',
        '/opsx:verify', '/opsx:archive', '/opsx:explore', '/opsx:sync',
        '/opsx:bulk-archive', '/opsx:onboard',
    ]

    const sorted = [...commands].sort((a, b) => {
        const ai = order.indexOf(a.name)
        const bi = order.indexOf(b.name)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })

    container.innerHTML = `
    <div class="quick-ref">
      <h2 class="quick-ref-title">📋 速查表</h2>
      <p class="quick-ref-subtitle">打印出来贴在显眼处</p>

      <table class="ref-table">
        <thead>
          <tr>
            <th>${REFERENCE_TABLE_HEADERS.command}</th>
            <th>${REFERENCE_TABLE_HEADERS.chinese}</th>
            <th>${REFERENCE_TABLE_HEADERS.purpose}</th>
            <th>${REFERENCE_TABLE_HEADERS.scenario}</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(cmd => {
        const chineseName = translations.commands[cmd.name]?.chineseName
            || COMMAND_CHINESE_NAMES[cmd.name]
            || ''
        const description = translations.commands[cmd.name]?.description || cmd.purpose
        const scenario = COMMAND_USAGE_SCENARIOS[cmd.name] || ''
        return `
              <tr>
                <td>${cmd.name}</td>
                <td>${chineseName}</td>
                <td>${description}</td>
                <td>${scenario}</td>
              </tr>
            `
    }).join('')}
        </tbody>
      </table>

      <div style="margin-top: 2rem; padding: 1.5rem; background: var(--ink-black); border-radius: 8px; text-align: center;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; margin-bottom: 0.5rem;">
          记忆口诀
        </div>
        <div style="font-size: 2rem; font-weight: 700;">
          ${MANTRA.characters.map((c, i) =>
        `<span style="color: var(--${MANTRA.colors[i]}-glow);">${c}</span>`
    ).join(`\n          <span style="color: var(--text-muted);">→</span>\n          `)}
        </div>
        <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">
          ${MANTRA.english.join(' → ')}
        </div>
      </div>

      <div style="margin-top: 1.2rem; padding: 1rem 1.2rem; border-radius: 10px; border: 1px solid rgba(251,191,36,0.25); background: rgba(251,191,36,0.08);">
        <div style="font-family: 'JetBrains Mono', monospace; color: var(--gold-glow); margin-bottom: 0.55rem;">迁移指南（核心步骤）</div>
        <ul style="margin-left: 1.2rem; color: var(--text-secondary);">
          ${upstream.migrationGuide.slice(0, 6).map(step => `
            <li>
              <strong>${getTranslated(translations.migrationGuide[`title:${step.title}`], step.title)}</strong>
              <span>：${getTranslated(translations.migrationGuide[`desc:${step.title}`], step.description)}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="margin-top: 1rem; padding: 1rem 1.2rem; border-radius: 10px; border: 1px solid rgba(74,222,128,0.25); background: rgba(74,222,128,0.08);">
        <div style="font-family: 'JetBrains Mono', monospace; color: var(--jade-glow); margin-bottom: 0.55rem;">OPSX 架构要点</div>
        <ul style="margin-left: 1.2rem; color: var(--text-secondary);">
          ${upstream.opsx.sections.slice(0, 5).map(section => `
            <li>
              <strong>${getTranslated(translations.opsx[`title:${section.title}`], section.title)}</strong>
              <span>：${getTranslated(translations.opsx[`desc:${section.title}`], section.description)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `
}
