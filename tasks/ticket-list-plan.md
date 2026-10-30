# Implementation Plan: Ticket Inbox 01 — card ticket list, Sociomile branding, real accounts

## Overview
Update block `ticket-inbox-01` (`/blocks/ticket-inbox-01?theme=classic`):
1. Ticket list jadi **card per ticket** mengikuti struktur referensi (header "Select All · Shown N", card berisi ID,
   checkbox + judul, baris chip, "Created <date>", avatar kanan atas).
2. Menu **more** (⋯) muncul sebagai overlay di pojok kanan atas card saat hover.
3. Akun channel memakai **akun social media resmi Sociomile**, bukan "Demo Motor".
4. Navbar block ini memakai **logo Sociomile** (`Frame 2.svg`) dan subtitle "Omnichannel" (bukan "Omnichannel Inbox").

## Kondisi sekarang (dibaca dari kode)
- `components/blocks/_parts/ticket-row.tsx` — baris `<li>` flat: checkbox, nama customer + `#id` + waktu, preview,
  badge channel/account/state, jumlah reply, kebab menu yang selalu tampil. Hanya dipakai `ticket-list.tsx`.
- `components/blocks/ticket-inbox-01/components/ticket-list.tsx` — container `rounded-xl border` dengan header
  "Select all · N shown", rows di `ScrollArea`, keyboard ↑/↓ via `[data-ticket-row]`, bulk actions saat ada yang dicentang.
- `Ticket` sudah punya `priority`, `category`, `createdAt`, `assignee`, `state`/`slaOverdue`, `channel`, `account` — cukup
  untuk semua chip referensi, **tidak perlu field baru**.
- `components/blocks/_parts/app-shell.tsx:145-151` — brand: ikon `MessagesSquareIcon` di tile `bg-primary` + "Sociomile" /
  "Omnichannel Inbox". Shell dipakai keempat block.
- `components/blocks/_data/channels.ts` + field `account` di `_data/tickets.ts` — akun "Demo Motor ID", "@sociomile.demo",
  "@demomotor_id", dst.
- `scripts/check-blocks.mjs` melarang hex di file block selain `channel-meta.ts` → logo **tidak boleh** di-inline sebagai
  SVG ber-hex di TSX.

## Architecture Decisions
- **Logo sebagai aset statis** `public/images/blocks/sociomile-mark.svg` (salinan `Frame 2.svg`), dirender lewat `<img alt="">`.
  Lolos guard hex, warna brand tetap asli di light/dark, nol komponen baru.
- **Branding untuk semua block** (dikonfirmasi user): ganti tile `MessagesSquareIcon` di `AppShell` langsung dengan logo dan
  subtitle "Omnichannel Inbox" → "Omnichannel". Tanpa prop baru; dashboard, report, setting ikut berubah.
- **Card dibangun dari `TicketRow` yang ada** (ubah markup, bukan komponen baru). Pola stretched button, checkbox `z-10`,
  `[data-ticket-row]` dan navigasi ↑/↓ dipertahankan.
- **Mapping chip referensi → data**:
  | Referensi | Data |
  |---|---|
  | `NW-214` | `#{id}` + nama customer + waktu relatif (search `#id` tetap jalan) |
  | Judul | `preview` (1 baris, truncate) |
  | Bar priority | `priority` → ikon bar 1–4 + label sr-only |
  | `⏱ 2d` / `△ M` | badge state: Out SLA `slaOverdue` (warna destructive), Pending, Unreplied, Replied |
  | `● Website` | `ChannelIcon` + `account` |
  | `● Feature` | `category` (jika ada) |
  | `Created Oct 2` | `createdAt` diformat "Created Sep 24" (pakai helper di `_parts/time.ts` bila ada) |
  | Avatar kanan atas | `Avatar` initials assignee (tooltip nama) |
- **Hover overlay**: tombol ⋯ diposisikan `absolute top-2 right-2` di atas avatar, `opacity-0` →
  `group-hover:opacity-100 group-focus-within:opacity-100`, tetap tampil saat menu terbuka (`data-[state=open]`), dan selalu
  tampil di `pointer: coarse` (tidak ada hover di layar sentuh). Bukan `display:none`, agar tetap bisa di-Tab.

## Dependency graph
```
public/…/sociomile-mark.svg ─► AppShell brand (semua block)          (Task 1)
_data/channels.ts + tickets.ts account ─────────────► chip account     (Task 2)
TicketRow card markup + ticket-list container ───────► hover menu       (Task 3 ─► Task 4)
```
Task 1, 2, 3 independen; Task 4 bergantung pada Task 3.

## Task List
Lihat `tasks/ticket-list-todo.md`.

### Phase 1: Branding & data
- [x] Task 1: Logo Sociomile + subtitle "Omnichannel" di navbar semua block
- [x] Task 2: Akun social media resmi Sociomile di data channel & ticket

### Phase 2: Ticket card
- [x] Task 3: Ticket list jadi card sesuai struktur referensi
- [x] Task 4: Overlay menu ⋯ saat hover/focus di pojok kanan atas card

### Checkpoint: Complete
- [ ] `npm run lint`, `npm run check:blocks`, `npm run build` bersih
- [ ] Cek visual 4 tema + mobile, review dengan user

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Handle social media Sociomile yang ditulis ternyata salah/tidak ada | Med | Verifikasi tiap handle di web sebelum dipakai; yang tidak terverifikasi ditanyakan ke user |
| Card lebih tinggi → lebih sedikit ticket terlihat di panel list | Med | Padding rapat (referensi), judul 1 baris; cek di viewport 1280×800 |
| Menu ⋯ tak terjangkau di touch/keyboard | High | `focus-within`, `pointer: coarse` selalu tampil, uji Tab + Enter |
| Logo ungu/biru kontras rendah di tema `nightshift` | Low | Mark berwarna di atas navbar `bg-card`; cek visual, beri tile `bg-white` jika perlu |

## Open Questions
1. ~~Cakupan subtitle & logo~~ → **semua block** (dijawab user).
2. **Akun real Sociomile** — usulan, akan diverifikasi saat build: Facebook "Sociomile", Instagram `@sociomile`,
   X `@sociomile`, email `support@sociomile.com`, Google Business "Sociomile (Ivosights)". Ada handle resmi lain
   (Telegram/WhatsApp) yang ingin dipakai?
3. **Format ID**: tetap `#380` (asumsi) atau prefix seperti `SM-380` mengikuti referensi `NW-214`?
4. **Avatar kanan atas**: assignee (asumsi, sesuai referensi) atau customer?
