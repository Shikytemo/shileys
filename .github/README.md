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

- 🔘 `interactiveButtons`, `cards` (carousel), serta shorthand klasik `buttons` & `sections`.
- 🌐 `sock.sendHTML(jid, html, options)` untuk HTML/CSS/JS langsung di gelembung chat atau mode `screen: true` ("Klik Aku"), plus `{ html }` dokumen `text/html`.
- 🖼️ `album` array & `sock.sendAlbumMessage()`, `sendImageHd()`, dan `stickerAudio` (sticker + reply audio/VN).
- 📢 `groupStatus` & `sock.sendStatusMentions()`, `requestPayment`, dan `pollResult`.
- 🛡️ Anti-ban & performa: `humanize` (jitter delay + typing), `makeCustomPresence` / `sendPresenceUpdate` berdurasi, `wrapUploadWithCache` (cache + retry upload), dan `makeLiteStore` (TTL + bounded memory store).
- 🤖 Opsi `{ ai: true }` untuk badge AI/Bot & custom pairing code `sock.requestPairingCode(phone, 'SHIKY123')`.
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
reminderButton('Ingatkan', 'rem_1')
locationButton('Kirim Lokasi')
catalogButton('Lihat Katalog', '628xxxx@s.whatsapp.net')
addressButton('Isi Alamat', 'addr_1')
```

`sock.sendMessage()` otomatis menambahkan native-flow relay node yang dibutuhkan WhatsApp, jadi aplikasi tidak perlu memanggil `relayMessage()` manual.

## 🎠 Carousel / Cards, Album, & Status

```ts
// Carousel cards
await sock.sendMessage(jid, {
  text: 'Daftar Produk',
  footer: 'Geser ke samping',
  cards: [
    {
      title: 'Paket A',
      body: 'Deskripsi paket A',
      image: { url: 'https://example.com/a.jpg' },
      buttons: [quickReplyButton('Beli A', 'buy_a')]
    }
  ]
})

// Album foto/video sekaligus
await sock.sendMessage(jid, {
  album: [
    { image: { url: 'https://example.com/1.jpg' }, caption: 'Foto 1' },
    { video: { url: 'https://example.com/2.mp4' }, caption: 'Video 2' }
  ]
})

// Group status (SW di grup) & Status mentions
await sock.sendMessage(groupJid, { groupStatus: { text: 'Halo grup!' } })
await sock.sendStatusMentions({ text: 'Cek status ini!' }, ['628xxxx@s.whatsapp.net', groupJid])

// Send HTML sebagai dokumen text/html
await sock.sendMessage(jid, {
  html: '<h1>Hello Shileys</h1>',
  fileName: 'hello.html',
  caption: 'Preview HTML'
})

// Sticker + Audio (kirim sticker lalu audio/VN yang me-reply sticker)
await sock.sendMessage(jid, {
  stickerAudio: {
    sticker: { url: './sticker.webp' },
    audio: { url: './audio.ogg' },
    ptt: true
  }
})
```

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
