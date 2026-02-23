// Fetch upstream OpenSpec docs from GitHub API

const REPO = 'Fission-AI/OpenSpec'
const BRANCH = 'main'
const REPO_API_BASE = `https://api.github.com/repos/${REPO}`
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}`

const FILES_TO_FETCH = [
    'docs/commands.md',
    'docs/supported-tools.md',
    'docs/workflows.md',
    'docs/opsx.md',
    'docs/concepts.md',
    'docs/getting-started.md',
    'docs/installation.md',
    'docs/cli.md',
    'docs/customization.md',
    'docs/migration-guide.md',
    'docs/multi-language.md',
    'README.md',
]

interface FetchResult {
    files: Record<string, string>
    commitSha: string
}

interface CompareResult {
    changedFiles: string[]
    trackedChanges: string[]
    untrackedChanges: string[]
    hasTrackedChanges: boolean
}

function createGithubHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'openspec-guide-builder',
    }
    const token = process.env.GITHUB_TOKEN
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }
    return headers
}

/**
 * Get the latest commit SHA for the main branch
 */
export async function getLatestCommitSha(): Promise<string> {
    const res = await fetch(
        `${REPO_API_BASE}/commits/${BRANCH}`,
        {
            headers: createGithubHeaders(),
        }
    )
    if (!res.ok) throw new Error(`Failed to fetch commit SHA: ${res.status}`)
    const data = await res.json()
    return data.sha
}

/**
 * Get file content from GitHub raw URL
 */
async function fetchFileContent(path: string, ref: string): Promise<string> {
    const url = `${RAW_BASE}/${ref}/${path}`
    const res = await fetch(url, {
        headers: { 'User-Agent': 'openspec-guide-builder' },
    })
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
    return res.text()
}

/**
 * Compare two commits and return changed files split by tracked/untracked sets.
 */
export async function compareCommits(
    baseSha: string,
    headSha: string,
    trackedFiles: string[] = FILES_TO_FETCH
): Promise<CompareResult> {
    if (!baseSha || !headSha || baseSha === headSha) {
        return {
            changedFiles: [],
            trackedChanges: [],
            untrackedChanges: [],
            hasTrackedChanges: false,
        }
    }

    const res = await fetch(
        `${REPO_API_BASE}/compare/${baseSha}...${headSha}`,
        { headers: createGithubHeaders() }
    )
    if (!res.ok) {
        throw new Error(`Failed to compare commits: ${res.status}`)
    }
    const data = await res.json() as { files?: Array<{ filename: string }> }
    const changedFiles = (data.files || [])
        .map(file => file.filename)
        .filter(file => file === 'README.md' || file.startsWith('docs/'))
    const trackedSet = new Set(trackedFiles)
    const trackedChanges = changedFiles.filter(file => trackedSet.has(file))
    const untrackedChanges = changedFiles.filter(file => !trackedSet.has(file))

    return {
        changedFiles,
        trackedChanges,
        untrackedChanges,
        hasTrackedChanges: trackedChanges.length > 0,
    }
}

/**
 * Fetch all upstream files and return their content with the commit SHA
 */
export async function fetchUpstream(refOrSha?: string): Promise<FetchResult> {
    const commitSha = refOrSha || await getLatestCommitSha()
    const files: Record<string, string> = {}

    for (const path of FILES_TO_FETCH) {
        console.log(`  Fetching ${path}...`)
        files[path] = await fetchFileContent(path, commitSha)
    }

    return { files, commitSha }
}

export { FILES_TO_FETCH, REPO, BRANCH }
