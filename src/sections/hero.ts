// Hero section renderer

import { HERO, MANTRA } from '../data/custom'
import type { Translations, UpstreamData } from '../types'

function getTranslated(entry: { translated: string } | undefined, fallback: string): string {
    return entry?.translated || fallback
}

export function renderHero(container: HTMLElement, upstream: UpstreamData, translations: Translations) {
    const toolCount = upstream.tools.length || 22
    const topInstall = upstream.installation.slice(0, 2)
    const topGettingStarted = upstream.gettingStarted.slice(0, 2)
    container.innerHTML = `
    <div class="hero-badge">OPSX · Artifact-Driven Workflow · ${toolCount}+ Tools</div>
    <h1 class="hero-title">
      <span class="accent">${HERO.title}</span><br>
      ${HERO.subtitle}
    </h1>
    <p class="hero-subtitle">${HERO.description}</p>
    <div class="hero-mantra">
      ${MANTRA.characters.map(c => `<span>${c}</span>`).join('\n      ')}
    </div>
    <div style="max-width: 820px; margin-top: 1.2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.9rem; text-align: left;">
      <div style="padding: 0.95rem 1rem; border: 1px solid var(--ink-medium); border-radius: 10px; background: rgba(255,255,255,0.02);">
        <div style="font-family: 'JetBrains Mono', monospace; color: var(--gold-glow); font-size: 0.82rem; margin-bottom: 0.45rem;">安装与验证</div>
        ${topInstall.map(step => `
          <div style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 0.35rem;">
            <strong style="color: var(--text-primary);">${getTranslated(translations.installation[`title:${step.title}`], step.title)}</strong>
          </div>
        `).join('')}
      </div>
      <div style="padding: 0.95rem 1rem; border: 1px solid var(--ink-medium); border-radius: 10px; background: rgba(255,255,255,0.02);">
        <div style="font-family: 'JetBrains Mono', monospace; color: var(--jade-glow); font-size: 0.82rem; margin-bottom: 0.45rem;">快速上手</div>
        ${topGettingStarted.map(step => `
          <div style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 0.35rem;">
            <strong style="color: var(--text-primary);">${getTranslated(translations.gettingStarted[`title:${step.title}`], step.title)}</strong>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="scroll-hint">向下探索</div>
  `
}
