// Workflow section renderer

import { SECTION_LABELS, MANTRA, WORKFLOW_DEMOS } from '../data/custom'

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

export function renderWorkflow(container: HTMLElement) {
    const modes = ['fast', 'detailed', 'parallel'] as const

    container.innerHTML = `
    <div class="section-label">${SECTION_LABELS.workflow}</div>
    <h2 class="section-title">${SECTION_LABELS.workflowTitle}</h2>
    <p class="section-desc">${SECTION_LABELS.workflowDesc}</p>

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
