# Todo: Parry UI

## Task 1: Scaffold Next.js + Tailwind v4 + shadcn init
**Description:** Buat app Next.js (App Router, TypeScript, Tailwind v4) di root repo lalu `shadcn init` dengan CSS variables.

**Acceptance criteria:**
- [x] `components.json` ada, `cssVariables: true`, alias `@/components`, `@/lib/utils`
- [x] `app/globals.css` berisi token default shadcn (`:root`, `.dark`, `@theme inline`)

**Verification:**
- [x] `npm run build` sukses
- [x] `npm run dev` → halaman root terbuka tanpa error console

**Dependencies:** None
**Files likely touched:** `package.json`, `components.json`, `app/globals.css`, `app/layout.tsx`, `lib/utils.ts`
**Estimated scope:** S

---

## Task 2: Tuning token warna, font, dark mode (dibuktikan lewat Button)
**Description:** Ganti nilai token di `globals.css` dengan palet Parry (primary, secondary, accent, destructive, muted,
border, ring, chart-1..5, sidebar-*, plus success/warning/info + *-soft) untuk light & dark; pasang Plus Jakarta Sans + JetBrains Mono via
`@fontsource-variable/*` dan set `--font-sans`/`--font-mono`; tambah `next-themes` + toggle. `shadcn add button`
dan tampilkan semua variant Button + swatch token di halaman showcase.

**Acceptance criteria:**
- [x] Semua variant Button (default, secondary, outline, ghost, link, destructive) tampil dengan warna Parry di light & dark
- [x] Font teks UI = Plus Jakarta Sans, kode = JetBrains Mono (cek computed style)
- [x] Pasangan foreground/background utama lolos WCAG AA (≥4.5:1) di kedua mode

**Verification:**
- [x] `npm run build` sukses
- [x] `npm run check:contrast` lolos
- [x] Manual: toggle dark mode di showcase

**Dependencies:** Task 1
**Files likely touched:** `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `components/theme-toggle.tsx`, `components/ui/button.tsx`
**Estimated scope:** M

---

## Checkpoint: Foundation
- [x] Build bersih
- [ ] Review warna & font bersama user sebelum lanjut

---

## Task 3: Registry `parry-theme` + `button`
**Description:** Buat `registry.json` berisi item `parry-theme` (type `registry:theme`/`registry:style`: cssVars light/dark,
font vars, dependency fontsource) dan `button` (type `registry:ui`, `registryDependencies: ["parry-theme"]` bila didukung).
Script `registry:build` → `shadcn build` ke `public/r/`.

**Acceptance criteria:**
- [x] `public/r/parry-theme.json` dan `public/r/button.json` ter-generate dari `npm run registry:build`
- [x] `http://localhost:3000/r/button.json` dapat diakses saat `npm run dev`
- [x] Nilai token di `parry-theme` sama persis dengan `globals.css` (di-generate dari `globals.css` oleh `scripts/sync-theme.mjs`)

**Verification:**
- [x] `npm run registry:build && npm run build` sukses
- [x] `curl localhost:3001/r/parry-theme.json` → 39 token light, 38 dark

**Dependencies:** Task 2
**Files likely touched:** `registry.json`, `package.json`, `public/r/*` (generated)
**Estimated scope:** S

---

## Task 4: Install ke app Next.js kosong
**Description:** Di folder scratch (di luar repo), `create-next-app` + `shadcn init`, lalu
`npx shadcn add http://localhost:3000/r/parry-theme.json http://localhost:3000/r/button.json`.

**Acceptance criteria:**
- [x] Button di app konsumen tampil identik dengan showcase (warna, font, radius) di light & dark
- [x] Tidak ada langkah manual selain yang tertulis di README (catat bila ada)

**Verification:**
- [x] `npm run build` app konsumen sukses; screenshot dibandingkan dengan showcase

**Hasil (2026-10-23):** 27 properti terhitung (font, latar, 11 swatch, semua tombol) identik dengan showcase di light & dark.
Font, token semantic, dan mapping `@theme` ikut terpasang otomatis. Langkah manual untuk README:
- Hapus import Geist `next/font` dari `app/layout.tsx` app konsumen (tidak dipakai lagi, hanya beban download).
- Dark mode: konsumen memasang toggle class `.dark` sendiri (mis. `next-themes`).
- `button` di-skip saat `add` karena identik dengan output `shadcn init` radix-nova (memang tidak di-fork).

**Dependencies:** Task 3
**Files likely touched:** tidak ada di repo (kecuali perbaikan `registry.json` bila gagal)
**Estimated scope:** XS

---

## Task 5: Install ke app Vite kosong
**Description:** Sama dengan Task 4 tetapi `create vite` (react-ts) + Tailwind v4 + `shadcn init`. Membuktikan registry portable.

**Acceptance criteria:**
- [x] Button tampil identik dengan showcase di light & dark (toggle class `.dark` manual)
- [x] Font termuat tanpa `next/font`

**Verification:**
- [x] `npm run build` app Vite sukses; screenshot dibandingkan dengan showcase

**Hasil (2026-10-23):** scaffold via `npx shadcn init -t vite -b radix -p nova` (Vite 8 + Tailwind v4). Setelah `add parry-theme`,
27 properti terhitung identik dengan showcase & app Next di light & dark; font termuat lewat fontsource. Langkah manual untuk README:
- Hapus `@import "@fontsource-variable/geist"` dan paketnya (sisa template Vite, tidak dipakai lagi).
- Template Vite sudah membawa `components/theme-provider.tsx` untuk toggle `.dark`.

