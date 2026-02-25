// Workflow section renderer

import { SECTION_LABELS, MANTRA, WORKFLOW_DEMOS } from '../data/custom'
import type { Translations, UpstreamData } from '../types'

interface TerminalLine {
    type: string
    text?: string
    command?: string
    arg?: string
    parts?: Array<{ type: string; text: string }>
}

function getTranslated(entry: { translated: string } | undefined, fallback: string): string {
    return entry?.translated || fallback
}

function renderTerminalLine(line: TerminalLine): string {
    switch (line.type) {
        case 'comment':
            return `<div class="terminal-line"><span class="terminal-comment">${line.text}</span></div>`
        case 'input':
            return `<div class="terminal-line"><span class="terminal-prompt">你：</span><span class="terminal-command">${line.text}</span></div>`
        case 'input-text':
            return `<div class="terminal-line"><span class="terminal-prompt">你：</span><span class="terminal-output">${line.text}</span></div>`
        case 'input-with-arg':
            return `<div class="terminal-line"><span class="terminal-prompt">你：</span><span class="terminal-command">${line.command}</span><span class="terminal-output">${line.arg}</span></div>`
        case 'output':
            return `<div class="terminal-line"><span class="terminal-output">${line.text}</span></div>`
        case 'success':
            return `<div class="terminal-line"><span class="terminal-success">${line.text}</span></div>`
        case 'blank':
            return `<div class="terminal-line"></div>`
        case 'mixed':
            return `<div class="terminal-line">${(line.parts || []).map(p =>
                p.type === 'input'
                    ? `<span class="terminal-command">${p.text}</span>`
                    : `<span class="terminal-output">${p.text}</span>`
            ).join('')}</div>`
        default:
            return `<div class="terminal-line">${line.text || ''}</div>`
    }
}

function renderTerminal(lines: TerminalLine[]): string {
    return `
    <div class="terminal">
      <div class="terminal-header">
        <div class="terminal-dot red"></div>
        <div class="terminal-dot yellow"></div>
        <div class="terminal-dot green"></div>
      </div>
      <div class="terminal-body">
        ${lines.map(renderTerminalLine).join('\n        ')}
      </div>
    </div>
  `
}

function renderFlowChips(title: string, commands: string[]): string {
    if (commands.length === 0) return ''

    return `
      <div style="margin-top: 1rem;">
        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.4rem;">${title}</div>
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem;">
          ${commands.map((cmd, i) => `
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; padding: 0.2rem 0.55rem; border-radius: 999px; background: rgba(243,156,18,0.12); border: 1px solid rgba(243,156,18,0.25); color: var(--gold-glow);">${cmd}</span>
            ${i < commands.length - 1 ? '<span style="color: var(--text-muted);">→</span>' : ''}
          `).join('')}
        </div>
      </div>
    `
}

