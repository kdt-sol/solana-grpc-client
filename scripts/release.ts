import { execa } from 'execa'

const run = async (command: string, args: string[]) => execa(command, args).then(({ stdout }) => {
    process.stdout.write(stdout)
})

await run('changelogen', [
    '--clean',
    '--output',
    'CHANGELOG.md',
    '--release',
    '--no-commit',
    '--no-tag',
    '--no-github',
])

await run('pnpm', ['lint:fix'])
await run('git', ['add', 'CHANGELOG.md', 'package.json'])

await import('../package.json').then((m) => `v${m.version}`).then(async (version) => {
    await run('git', ['commit', '-m', `chore(release): ${version}`])
    await run('git', ['tag', '-am', version, version])
    await run('git', ['push', '--follow-tags'])
})
