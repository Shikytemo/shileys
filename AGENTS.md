# Shileys Agent Memory

Use this file as persistent project context when working in this repository.

## Project

- Package/repo name: `shileys`
- GitHub: `https://github.com/Shikytemo/shileys`
- Upstream: `https://github.com/WhiskeySockets/Baileys`
- This is a public fork of Baileys.
- Keep compatibility with Baileys patterns and avoid broad unrelated refactors.

## Current Custom Features

- High-level native-flow `interactiveButtons` support:
  - Types: `src/Types/Message.ts`
  - Message builder: `src/Utils/messages.ts`
  - Test: `src/__tests__/Utils/messages.test.ts`
- Optional CLI banner:
  - `bin/shileys.js`
  - `package.json` has `bin.shileys`
- GitHub README lives at `.github/README.md`; root `README.md` is not always the file shown on the GitHub repo homepage.

## Branding Rule

Do not inject a forced bot name, footer, watermark, logo, or banner into outgoing WhatsApp runtime messages.
Branding must be optional and developer-controlled. CLI/README/package metadata branding is allowed.

## Common Commands

```sh
npm run build
node --experimental-vm-modules ./node_modules/.bin/jest src/__tests__/Utils/messages.test.ts --runInBand
node bin/shileys.js --plain
git status --short --branch
```

## Notes

- The repo package manager is declared as Yarn 4, but this Termux environment has Yarn 1 and no `corepack`.
- `npm install --ignore-scripts` was used locally for verification dependencies.
- Do not commit `package-lock.json` unless the user explicitly decides to switch package managers.
