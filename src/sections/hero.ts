// Hero section renderer

import { HERO, MANTRA } from '../data/custom'
import type { UpstreamData } from '../types'

export function renderHero(container: HTMLElement, upstream: UpstreamData) {
    const toolCount = upstream.tools.length || 22
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
    <div class="scroll-hint">向下探索</div>
  `
}