export function renderWorkflow(container: HTMLElement, upstream: UpstreamData, translations: Translations) {
    const modes = ['fast', 'detailed', 'parallel'] as const
    const coreFlow = ['/opsx:propose', '/opsx:apply', '/opsx:archive']
    const expandedQuickFeatureFlow = upstream.workflowHighlights.quickFeature.length
        ? upstream.workflowHighlights.quickFeature
        : ['/opsx:new', '/opsx:ff', '/opsx:apply', '/opsx:verify', '/opsx:archive']
    const completionFlow = upstream.workflowHighlights.completion.length
        ? upstream.workflowHighlights.completion
        : ['/opsx:apply', '/opsx:verify', '/opsx:archive']

    container.innerHTML = `
    <div class="section-label">${SECTION_LABELS.workflow}</div>
    <h2 class="section-title">${SECTION_LABELS.workflowTitle}</h2>
    <p class="section-desc">${SECTION_LABELS.workflowDesc}</p>
    <div style="margin: 1.2rem 0 0.8rem; padding: 1rem 1.2rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(243,156,18,0.2);">
      <div style="font-size: 0.95rem; color: var(--gold-glow);">默认核心流（core，官方默认）</div>
      ${renderFlowChips('Default Quick Path', coreFlow)}
    </div>
    <div style="margin: 0 0 1.6rem; padding: 1rem 1.2rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(74,222,128,0.22);">
      <div style="font-size: 0.95rem; color: var(--jade-glow);">进阶扩展流（可选）</div>
      <div style="color: var(--text-secondary); font-size: 0.84rem; margin-top: 0.35rem;">
        先运行 <code>openspec config profile</code>，再运行 <code>openspec update</code> 启用扩展命令。
      </div>
      ${renderFlowChips('Quick Feature (Expanded)', expandedQuickFeatureFlow)}
      ${renderFlowChips('Completing a Change', completionFlow)}
    </div>

    <div class="flow-diagram">
      <div class="flow-step">
        <div class="flow-icon">🆕</div>
        <div class="flow-chinese">${MANTRA.characters[0]}</div>
        <div class="flow-label">${MANTRA.english[0]}</div>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-icon">🔍</div>
        <div class="flow-chinese">${MANTRA.characters[1]}</div>
        <div class="flow-label">${MANTRA.english[1]}</div>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-icon">⚡</div>
        <div class="flow-chinese">${MANTRA.characters[2]}</div>
        <div class="flow-label">${MANTRA.english[2]}</div>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-icon">📦</div>
        <div class="flow-chinese">${MANTRA.characters[3]}</div>
        <div class="flow-label">${MANTRA.english[3]}</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.9rem; margin-top: 0.8rem;">
      ${upstream.concepts.slice(0, 6).map(concept => `
        <div style="padding: 0.95rem 1rem; border-radius: 10px; background: var(--ink-dark); border: 1px solid var(--ink-medium);">
          <div style="font-family: 'JetBrains Mono', monospace; color: var(--jade-glow); font-size: 0.8rem; margin-bottom: 0.35rem;">
            ${getTranslated(translations.concepts[`title:${concept.title}`], concept.title)}
          </div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">
            ${getTranslated(translations.concepts[`desc:${concept.title}`], concept.description)}
          </div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 1.4rem; padding: 1rem 1.1rem; border-radius: 10px; border: 1px solid rgba(74,222,128,0.22); background: rgba(74,222,128,0.08);">
      <div style="font-family: 'JetBrains Mono', monospace; color: var(--jade-glow); font-size: 0.86rem; margin-bottom: 0.6rem;">Schema 自定义</div>
      ${upstream.customization.slice(0, 3).map(item => `
        <div style="margin-bottom: 0.75rem;">
          <strong>${getTranslated(translations.customization[`title:${item.title}`], item.title)}</strong>
          <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.2rem;">
            ${getTranslated(translations.customization[`desc:${item.title}`], item.description)}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="workflow-container">
      <div class="workflow-tabs">
        ${modes.map((mode, i) => `
          <button class="workflow-tab${i === 0 ? ' active' : ''}" data-workflow="${mode}">
            ${WORKFLOW_DEMOS[mode].title}
          </button>
        `).join('')}
      </div>
      <div class="workflow-content">
        ${modes.map((mode, i) => `
          <div class="workflow-panel${i === 0 ? ' active' : ''}" id="workflow-${mode}">
            ${renderTerminal(WORKFLOW_DEMOS[mode].lines as TerminalLine[])}
            <p style="margin-top: 1.5rem; color: var(--text-secondary); text-align: center;">
              ${WORKFLOW_DEMOS[mode].description}
            </p>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="margin-top: 1.1rem; padding: 1rem 1.2rem; border-radius: 10px; border: 1px solid var(--ink-medium); background: rgba(255,255,255,0.02);">
      <div style="font-family: 'JetBrains Mono', monospace; color: var(--gold-glow); font-size: 0.86rem; margin-bottom: 0.6rem;">决策建议（/opsx:ff vs /opsx:continue）</div>
      <ul style="margin-left: 1.2rem; color: var(--text-secondary);">
        ${upstream.workflows.ffVsContinue.map(item => `<li>${item.situation} → <code>${item.use}</code></li>`).join('')}
      </ul>
    </div>
  `
}
