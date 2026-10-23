# Parry UI

Design system Ivosights berbasis [shadcn/ui](https://ui.shadcn.com) (primitive Radix, style `radix-nova`) dengan palet
**Midnight + Frost Blue**, font **Plus Jakarta Sans** dan **JetBrains Mono**, serta mode terang/gelap.

Parry UI adalah **shadcn registry**: komponen disalin ke project Anda lewat `shadcn` CLI, bukan di-install sebagai paket npm.
Registry yang sama bisa dipakai di **Next.js** dan **Vite**.

> `REGISTRY_URL` di bawah adalah alamat tempat repo ini di-deploy. Untuk mencoba lokal, jalankan `npm run dev` di repo ini
> dan pakai `http://localhost:3001` (port mengikuti output `next dev`).

## Memakai Parry UI di project Anda

### 1. Siapkan project dengan shadcn (Radix)

Project baru:

```bash
npx shadcn@latest init -t next -b radix -p nova
```

Ganti `-t next` dengan `-t vite` untuk Vite. Untuk project yang sudah ada, jalankan `npx shadcn@latest init -b radix -p nova` di root project.

### 2. Daftarkan registry Parry

Tambahkan ke `components.json`:

```json
{
  "registries": {
    "@parry": "REGISTRY_URL/r/{name}.json"
  }
}
```

### 3. Pasang theme, lalu komponen

```bash
npx shadcn@latest add @parry/parry-theme
```

```bash
npx shadcn@latest add @parry/button @parry/input @parry/card
```

`parry-theme` menulis token warna, font, dan radius ke file CSS global Anda, serta memasang paket font
`@fontsource-variable/*`. Pasang theme **sekali** sebelum komponen.

### 4. Rapikan sisa template

- **Next.js:** hapus import `Geist`/`Geist_Mono` dari `next/font/google` di `app/layout.tsx` beserta class variabelnya.
  Font sekarang datang dari theme.
- **Vite:** hapus `@import "@fontsource-variable/geist";` di `src/index.css` dan jalankan `npm uninstall @fontsource-variable/geist`.

### 5. Provider di root layout

Dark mode memakai class `.dark` di `<html>`.

- **Next.js:** pakai `next-themes`, mis. `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`, dan tambahkan
  `suppressHydrationWarning` di `<html>`.
- **Vite:** template `shadcn init -t vite` sudah membawa `components/theme-provider.tsx`.

Jika memakai `tooltip` atau `sonner`, bungkus app dengan `<TooltipProvider>` dan render `<Toaster />` satu kali. `sonner` membaca
tema dari `next-themes`.

## Isi registry

| Item | Isi |
|------|-----|
| `parry-theme` | Token light/dark, font, radius |
| Form | `button`, `input`, `label`, `textarea`, `select`, `checkbox`, `switch` |
| Feedback & overlay | `alert`, `badge`, `dialog`, `dropdown-menu`, `tooltip`, `sonner` |
| Layout & data | `card`, `tabs`, `table`, `separator`, `avatar`, `skeleton` |

Selain token bawaan shadcn, theme menambahkan warna semantic `success`, `warning`, `info` dan pasangan `*-soft`-nya
(juga `destructive-soft`). Alert dan Badge tidak punya variant khusus untuk ini; pakai utility token:

```tsx
<Alert className="border-success/30 bg-success-soft text-success">…</Alert>
<Badge className="border-warning/30 bg-warning-soft text-warning">warning</Badge>
```

## Mengembangkan repo ini

```bash
npm install
npm run dev            # situs (/, /docs, /components, /themes) di http://localhost:3001 atau port yang ditampilkan
```

| Perintah | Fungsi |
|----------|--------|
| `npm run registry:build` | Salin token dari `app/globals.css` ke `registry.json`, lalu build `public/r/*.json` |
| `npm run check:contrast` | Cek kontras WCAG AA semua pasangan token light/dark; gagal (exit 1) jika ada yang di bawah batas |
| `npm run build` / `npm run lint` | Build dan lint app showcase |

**Mengubah warna:** edit `:root` / `.dark` di `app/globals.css` (format hex), jalankan `npm run check:contrast`, lalu
`npm run registry:build`. Jangan edit bagian `parry-theme` di `registry.json` secara manual; isinya ditimpa script.

**Menambah komponen:** `npx shadcn@latest add <nama>` di repo ini, daftarkan sebagai item `registry:ui` di `registry.json`
(isi `dependencies` sesuai import file), tambahkan preview-nya di `app/components/page.tsx`, lalu `npm run registry:build`. Komponen sengaja
tidak dimodifikasi dari output shadcn agar update upstream mudah di-diff.

**Catatan dev server:** jangan jalankan `npm run build` saat `npm run dev` hidup, karena keduanya memakai folder `.next`.
Jika tampilan terlihat basi, hentikan dev server, hapus `.next`, lalu jalankan lagi.
