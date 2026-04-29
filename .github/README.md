<h1 align="center">Shileys</h1>

<div align="center">
  A Baileys-based WebSockets TypeScript library for interacting with the WhatsApp Web API, with native-flow interactive button helpers.
</div>

> [!NOTE]
> Shileys is a public fork of [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys). It keeps the Baileys API shape and adds a small high-level `interactiveButtons` message helper plus an optional CLI banner.

> [!CAUTION]
> This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or affiliates. Use responsibly and follow WhatsApp's Terms of Service.

## Features

- WebSocket-based WhatsApp Web client
- TypeScript-ready Baileys API
- Native-flow `interactiveButtons` helper
- Optional `shileys` CLI banner
- No forced bot name, footer, watermark, or runtime branding in outgoing messages

## Install

```sh
npm install github:Shikytemo/shileys
```

Or with yarn:

```sh
yarn add github:Shikytemo/shileys
```

## Import

```ts
import makeWASocket from 'shileys'
```

Existing Baileys-style usage stays the same:

```ts
const sock = makeWASocket({
    auth,
    printQRInTerminal: true
})
```

## Interactive Buttons

All visible text is provided by your application.

```ts
await sock.sendMessage(
    jid,
    {
        text: 'Choose an option',
        title: 'Bot Menu',
        footer: 'Select one',
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Open Menu',
                    id: 'open_menu'
                })
            },
            {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: 'Open Website',
                    url: 'https://example.com'
                })
            }
        ]
    }
)
```

Common button names:

| Name | Purpose |
|------|---------|
| `quick_reply` | Send a button reply payload back to the bot |
| `cta_url` | Open a URL |
| `cta_copy` | Copy text/code |
| `cta_call` | Start a phone call |

Button availability can vary by WhatsApp client, account type, and chat type. Prefer `interactiveButtons`/native-flow messages over legacy `templateButtons`.

## CLI

The CLI is optional and only prints package information when run directly.

```sh
shileys
shileys --version
shileys --plain
shileys --json
```

## Upstream

- Shileys: https://github.com/Shikytemo/shileys
- Original Baileys: https://github.com/WhiskeySockets/Baileys
- Baileys guide: https://baileys.wiki

## License

MIT License. Original Baileys copyright belongs to its respective maintainers.
