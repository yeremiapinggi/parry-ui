# Implementation Plan: Contact detail popup (contacts-01)

## Overview
Di `/blocks/contacts-01`, nama contact di tabel bisa diklik dan membuka **popup (Dialog)** detail contact berisi:
1. **Informasi kontak**: avatar, nama, identitas per channel, email, phone, tags, ringkasan (jumlah ticket, pertama/terakhir kontak).
2. **Customer journey**: timeline semua interaksi customer di semua channel, dari ticket lama (history) sampai ticket aktif
   beserta event pentingnya (dibuat, eskalasi, ditutup).

## Kondisi sekarang (dibaca dari kode)
- `components/blocks/contacts-01/components/contacts.tsx` — `contacts` di-derive dari `tickets` (satu baris per customer),
  kolom Name hanya teks + avatar. `ContactRow` = `Contact` + name/initials/tickets/lastTicket/lastAt; **ticket asli tidak disimpan**.
- `_data/tickets.ts` — per ticket: `contact` (identities, email, phone, tags), `history: HistoryItem[]` (id, subject, status, at),
  `thread: ThreadItem[]` (system/escalation/in/out/note dengan `at`), `channel`, `createdAt`, `status`, `assignee`, `sentiment`.
  Cukup untuk journey — **tidak perlu data baru**.
- UI kit yang dipakai: `components/ui/dialog.tsx`, `components/ui/timeline.tsx` (`Timeline`/`TimelineItem` dengan icon + time),
  `Avatar`, `Badge`, `ChannelIcon`, `ScrollArea`.
- Pola serupa sudah ada di `ticket-inbox-01/components/ticket-sidebar.tsx`: `ContactInfo` (editable, privat) dan
  "Customer history" + "Activity log" (Timeline). `statusMeta` (label + dot warna status) ada di `ticket-inbox-01/components/ticket-meta.ts`.
- Helper waktu di `_parts/time.ts`: `shortDateTime`, `monthDay`, `relativeTime`, `byTime`.

## Architecture Decisions
- **Dialog, bukan Sheet** — sesuai permintaan "popup". `max-w-2xl`, dua bagian: info (kiri/atas) + journey (kanan/bawah,
  scroll sendiri). Di mobile jadi satu kolom.
- **Satu `Dialog` di level halaman**, state `openName: string | null`; sel Name jadi `<button>` (bukan link) yang set state.
  Tidak membuat satu Dialog per baris.
- **Komponen baru `contact-detail.tsx`** di `contacts-01/components/` — isinya cukup besar untuk dipisah dari definisi tabel.
- **`ContactRow` ikut menyimpan `tickets: Ticket[]`** milik customer (ubah nama field hitungan jadi `ticketCount`), sehingga
  dialog tidak perlu mencari ulang.
- **Info kontak read-only** — tidak mengekstrak `ContactInfo` dari sidebar (editable, terikat state ticket). Pola tampilan
  (ikon channel + handle) ditiru, bukan di-share.
- **Journey = daftar event yang di-derive**, diurutkan terbaru dulu, dikelompokkan per ticket:
  | Sumber | Event |
  |---|---|
  | `history[]` | "#318 Jadwal servis berkala…" + status (Closed) + tanggal |
  | ticket aktif `createdAt` | "Ticket #380 dibuat via Webchat" + ChannelIcon |
  | `thread` `system` / `escalation` | "Escalated to Warranty Team by …", "Ticket closed", dst. |
  | ticket aktif `status` | badge status saat ini pada event ticket |
  History bisa dobel antar ticket milik customer yang sama → dedupe per `id`.
- **`statusMeta` di-import dari `ticket-inbox-01/components/ticket-meta.ts`** (diizinkan `check:blocks`). Pindah ke `_parts/`
  hanya kalau ada block ketiga yang butuh.

## Dependency graph
```
ContactRow menyimpan tickets ──► Dialog + info kontak (Task 1) ──► Customer journey timeline (Task 2)
```

## Task List
Lihat `tasks/contact-detail-todo.md`.

### Phase 1: Popup
- [ ] Task 1: Nama bisa diklik → Dialog dengan informasi kontak

### Checkpoint A
- [ ] Dialog buka/tutup, keyboard & fokus benar; checks bersih

### Phase 2: Journey
- [ ] Task 2: Customer journey timeline di Dialog

### Checkpoint: Complete
- [ ] Semua acceptance criteria terpenuhi, cek 4 tema + mobile, review dengan user

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Journey kosong/pendek untuk customer tanpa history (mis. Siti) | Low | Selalu ada minimal event "ticket dibuat" + pesan pertama; teks "No earlier interactions" |
| Tombol nama di dalam sel mengganggu sortir/pencarian DataTable | Low | `accessorKey: "name"` tetap; hanya `cell` yang berubah |
| Dialog terlalu tinggi di layar pendek | Med | Journey di `ScrollArea` dengan `max-h`, header dialog tetap |
| Teks event campur bahasa (data Indonesia, UI Inggris) | Low | Ikuti UI yang ada: label event Inggris, isi subject apa adanya |

## Open Questions
1. Apakah item journey perlu tombol **"Open ticket"** ke inbox? Inbox belum bisa dibuka ke ticket tertentu via URL, jadi default: tidak ada link.
2. Perlu tombol aksi di dialog (mis. "New ticket", "Edit contact")? Default: tidak, hanya tombol tutup.
