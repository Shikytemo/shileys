#!/usr/bin/env node

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const args = new Set(process.argv.slice(2))

const info = {
	name: pkg.name,
	version: pkg.version,
	description: pkg.description,
	repository: pkg.homepage || pkg.repository?.url || '',
	features: ['WhatsApp Web socket client', 'Native flow interactive buttons', 'TypeScript ready']
}

if (args.has('--version') || args.has('-v')) {
	console.log(info.version)
	process.exit(0)
}

if (args.has('--json')) {
	console.log(JSON.stringify(info, null, 2))
	process.exit(0)
}

if (args.has('--plain')) {
	console.log(`${info.name} v${info.version}`)
	console.log(info.description)
	console.log(`Repository: ${info.repository}`)
	process.exit(0)
}

const cyan = '\x1b[36m'
const magenta = '\x1b[35m'
const gray = '\x1b[90m'
const bold = '\x1b[1m'
const reset = '\x1b[0m'

console.log(`${cyan}${bold}
   ____  __    _ __
  / __/ / /   (_) /__ __ _____
 _\\ \\  / _ \\ / / / -_) // (_-<
/___/ /_//_//_/_/\\__/\\_, /___/
                    /___/
${reset}${magenta}        <> native-flow buttons for Baileys${reset}
`)

console.log(`${bold}${info.name}${reset} v${info.version}`)
console.log(`${gray}${info.description}${reset}`)
console.log('')
console.log(`${bold}Features${reset}`)
for (const feature of info.features) {
	console.log(`  - ${feature}`)
}

console.log('')
console.log(`${bold}Usage${reset}`)
console.log('  import makeWASocket from "shileys"')
console.log('  await sock.sendMessage(jid, { text, title, footer, interactiveButtons })')

console.log('')
console.log(`${bold}Options${reset}`)
console.log('  shileys --version   Print package version')
console.log('  shileys --plain     Print compact text output')
console.log('  shileys --json      Print package metadata as JSON')
