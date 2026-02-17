// Fetch upstream OpenSpec docs from GitHub API

const REPO = 'Fission-AI/OpenSpec'
const BRANCH = 'main'

const FILES_TO_FETCH = [
    'docs/commands.md',
    'docs/supported-tools.md',
    'docs/workflows.md',
    'docs/opsx.md',
    'README.md',
]

interface FetchResult {
    files: Record<string, string>
    commitSha: string
}

/**
 * Get the latest commit SHA for the main branch
 */
async function getLatestCommitSha(): Promise<string> {
    const res = await fetch(
        `https://api.github.com/repos/${REPO}/commits/${BRANCH}`,
        {
            headers: {
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'openspec-guide-builder',
            },
        }
    )
    if (!res.ok) throw new Error(`Failed to fetch commit SHA: ${res.status}`)
    const data = await res.json()
    return data.sha
}

/**
 * Get file content from GitHub raw URL
 */
async function fetchFileContent(path: string): Promise<string> {
    const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`
    const res = await fetch(url, {
        headers: { 'User-Agent': 'openspec-guide-builder' },
    })
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
    return res.text()
}

/**
 * Fetch all upstream files and return their content with the commit SHA
 */
export async function fetchUpstream(): Promise<FetchResult> {
    const commitSha = await getLatestCommitSha()
    const files: Record<string, string> = {}

    for (const path of FILES_TO_FETCH) {
        console.log(`  Fetching ${path}...`)
        files[path] = await fetchFileContent(path)
    }

    return { files, commitSha }
}

export { FILES_TO_FETCH }
