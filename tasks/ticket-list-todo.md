# Todo: Ticket Inbox 01 — card ticket list, Sociomile branding, real accounts

Plan: `tasks/ticket-list-plan.md`. Commit after each task. Paths are relative to the repo root.

## Task 1: Logo Sociomile + subtitle "Omnichannel" di navbar semua block
**Description:** Salin `Frame 2.svg` ke `public/images/blocks/sociomile-mark.svg`. Di `AppShell`, ganti tile
`MessagesSquareIcon` dengan `<img src="/images/blocks/sociomile-mark.svg" alt="">` dan teks "Omnichannel Inbox" → "Omnichannel".

**Acceptance criteria:**
- [ ] Navbar keempat block (ticket inbox, dashboard, report, setting) menampilkan logo Sociomile (4 shape ungu/biru) di samping "Sociomile" / "Omnichannel"
- [ ] Import `MessagesSquareIcon` yang tak terpakai lagi dihapus
- [ ] Link brand tetap ke `/blocks` dengan focus ring; logo dekoratif (`alt=""`)

**Verification:**
- [ ] `npm run check:blocks` lolos (tidak ada hex di TSX)
- [ ] Manual: 4 tema (`classic`, `nightshift`, `lagoon`, `contrast`) di 4 block, logo terbaca di semuanya; gallery `/blocks` ikut menampilkan logo baru

**Dependencies:** None
**Files:** `public/images/blocks/sociomile-mark.svg`, `components/blocks/_parts/app-shell.tsx`
**Scope:** S

## Task 2: Akun social media resmi Sociomile
**Description:** Verifikasi handle resmi Sociomile per channel, lalu ganti akun "Demo Motor"/`@sociomile.demo` di `channels.ts`
dan field `account` tiap ticket di `tickets.ts` (nilai harus sama dengan akun channel-nya).

**Acceptance criteria:**
- [ ] Setiap channel yang tampil memakai akun resmi Sociomile yang terverifikasi (atau yang dikonfirmasi user)
- [ ] `ticket.account` ⊂ akun channel terkait, sehingga From picker composer tetap konsisten
- [ ] Tidak ada sisa "Demo Motor" / `demo-motor` di `components/blocks`

**Verification:**
- [ ] `grep -ri "demo.motor" components/blocks` kosong
- [ ] Manual: chip account di list, composer "From", queue rail & settings menampilkan akun baru

**Dependencies:** None (butuh jawaban Open Question 2)
**Files:** `components/blocks/_data/channels.ts`, `components/blocks/_data/tickets.ts`
**Scope:** S

## Checkpoint A: Branding & data
- [ ] lint + `check:blocks` + build bersih
- [ ] Review singkat dengan user

## Task 3: Ticket list jadi card
**Description:** Ubah markup `TicketRow` menjadi card (border, rounded, `bg-card`, jarak antar card) dengan struktur:
baris 1 `#id · customer · waktu`; baris 2 checkbox + judul (`preview`); baris chip (priority bar, state/SLA, channel+account,
category); baris "Created <tanggal>"; avatar assignee di kanan atas. Container list: latar `bg-muted`, header
"Select All  Shown N" mengikuti referensi; bulk actions tetap.

**Acceptance criteria:**
- [ ] Struktur & urutan elemen card sesuai referensi; card aktif tetap ditandai (border/ring primary)
- [ ] Klik card membuka ticket; ↑/↓ + Enter tetap jalan; checkbox & select all/bulk actions tetap jalan
- [ ] Priority & state punya label teks/sr-only (tidak hanya warna/bar)

**Verification:**
- [ ] `npm run lint`, `npm run check:blocks`, `npm run build`
- [ ] Manual: filter, sort, search `#id`, empty state, 4 tema, lebar mobile 375px tanpa scroll horizontal

**Dependencies:** None
**Files:** `components/blocks/_parts/ticket-row.tsx`, `components/blocks/ticket-inbox-01/components/ticket-list.tsx`, (opsional) `components/blocks/_parts/time.ts`
**Scope:** M

## Task 4: Overlay menu ⋯ saat hover
**Description:** Tombol more (`EllipsisIcon`) absolute di pojok kanan atas card, muncul saat hover / focus-within / menu terbuka,
selalu tampil di perangkat sentuh. Isi tetap `TicketActionMenuItems`.

**Acceptance criteria:**
- [ ] Tidak terlihat saat idle; muncul saat card di-hover, menutupi area avatar dengan latar solid
- [ ] Bisa dijangkau Tab, terbuka dengan Enter; tetap tampil selama dropdown terbuka
- [ ] Di `pointer: coarse` selalu tampil; klik ⋯ tidak ikut membuka ticket

**Verification:**
- [ ] `npm run lint`, `npm run build`
- [ ] Manual (browser preview): hover, keyboard Tab, mobile emulation

**Dependencies:** Task 3
**Files:** `components/blocks/_parts/ticket-row.tsx`
**Scope:** XS

## Checkpoint: Complete
- [ ] Semua acceptance criteria terpenuhi
- [ ] Screenshot classic + nightshift + mobile dibagikan
- [ ] Review dengan user
