// Quick Reference section renderer

import type { UpstreamData, Translations } from '../types'
import {
    REFERENCE_TABLE_HEADERS,
    COMMAND_CHINESE_NAMES,
    COMMAND_USAGE_SCENARIOS,
    MANTRA,
} from '../data/custom'

export function renderReference(container: HTMLElement, upstream: UpstreamData, translations: Translations) {
    const commands = upstream.commands

    // Sort commands in a logical order for the reference table
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
    </div>
  `
}
