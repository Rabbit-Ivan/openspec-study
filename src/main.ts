// Main entry point

import './style.css'
import type { UpstreamData, Translations } from './types'
import { renderHero } from './sections/hero'
import { renderCommands } from './sections/commands'
import { renderWorkflow } from './sections/workflow'
import { renderScenario } from './sections/scenario'
import { renderReference } from './sections/reference'
import { renderTools } from './sections/tools'
import { renderFooter } from './sections/footer'

// Import data (generated at build time)
import upstreamData from './data/upstream.json'
import translationsData from './data/translations.json'

const upstream = upstreamData as UpstreamData
const translations = translationsData as Translations

// Render all sections
function renderApp() {
    const hero = document.getElementById('hero')
    const commands = document.getElementById('commands')
    const workflow = document.getElementById('workflow')
    const scenario = document.getElementById('scenario')
    const reference = document.getElementById('reference')
    const tools = document.getElementById('tools')
    const footer = document.getElementById('app-footer')

    if (hero) renderHero(hero, upstream, translations)
    if (commands) renderCommands(commands, upstream, translations)
    if (workflow) renderWorkflow(workflow, upstream, translations)
    if (scenario) renderScenario(scenario)
    if (reference) renderReference(reference, upstream, translations)
    if (tools) renderTools(tools, upstream, translations)
    if (footer) renderFooter(footer, upstream, translations)

    // Initialize interactions
    initWorkflowTabs()
    initScrollAnimations()
    initSmoothScroll()
}

// Workflow tab switching
function initWorkflowTabs() {
    document.querySelectorAll('.workflow-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = (tab as HTMLElement).dataset.workflow
            if (!mode) return

            document.querySelectorAll('.workflow-tab').forEach(t => t.classList.remove('active'))
            document.querySelectorAll('.workflow-panel').forEach(p => p.classList.remove('active'))

            tab.classList.add('active')
            const panel = document.getElementById(`workflow-${mode}`)
            panel?.classList.add('active')
        })
    })
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    ; (entry.target as HTMLElement).style.opacity = '1'
                        ; (entry.target as HTMLElement).style.transform = 'translateY(0)'
                }
            })
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.command-card, .scenario-box, .quick-ref').forEach(el => {
        ; (el as HTMLElement).style.opacity = '0'
            ; (el as HTMLElement).style.transform = 'translateY(20px)'
            ; (el as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease'
        observer.observe(el)
    })
}

// Smooth scrolling for nav links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault()
            const href = anchor.getAttribute('href')
            if (!href) return
            const target = document.querySelector(href)
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
    })
}

// Boot
document.addEventListener('DOMContentLoaded', renderApp)
