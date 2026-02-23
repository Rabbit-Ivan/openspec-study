// Commands section renderer

import type { CliCommand, Translations, UpstreamData } from '../types'
import {
    SECTION_LABELS,
    COMMAND_CATEGORIES,
    COMMAND_CATEGORY_MAP,
    COMMAND_CHINESE_NAMES,
    COMMAND_TYPE_LABELS,
} from '../data/custom'

function getTranslated(entry: { translated: string } | undefined, fallback: string): string {
    return entry?.translated || fallback
}

export function renderCommands(
    container: HTMLElement,
    upstream: UpstreamData,
    translations: Translations
) {
    const commands = upstream.commands

    const grouped: Record<string, typeof commands> = { main: [], speed: [], auxiliary: [] }
    for (const cmd of commands) {
        const category = COMMAND_CATEGORY_MAP[cmd.name] || 'auxiliary'
        grouped[category].push(cmd)
    }

    function renderCard(cmd: typeof commands[0]) {
        const category = COMMAND_CATEGORY_MAP[cmd.name] || 'auxiliary'
        const isEssential = category === 'main'
        const chineseName = translations.commands[cmd.name]?.chineseName
            || COMMAND_CHINESE_NAMES[cmd.name]
            || cmd.name
        const description = translations.commands[cmd.name]?.description || cmd.purpose
        const typeLabel = COMMAND_TYPE_LABELS[cmd.name] || category

        return `
      <div class="command-card${isEssential ? ' essential' : ''}">
        <div class="command-type">${typeLabel}</div>
        <div class="command-name">${cmd.name}</div>
        <div class="command-chinese">${chineseName}</div>
        <div class="command-desc">${description}</div>
      </div>
    `
    }

    function renderGroup(key: 'main' | 'speed' | 'auxiliary') {
        const cmds = grouped[key]
        if (!cmds.length) return ''
        const { label, color } = COMMAND_CATEGORIES[key]
        return `
      <h3 style="color: ${color}; margin: 2rem 0 1rem; font-size: 1.1rem;">${label}</h3>
      <div class="command-grid">
        ${cmds.map(renderCard).join('')}
      </div>
    `
    }

    function renderCliRow(cli: CliCommand): string {
        const translatedName = getTranslated(translations.cli[`name:${cli.name}`], cli.name)
        const translatedDesc = getTranslated(translations.cli[`desc:${cli.name}`], cli.description)
        const optionsPreview = cli.options.slice(0, 2).map(item => item.name).join('、')
        return `
      <tr>
        <td><code>${cli.name}</code></td>
        <td>${translatedName}</td>
        <td>${translatedDesc || cli.category}</td>
        <td>${optionsPreview || '-'}</td>
      </tr>
    `
    }

    container.innerHTML = `
    <div class="section-label">${SECTION_LABELS.commands}</div>
    <h2 class="section-title">${SECTION_LABELS.commandsTitle}</h2>
    <p class="section-desc">${SECTION_LABELS.commandsDesc}</p>
    ${renderGroup('main')}
    ${renderGroup('speed')}
    ${renderGroup('auxiliary')}

    <div class="workflow-container" style="margin-top: 2rem;">
      <div style="padding: 1.5rem 1.8rem;">
        <h3 style="font-size: 1.05rem; color: var(--gold-glow); margin-bottom: 0.9rem;">CLI 命令行（摘选）</h3>
        <table class="ref-table">
          <thead>
            <tr>
              <th>命令</th>
              <th>中文名</th>
              <th>说明</th>
              <th>常用选项</th>
            </tr>
          </thead>
          <tbody>
            ${upstream.cli.slice(0, 10).map(renderCliRow).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div style="margin-top: 2rem; padding: 1.2rem; border-radius: 10px; border: 1px solid rgba(251,191,36,0.25); background: rgba(251,191,36,0.08);">
      <h3 style="font-size: 1.05rem; color: var(--gold-glow); margin-bottom: 0.7rem;">Legacy Commands</h3>
      <ul style="margin-left: 1.2rem; color: var(--text-secondary);">
        ${upstream.legacyCommands.map(item => `<li><code>${item.command}</code>：${item.purpose}</li>`).join('')}
      </ul>
    </div>

    <div style="margin-top: 1.2rem; padding: 1.2rem; border-radius: 10px; border: 1px solid rgba(74,222,128,0.25); background: rgba(74,222,128,0.08);">
      <h3 style="font-size: 1.05rem; color: var(--jade-glow); margin-bottom: 0.7rem;">Troubleshooting</h3>
      ${upstream.troubleshooting.map(item => `
        <div style="margin-bottom: 0.8rem;">
          <div style="font-weight: 600; margin-bottom: 0.3rem;">${item.issue}</div>
          <ul style="margin-left: 1.2rem; color: var(--text-secondary);">
            ${item.solutions.map(solution => `<li>${solution}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `
}
