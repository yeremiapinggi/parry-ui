# Implementation Plan: Melengkapi komponen Parry UI dari checklist shadcnblocks

## Overview
Checklist Drive `shadcnblocks-ui-kit-checklist`
(https://docs.google.com/spreadsheets/d/1ano3GeCUhivILYEqslq18YomvVztugmqX5dfCmMHIUw) berisi 111 komponen / 2.197 varian
dari shadcnblocks.com. Repo ini sudah punya 24 komponen di `components/ui/`. Plan ini menambah **87 komponen yang belum
ada**, masing-masing sebagai primitive + item registry + preview di `/components`, lalu meng-update kolom Status di sheet
**Detail Varian** (sheet Ringkasan menghitung progress otomatis dari sana).

## Inventaris awal (2026-10-29)
**Sudah ada (24):** alert, avatar, badge, button, card, chart, checkbox, dialog, dropdown-menu, input, label, popover,
radio-group, select, separator, skeleton, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip.
Lima di antaranya (chart, popover, radio-group, toggle, toggle-group) belum jadi item `registry.json`.
`theme-mode-picker.tsx` sudah ada tapi belum berbentuk komponen Theme Toggle / Theme Switcher.

**Belum ada (87):** lihat pembagian per task di `tasks/ui-kit-todo.md`.

## Architecture Decisions
- **Ikuti pola yang sudah ada.** Komponen di `components/ui/<name>.tsx`, didaftarkan di `registry.json`, dibangun ke
  `public/r/` lewat `npm run registry:build`, ditampilkan di `app/components/page.tsx` (preview besar di
  `components/component-catalog-previews.tsx`). Anchor id = nama registry.
- **Pakai `npx shadcn add` bila komponennya ada di shadcn resmi** (accordion, alert-dialog, aspect-ratio, breadcrumb,
  button-group, calendar, carousel, collapsible, command, context-menu, drawer, empty, field, form, hover-card,
  input-group, input-otp, item, kbd, menubar, navigation-menu, pagination, progress, resizable, scroll-area, sheet,
  slider, spinner). Sisanya ditulis sendiri di atas primitive yang ada, dengan token Parry (bukan warna hardcode).
- **Satu definisi "Selesai"** (Definition of Done per komponen, berlaku untuk semua task):
  1. File di `components/ui/`, hanya token tema (lolos `npm run check:contrast` bila menambah pasangan warna).
  2. Item di `registry.json`, `npm run registry:build` menghasilkan `public/r/<name>.json`.
  3. Preview di `/components` menampilkan varian utama (variant/size/state dari kolom Anatomi), light + dark, 375px tanpa scroll horizontal.
  4. `npm run lint` dan `npm run build` bersih.
  5. Sheet Detail Varian di-update sesuai aturan granularitas (lihat Open Questions #1).
- **Dependency baru hanya bila primitive butuh** (mis. `cmdk`, `vaul`, `react-day-picker`, `embla-carousel-react`,
  `react-resizable-panels`, `input-otp`, `react-hook-form` + `zod`, `@tanstack/react-table`). Komponen berat
  (Editor, Gantt, Kanban, Video Player, Sandbox, Emoji Picker, Image Crop) dikumpulkan di akhir dan bisa dipotong.
- **Update sheet lewat connector Google Drive/Sheets**, bukan script dengan kredensial di repo. Satu batch update per task.

## Dependency graph
```
T0 spike tulis ke sheet + putuskan granularitas
 └── T1 backfill: 5 item registry yang hilang + tandai 24 komponen lama di sheet
      ├── Phase 1 Foundations (T2–T3)
      ├── Phase 2 Actions (T4 → T5; T5 butuh button-group/spinner dari T4)
      ├── Phase 3 Form & Input (T6 field/form dulu → T7–T11)
      │      └── T9 command → combobox/autocomplete
      ├── Phase 4 Feedback (T12)
      ├── Phase 5 Overlay (T13 → T14)
      ├── Phase 6 Navigation (T15–T16)
      ├── Phase 7 Data Display (T17–T21; T19 butuh T9 command + T13 sheet)
      ├── Phase 8 Layout (T22)
      └── Phase 9 Media/Dev (T23–T25)
```
Phase 1–9 mengikuti "Urutan kerja saran" di sheet Panduan. Selain panah di atas, phase saling independen dan bisa
dikerjakan paralel (beda file), asal `registry.json` dan `app/components/page.tsx` di-merge hati-hati.

## Task List
Detail (komponen, acceptance criteria, verifikasi, file) ada di `tasks/ui-kit-todo.md`.

- Phase 0: T0–T1 — **Checkpoint 0**: user setuju aturan granularitas sheet
- Phase 1–2: T2–T5 — **Checkpoint A**
- Phase 3: T6–T11 — **Checkpoint B**
- Phase 4–6: T12–T16 — **Checkpoint C**
- Phase 7–8: T17–T22 — **Checkpoint D**
- Phase 9: T23–T25 — **Checkpoint E** (final)

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| 2.197 varian tidak realistis direplikasi 1:1 | High | Granularitas di level komponen + varian utama (Open Question #1); T0 memutuskan sebelum coding |
| Varian shadcnblocks adalah konten berbayar/berhak cipta | High | Tidak menyalin source; bangun ulang dari anatomi di sheet dan primitive shadcn resmi (MIT) |
| Menulis ke sheet merusak formula Ringkasan atau dropdown Status | Med | T0 spike di satu baris dulu, cek Ringkasan ter-update dan validasi masih ada |
| Bundle membengkak karena dependency baru | Med | Dependency hanya di primitive yang butuh; komponen berat di Phase 9 dan opsional |
| `registry.json` / `page.tsx` konflik bila task paralel | Low | Satu task = satu blok preview + entri registry; merge berurutan |
| Ikon brand (Social/Login Button, Github Stars) tidak ada di lucide | Low | SVG inline kecil per provider |

## Open Questions
1. ~~**Granularitas checklist.**~~ **Diputuskan 2026-10-29: opsi rekomendasi.** Rekomendasi: saat komponen memenuhi Definition of Done, varian yang tercakup props/preview
   ditandai **Selesai**, sisanya **Review** dengan Catatan "primitive @parry/<name> tersedia; varian belum dibuat 1:1".
   Alternatif: tandai semua varian komponen itu Selesai, atau hanya varian yang benar-benar dibuat.
2. **Kolom PIC** diisi apa? Usulan: `Claude` + kolom Catatan berisi path file.
3. **Komponen berat Phase 9** (Editor, Sandbox, Video Player, Emoji Picker, Gantt, Kanban, Image Crop): tetap dikerjakan,
   atau tandai "Di luar cakupan" di Catatan?
4. Plan lama `tasks/plan.md` / `tasks/todo.md` masih punya checkpoint review terbuka; plan ini disimpan terpisah
   (`ui-kit-plan.md` / `ui-kit-todo.md`) mengikuti pola `auth-*` dan `developer-portal-*`.
