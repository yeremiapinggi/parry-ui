# Todo: Contact detail popup (contacts-01)

Plan: `tasks/contact-detail-plan.md`. Commit after each task. Paths are relative to the repo root.

## Task 1: Nama bisa diklik → Dialog dengan informasi kontak
**Description:** `ContactRow` menyimpan `tickets: Ticket[]` milik customer (hitungan jadi `ticketCount`). Sel Name jadi
`<button>` bergaya link yang membuka satu `Dialog` di level halaman. Dialog (`contact-detail.tsx`) menampilkan avatar, nama,
identitas per channel (ChannelIcon + handle), email, phone, tags, dan ringkasan: jumlah ticket, first contact, last contact.

**Acceptance criteria:**
- [ ] Klik atau Enter/Space pada nama membuka dialog untuk contact tersebut; Esc/tombol tutup menutup dan fokus kembali ke nama
- [ ] Dialog punya `DialogTitle` (nama) dan `DialogDescription`; semua field kosong tampil "—" atau disembunyikan, bukan kosong
- [ ] Pencarian, sortir Name dan pagination tabel tetap berfungsi

**Verification:**
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run check:blocks`
- [ ] Manual (browser): buka dialog Yeremia (2 identitas, tags) dan Siti (1 identitas, tanpa email/phone); Tab/Esc

**Dependencies:** None
**Files:** `components/blocks/contacts-01/components/contacts.tsx`, `components/blocks/contacts-01/components/contact-detail.tsx` (baru)
**Scope:** S

## Checkpoint A
- [ ] Checks bersih, dialog jalan di desktop & 375px

## Task 2: Customer journey timeline
**Description:** Di dialog, bagian "Customer journey" berupa `Timeline` terbaru dulu, dikelompokkan per ticket: ticket aktif
(dibuat via channel, event `system`/`escalation` dari thread, status saat ini) lalu ticket lama dari `history` (subject, status,
tanggal), dedupe per id. Bagian ini scroll sendiri.

**Acceptance criteria:**
- [ ] Setiap event menampilkan ikon (channel / eskalasi / status), judul, dan waktu (`shortDateTime`, relatif di `title`)
- [ ] Urutan kronologis benar (terbaru di atas) lintas ticket aktif dan history; tidak ada ticket dobel
- [ ] Customer tanpa history tetap punya journey (ticket aktif) + teks "No earlier interactions"

**Verification:**
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run check:blocks`
- [ ] Manual: Yeremia (history 2 ticket) urutannya benar; Rina (eskalasi) menampilkan event eskalasi; 4 tema; 375px

**Dependencies:** Task 1
**Files:** `components/blocks/contacts-01/components/contact-detail.tsx`
**Scope:** S

## Checkpoint: Complete
- [ ] Semua acceptance criteria terpenuhi
- [ ] Screenshot dialog (desktop + mobile) dibagikan
- [ ] Review dengan user
