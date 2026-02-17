// Tools section renderer

import type { UpstreamData } from '../types'
import { SECTION_LABELS } from '../data/custom'

export function renderTools(container: HTMLElement, upstream: UpstreamData) {
    const tools = upstream.tools
    const toolSyntax = upstream.toolSyntax

    // Tool badge style
    const badgeStyle = `font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; padding: 0.35rem 0.75rem; background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.3); border-radius: 100px; color: var(--jade-glow);`

    container.innerHTML = `
    <div class="section-label">${SECTION_LABELS.tools}</div>
    <h2 class="section-title">支持 ${tools.length}+ AI 编码工具</h2>
    <p class="section-desc">${SECTION_LABELS.toolsDesc}</p>

    <div class="workflow-container">
      <div style="padding: 2rem;">
        ${toolSyntax.length > 0 ? `
          <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--gold-glow);">命令语法对照</h3>
          <table class="ref-table">
            <thead>
              <tr>
                <th>工具</th>
                <th>语法示例</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              ${toolSyntax.map(s => `
                <tr>
                  <td>${s.tool}</td>
                  <td>${s.syntax}</td>
                  <td>${s.note || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <h3 style="font-size: 1.1rem; margin: 2rem 0 1rem; color: var(--jade-glow);">完整支持列表</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${tools.map(t => `<span style="${badgeStyle}">${t.name}</span>`).join('\n          ')}
        </div>
      </div>
    </div>
  `
}
