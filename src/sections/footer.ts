// Footer section renderer

import { MANTRA } from '../data/custom'
import type { UpstreamData } from '../types'

export function renderFooter(container: HTMLElement, upstream: UpstreamData) {
    const toolCount = upstream.tools.length || 22
    container.innerHTML = `
    <div class="footer-mantra">
      ${MANTRA.characters.map((c, i) =>
        `<span>${c}</span>`
    ).join(' → ')}
    </div>
    <p class="footer-text">
      OpenSpec 工作流指南 · 用四个字掌握规格驱动开发 · 支持 ${toolCount}+ AI 编码工具
    </p>
  `
}
