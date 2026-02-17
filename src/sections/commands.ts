// Commands section renderer

import type { UpstreamData, Translations } from '../types'
import {
    SECTION_LABELS,
    COMMAND_CATEGORIES,
    COMMAND_CATEGORY_MAP,
    COMMAND_CHINESE_NAMES,
    COMMAND_TYPE_LABELS,
} from '../data/custom'

export function renderCommands(
    container: HTMLElement,
    upstream: UpstreamData,
    translations: Translations
) {
    const commands = upstream.commands

    // Group commands by category
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

    container.innerHTML = `
    <div class="section-label">${SECTION_LABELS.commands}</div>
    <h2 class="section-title">${SECTION_LABELS.commandsTitle}</h2>
    <p class="section-desc">${SECTION_LABELS.commandsDesc}</p>
    ${renderGroup('main')}
    ${renderGroup('speed')}
    ${renderGroup('auxiliary')}
  `
}
