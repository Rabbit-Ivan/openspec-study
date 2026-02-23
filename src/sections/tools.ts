// Tools section renderer

import type { Translations, UpstreamData } from '../types'
import { SECTION_LABELS } from '../data/custom'

function getTranslated(entry: { translated: string } | undefined, fallback: string): string {
    return entry?.translated || fallback
}

export function renderTools(container: HTMLElement, upstream: UpstreamData, translations: Translations) {
    const tools = upstream.tools
    const toolSyntax = upstream.toolSyntax

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
          ${tools.map(t => `<span style="${badgeStyle}" title="${getTranslated(translations.tools[t.name], t.name)}">${t.name}</span>`).join('\n          ')}
        </div>

        <h3 style="font-size: 1.1rem; margin: 2rem 0 1rem; color: var(--gold-glow);">多语言支持</h3>
        <div style="color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 0.8rem;">
          通过在 <code>openspec/config.yaml</code> 的 <code>context</code> 中声明目标语言，可以让所有产出物自动使用指定语言。
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${upstream.multiLanguage.examples.map(example => `
            <span style="padding: 0.28rem 0.65rem; border-radius: 999px; border: 1px solid rgba(251,191,36,0.35); background: rgba(251,191,36,0.1); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--gold-glow);">
              ${getTranslated(translations.multiLanguage[`lang:${example.language}`], example.language)}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `
}