**Dependencies:** Task 3
**Files likely touched:** tidak ada di repo (kecuali perbaikan `registry.json` bila gagal)
**Estimated scope:** XS

---

## Checkpoint: Registry
- [x] Next.js & Vite konsumen tampil identik dengan showcase
- [ ] Review dengan user

---

## Task 6: Komponen form
**Description:** `shadcn add` input, label, textarea, select, checkbox, switch; daftarkan di `registry.json`; tambah seksi showcase (state default, focus, disabled, invalid).

**Acceptance criteria:**
- [x] Ke-6 item ter-build di `public/r/`
- [x] Focus ring memakai `--ring` Parry dan terlihat jelas di light & dark
- [x] State `aria-invalid` memakai warna destructive

**Verification:**
- [x] `npm run registry:build && npm run build` sukses
- [x] Manual: navigasi keyboard (Tab) di seksi form, cek ring & kontras

**Temuan (2026-10-23):** border `--input` (#D0D7E2 light / #313A46 dark) hanya 1.25–1.5:1 terhadap latar, di bawah 3:1
(WCAG 1.4.11). Paling berdampak pada Checkbox unchecked dan track Switch off, yang bentuknya hanya ditandai border. Menunggu keputusan user.

**Dependencies:** Task 3
**Files likely touched:** `components/ui/*.tsx` (generated), `registry.json`, `app/page.tsx`
**Estimated scope:** M

---

## Task 7: Komponen feedback & overlay
**Description:** alert, badge, dialog, dropdown-menu, tooltip, sonner; registry + seksi showcase.

**Acceptance criteria:**
- [ ] Ke-6 item ter-build di `public/r/`
- [ ] Overlay (dialog/dropdown/tooltip) memakai `--popover`/`--popover-foreground` dan terbaca di dark mode
- [ ] Dialog bisa ditutup dengan Esc dan fokus kembali ke trigger

**Verification:**
- [ ] `npm run registry:build && npm run build` sukses
- [ ] Manual: buka tiap overlay di light & dark

**Dependencies:** Task 3
**Files likely touched:** `components/ui/*.tsx` (generated), `registry.json`, `app/page.tsx`, `app/layout.tsx` (Toaster)
**Estimated scope:** M

---

## Task 8: Komponen layout & data
**Description:** card, tabs, table, separator, avatar, skeleton; registry + seksi showcase.

**Acceptance criteria:**
- [ ] Ke-6 item ter-build di `public/r/`
- [ ] Card & table memakai `--card`/`--border`/`--muted` Parry dan konsisten di dark mode

**Verification:**
- [ ] `npm run registry:build && npm run build` sukses
- [ ] Manual: cek showcase di lebar 375px dan desktop

**Dependencies:** Task 3
**Files likely touched:** `components/ui/*.tsx` (generated), `registry.json`, `app/page.tsx`
**Estimated scope:** M

---

## Checkpoint: Komponen
- [ ] Semua item ada di `public/r/`, showcase lengkap
- [ ] `npm run check:contrast` lolos
- [ ] Review dengan user

---

## Task 9: README konsumsi
**Description:** Dokumentasikan cara pakai di Next.js dan Vite (init, add theme, add komponen, dark mode toggle, font), cara menambah item baru ke registry, dan cara mengubah token.

**Acceptance criteria:**
- [ ] Mengikuti README dari nol menghasilkan app yang sama dengan Task 4/5
- [ ] Langkah manual yang tercatat di Task 4/5 terdokumentasi

**Verification:**
- [ ] Manual: ulangi Task 5 hanya berbekal README

**Dependencies:** Task 4, 5, 6–8
**Files likely touched:** `README.md`
**Estimated scope:** XS

---

## Task 10: Landing page
**Description:** Landing page di `/` dengan pola tata letak astryx.atmeta.com (hanya pola; tanpa aset, logo, atau
wordmark Meta): navbar (logo, Docs/Components/Themes, search, toggle tema, GitHub, "Get started"), hero dengan
wordmark "Parry" besar berwarna primary, tagline 2 baris, dua CTA, baris keterangan kecil, dan kartu melayang di kiri/kanan
yang dirakit dari komponen Parry asli (stat card, input chat, progress, badge, potongan sidebar). Latar gradasi
Snow → Accent Soft. Showcase saat ini pindah ke `/components`.

**Acceptance criteria:**
- [ ] Kartu demo memakai komponen dari `components/ui`, bukan markup tiruan
- [ ] Light & dark rapi; di 375px kartu melayang disembunyikan/ditumpuk tanpa scroll horizontal
- [ ] `npm run check:contrast` lolos; semua CTA dan link bisa diakses keyboard

**Verification:**
- [ ] `npm run build` sukses
- [ ] Manual: screenshot desktop & 375px di light dan dark

**Dependencies:** Task 6, 7, 8
**Files likely touched:** `app/page.tsx`, `app/components/page.tsx`, `components/landing/*.tsx`
**Estimated scope:** M

---

## Checkpoint: Complete
- [ ] Semua acceptance criteria terpenuhi
- [ ] Siap review
