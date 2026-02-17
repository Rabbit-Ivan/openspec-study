// Workflow section renderer

import { SECTION_LABELS, MANTRA, WORKFLOW_DEMOS } from '../data/custom'
import type { UpstreamData } from '../types'

interface TerminalLine {
    type: string
    text?: string
    command?: string
    arg?: string
    parts?: Array<{ type: string; text: string }>
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

export function renderWorkflow(container: HTMLElement, upstream: UpstreamData) {
    const modes = ['fast', 'detailed', 'parallel'] as const
    const quickFeatureFlow = upstream.workflowHighlights.quickFeature.length
        ? upstream.workflowHighlights.quickFeature
        : ['/opsx:new', '/opsx:ff', '/opsx:apply', '/opsx:verify', '/opsx:archive']
    const completionFlow = upstream.workflowHighlights.completion.length
        ? upstream.workflowHighlights.completion
        : ['/opsx:apply', '/opsx:verify', '/opsx:archive']

    container.innerHTML = `
    <div class="section-label">${SECTION_LABELS.workflow}</div>
    <h2 class="section-title">${SECTION_LABELS.workflowTitle}</h2>
    <p class="section-desc">${SECTION_LABELS.workflowDesc}</p>
    <div style="margin: 1.2rem 0 1.6rem; padding: 1rem 1.2rem; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(243,156,18,0.2);">
      <div style="font-size: 0.95rem; color: var(--gold-glow);">官方推荐链路（自动同步）</div>
      ${renderFlowChips('Quick Feature', quickFeatureFlow)}
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
        <div class="flow-icon">📝</div>
        <div class="flow-chinese">${MANTRA.characters[1]}</div>
        <div class="flow-label">continue/ff</div>
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
  `
}
