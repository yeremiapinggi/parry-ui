# Implementation Plan: Parry UI — design system berbasis shadcn

## Overview
Parry UI adalah **shadcn registry** dengan warna dan font yang sudah di-tuning. Konsumen memasang komponen lewat
`npx shadcn add <registry-url>/r/<item>.json`. Repo ini sekaligus menjadi app Next.js yang (1) meng-host file
registry di `public/r/` dan (2) menyediakan halaman showcase untuk mengecek token & komponen secara visual,
light + dark.

## Architecture Decisions
- **Next.js (App Router) + Tailwind v4 + shadcn CLI terbaru.** Default resmi shadcn; satu app untuk showcase + host registry.
- **Primitive: Radix** (style `radix-nova`), dipilih karena ekosistem pihak ketiga paling luas.
- **Komponen tidak di-fork, hanya di-theme.** Tuning dilakukan lewat CSS variables (`:root` / `.dark`) dan `@theme inline`.
  Source komponen tetap output `shadcn add` agar update dari upstream gampang di-diff.
- **Token di CSS murni, bukan JS.** Warna dalam hex, mengikuti referensi brand 1:1 agar mudah ditelusuri. Ini yang membuat registry bisa dipakai
  di Next.js **dan** Vite tanpa perubahan.
- **Font dimuat tanpa `next/font` di item registry.** `next/font` hanya jalan di Next; item `parry-theme` memakai paket
  `@fontsource-variable/*` + `--font-sans`/`--font-mono`, sehingga portable ke Vite. Showcase Next boleh tetap pakai cara yang sama.
- **Dark mode via class `.dark`** (`next-themes` di showcase). Konsumen Vite memakai toggle class sendiri.
- **Palet: "Midnight System + Frost Blue Accent"** (referensi dari user, 2026-10-23):
  - Light: background Snow `#F7F8FA`, card putih, sidebar Midnight `#171C24` (tetap gelap). Dark: background Midnight, card Graphite `#232A35`.
  - Hex brand dipakai apa adanya bila lolos AA. Yang gagal diganti shade lebih gelap untuk teks: primary `#3366E0` (Frost Blue `#5B8DEF` + teks putih 3.2:1),
    muted-foreground `#475569` (Text Muted `#94A3B8` 2.6:1), destructive `#C81E1E`, success/warning versi -700. Frost Blue jadi `--ring` dan primary di dark.
  - Token tambahan di luar shadcn: `success`, `warning`, `info` + `*-soft`, dan `destructive-soft`.
  - Sans: **Plus Jakarta Sans**. Mono: **JetBrains Mono**. Radius: `0.5rem`.
  - Kontras dicek otomatis: `npm run check:contrast` (`scripts/check-contrast.mjs`, exit 1 bila ada pasangan < AA).

### Soal Next.js ↔ Vite
Ya, bisa dua-duanya. Item registry shadcn berisi file React + Tailwind biasa; CLI memasangnya ke project Next.js maupun
Vite. Perbedaannya kecil: direktif `"use client"` (diabaikan Vite) dan cara load font (sudah diatasi keputusan di atas).
Task 5 membuktikan ini dengan memasang registry ke app Vite kosong. Membuat app showcase versi Vite terpisah **tidak**
diperlukan dan tidak masuk plan.

## Dependency graph
```
Task 1 scaffold (Next + Tailwind v4 + shadcn init)
   └── Task 2 token warna + font + dark mode (+ Button di showcase)
          └── Task 3 registry: item parry-theme + button, build ke public/r
                 ├── Task 4 verifikasi install ke app Next.js kosong
                 ├── Task 5 verifikasi install ke app Vite kosong
                 └── Task 6–8 batch komponen (independen satu sama lain)
                        ├── Task 9 README konsumsi
                        └── Task 10 landing page (hero + kartu demo komponen asli)
```

## Task List
Detail tiap task (acceptance criteria, verifikasi, file) ada di `tasks/todo.md`.

### Phase 1: Foundation
- [x] Task 1: Scaffold Next.js + Tailwind v4 + shadcn init
- [x] Task 2: Tuning token warna, font, dark mode — dibuktikan lewat Button di showcase

### Checkpoint: Foundation
- [ ] `npm run build` bersih, showcase menampilkan Button light/dark dengan font & warna baru
- [ ] Review warna & font dengan Anda sebelum lanjut (paling murah diganti di titik ini)

### Phase 2: Registry & portabilitas
- [x] Task 3: Registry `parry-theme` + `button`, `shadcn build` ke `public/r`
- [x] Task 4: Install dari registry ke app Next.js kosong
- [ ] Task 5: Install dari registry ke app Vite kosong

### Checkpoint: Registry
- [ ] Kedua app konsumen tampil identik dengan showcase (warna, font, dark mode)

### Phase 3: Komponen
- [ ] Task 6: Form — input, label, textarea, select, checkbox, switch
- [ ] Task 7: Feedback & overlay — alert, badge, dialog, dropdown-menu, tooltip, sonner
- [ ] Task 8: Layout & data — card, tabs, table, separator, avatar, skeleton

### Checkpoint: Komponen
- [ ] Semua item ada di `public/r`, showcase lengkap, `npm run check:contrast` lolos

### Phase 4: Docs & landing
- [ ] Task 9: README — cara pakai di Next.js dan Vite
- [ ] Task 10: Landing page bergaya Astryx; showcase pindah ke `/components`

### Checkpoint: Complete
- [ ] Semua acceptance criteria terpenuhi, siap review

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Field `css` (`@import` fontsource) + `dependencies` di `parry-theme` tidak dipasang benar oleh CLI. Tipe `registry:font` bawaan hanya mendukung Google Fonts via `next/font` | Med | Dibuktikan di Task 4/5; fallback: README instruksi 1 baris `@import` font |
| Primary baru gagal kontras AA (teks putih di atas primary, ring, muted-foreground) | Med | `npm run check:contrast` di setiap checkpoint |
| Upstream shadcn berubah format (mis. versi Tailwind/CLI) | Low | Pin versi CLI di script; komponen tidak di-fork jadi re-add mudah |
| Hosting registry belum ditentukan → URL konsumen belum final | Low | Task 4–5 pakai `localhost`; hosting jadi keputusan terpisah |

## Open Questions
- Warna & font usulan di atas oke, atau ada brand guideline Ivosights yang harus diikuti?
- Registry akan di-host di mana (Vercel, internal)? Publik atau private (perlu auth header)?
- Package manager: npm (pnpm tidak terpasang di mesin dev).
- Landing page (Task 10): pakai wordmark teks Plus Jakarta Sans ExtraBold, atau ada SVG logo Ivosights/Parry?
- Daftar komponen di Task 6–8 adalah usulan; tambah/kurangi sesuai kebutuhan produk.
