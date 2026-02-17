// Build data orchestrator: fetch → compare SHA → parse → translate → output

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { fetchUpstream } from './fetch-upstream'
import { parseDocs } from './parse-docs'
import { computeTranslations } from './translate'
import type { Translations } from '../src/types'

const ROOT = resolve(import.meta.dirname, '..')
const SHA_FILE = resolve(ROOT, '.last-sha')
const UPSTREAM_FILE = resolve(ROOT, 'src/data/upstream.json')
const TRANSLATIONS_FILE = resolve(ROOT, 'src/data/translations.json')

async function main() {
    console.log('🔄 OpenSpec Guide — Build Data\n')

    // Step 1: Fetch upstream
    console.log('📡 Fetching upstream docs...')
    const { files, commitSha } = await fetchUpstream()

    // Step 2: Compare SHA
    const lastSha = existsSync(SHA_FILE) ? readFileSync(SHA_FILE, 'utf-8').trim() : ''
    if (lastSha === commitSha) {
        console.log(`\n✅ No changes detected (SHA: ${commitSha.slice(0, 7)}), skipping build.`)
        return
    }
    console.log(`  New commit: ${commitSha.slice(0, 7)} (prev: ${lastSha.slice(0, 7) || 'none'})`)

    // Step 3: Parse docs
    console.log('\n📝 Parsing documents...')
    const upstream = parseDocs(files, commitSha)
    console.log(`  Commands: ${upstream.commands.length}`)
    console.log(`  Tools: ${upstream.tools.length}`)
    console.log(`  Tool syntax: ${upstream.toolSyntax.length}`)

    // Step 4: Translate new content
    console.log('\n🌐 Checking translations...')
    const existingTranslations: Translations = existsSync(TRANSLATIONS_FILE)
        ? JSON.parse(readFileSync(TRANSLATIONS_FILE, 'utf-8'))
        : { commands: {}, tools: {}, meta: {} }

    const translations = await computeTranslations(upstream, existingTranslations)

    // Step 5: Write output files
    console.log('\n💾 Writing data files...')
    writeFileSync(UPSTREAM_FILE, JSON.stringify(upstream, null, 2), 'utf-8')
    writeFileSync(TRANSLATIONS_FILE, JSON.stringify(translations, null, 2), 'utf-8')
    writeFileSync(SHA_FILE, commitSha, 'utf-8')

    console.log(`\n✅ Build data complete!`)
    console.log(`  upstream.json: ${upstream.commands.length} commands, ${upstream.tools.length} tools`)
    console.log(`  translations.json: ${Object.keys(translations.commands).length} commands translated`)
}

main().catch((err) => {
    console.error('❌ Build data failed:', err)
    process.exit(1)
})
