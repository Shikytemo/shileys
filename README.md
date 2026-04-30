<div align="center">
  <img src="https://media.tenor.com/wHfOfpKJNIcAAAAM/little-witch-academia-diana-cavendish.gif" width="360" alt="Diana anime gif" />

  <h1>Shileys</h1>

  <p>
    Baileys mod ringan buat WhatsApp Web socket, difokuskan ke native-flow button dan helper LID/JID.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Baileys-based-25D366?style=for-the-badge" alt="Baileys based" />
    <img src="https://img.shields.io/badge/Native--Flow-Buttons-8A2BE2?style=for-the-badge" alt="Native flow buttons" />
    <img src="https://img.shields.io/badge/TypeScript-ready-3178C6?style=for-the-badge" alt="TypeScript ready" />
  </p>
</div>

---

## ✨ Fokus Mod

Shileys tetap menjaga bentuk API Baileys, tapi menambah fitur yang enak dipakai buat bot publik:

- 🔘 `interactiveButtons` untuk native-flow button.
- 🧭 Helper LID/JID: `lidToJid`, `jidToLid`, `normalizeMessageLidToJid`, `normalizeContactLidToJid`.
- 🧼 Tidak ada watermark, nama bot, footer, atau branding paksa di pesan runtime.
- 🧩 CLI kecil `shileys` buat info package.
- 🛠️ TypeScript-ready dan tetap kompatibel dengan flow Baileys.

> Shileys adalah fork publik dari [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys). Gunakan dengan tanggung jawab dan ikuti Terms of Service WhatsApp.

## 📦 Install

```sh
npm install github:Shikytemo/shileys
```

atau:

```sh
yarn add github:Shikytemo/shileys
```

## 🚀 Basic Usage

```ts
import makeWASocket, { quickReplyButton, urlButton } from 'shileys'

const sock = makeWASocket({
  auth,
  printQRInTerminal: true
})
```

## 🔘 Native-Flow Button

Semua teks bisa kamu custom sendiri dari bot kamu.

```ts
await sock.sendMessage(jid, {
  text: 'Pilih fitur yang tersedia.',
  title: 'Bot Menu',
  footer: 'Powered by your bot',
  interactiveButtons: [
    quickReplyButton('Ping', '.ping'),
    urlButton('GitHub', 'https://github.com/Shikytemo/shileys')
  ]
})
```

Button yang biasa dipakai:

| Button | Fungsi |
| --- | --- |
| `quick_reply` | Balasan cepat ke bot |
| `single_select` | List/pilihan menu |
| `cta_url` | Buka link |
| `cta_copy` | Copy teks/kode |
| `cta_call` | Tombol telepon |

Helper yang tersedia:

```ts
quickReplyButton('Ping', '.ping')
singleSelectButton('Buka Menu', sections)
urlButton('GitHub', 'https://github.com/Shikytemo/shileys')
copyButton('Copy Code', 'DIANABOT')
callButton('Call Owner', '628xxxx')
```

`sock.sendMessage()` otomatis menambahkan native-flow relay node yang dibutuhkan WhatsApp, jadi aplikasi tidak perlu memanggil `relayMessage()` manual.

## 🧭 LID ke JID

Kalau WhatsApp ngirim chat sebagai `@lid`, Shileys menyediakan helper supaya module bot lebih gampang dipakai.

```ts
const replyJid = await sock.lidToJid(message.key.remoteJid)
const normalized = await sock.normalizeMessageLidToJid(message)
```

Contoh pakai di handler:

```ts
const msg = await sock.normalizeMessageLidToJid(rawMessage)
const jid = msg.key.remoteJid

await sock.sendMessage(jid, { text: 'Ready.' })
```

## 🧪 CLI

```sh
shileys
shileys --version
shileys --plain
shileys --json
```

## 📝 Catatan

- Shileys tidak berafiliasi dengan WhatsApp.
- Fitur native-flow bisa berbeda hasilnya tergantung client, akun, dan tipe chat.
- Untuk dokumentasi API dasar, lihat upstream Baileys.

## 🔗 Links

- Shileys: https://github.com/Shikytemo/shileys
- Upstream Baileys: https://github.com/WhiskeySockets/Baileys
- Baileys Wiki: https://baileys.wiki

## 📄 License

MIT. Credit untuk maintainers Baileys tetap milik masing-masing maintainers.
