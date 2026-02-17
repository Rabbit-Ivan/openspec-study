// Scenario section renderer

import { SECTION_LABELS, SCENARIO } from '../data/custom'

export function renderScenario(container: HTMLElement) {
    container.innerHTML = `
    <div class="section-label">${SECTION_LABELS.scenario}</div>
    <h2 class="section-title">${SECTION_LABELS.scenarioTitle}</h2>
    <p class="section-desc">${SECTION_LABELS.scenarioDesc}</p>

    <div class="scenario-box">
      <div class="scenario-header">
        <div class="scenario-icon">${SCENARIO.icon}</div>
        <div>
          <div class="scenario-title">${SCENARIO.title}</div>
          <div class="scenario-subtitle">${SCENARIO.subtitle}</div>
        </div>
      </div>

      <ol class="step-list">
        ${SCENARIO.steps.map(step => `
          <li class="step-item">
            <div class="step-command">${step.command}</div>
            <div class="step-desc">${step.desc}</div>
            <div class="step-result">
              ${step.results.join('<br>')}
            </div>
          </li>
        `).join('')}
      </ol>
    </div>
  `
}
