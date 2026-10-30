# Audit blocks vs UI kit (2026-10-30)

Cakupan: semua file di `components/blocks/**` dibandingkan dengan `components/ui/*` dan aturan di README
(perubahan Parry: button, input, tabs, table; token `success/warning/info` + `*-soft`).
Yang sudah lolos: tidak ada warna hex/palette di luar `channel-meta.ts` (`npm run check:blocks`), import hanya dari DS.
Temuan di bawah adalah **perbedaan bentuk/ukuran/pola**, bukan warna.

Isi kolom **Keputusan** dengan salah satu: **A** = ubah block ikut DS · **B** = tambah/ubah komponen DS · **C** = biarkan (terima sebagai pengecualian).

## 1. Pola custom padahal komponen DS sudah ada

| # | Temuan | Lokasi | Komponen DS yang cocok | Opsi | Keputusan |
|---|---|---|---|---|---|
| 1 | `PresenceDot` dibuat sendiri (titik `size-2 rounded-full`) | `_parts/presence-dot.tsx` | `PillIndicator` (titik success/warning/info/error) — tidak punya warna abu untuk Offline | A: pakai `PillIndicator` · B: tambah varian `muted` ke `PillIndicator` | |
| 2 | Titik status tiket dibuat manual di 6 tempat (status menu, riwayat, contact journey, kategori di ticket row, badge "Connected") | `ticket-meta.ts`, `ticket-sidebar.tsx:238,249,621`, `contact-detail.tsx:22`, `_parts/ticket-row.tsx:98`, `settings.tsx:61` | `PillIndicator` / `Status` | A: satu komponen titik dari DS · C | |
| 3 | Chip filter aktif = `Button outline xs` dipaksa `h-7 rounded-full` + warna `bg-primary/5` | `_parts/view-toolbar.tsx:204` | `Pill` (h-7, rounded-full) + `PillButton` | A: pakai `Pill` · B: tambah varian "active/primary" ke `Pill` | |
| 4 | Tombol "Add filter" / "Reset" `size="xs"` lalu ditimpa `h-7` (= ukuran `sm`) | `_parts/view-toolbar.tsx:233,241` | `Button size="sm"` | A | |
| 5 | Tombol hapus lampiran = `Button icon-xs` ditimpa `size-5 rounded-full` | `ticket-composer.tsx:264` | `PillButton` (memang untuk aksi kecil di Pill) | A | |
| 6 | Split button Send: garis pemisah manual `border-l border-primary-foreground/30` | `ticket-composer.tsx:359` | `ButtonGroupSeparator` | A | |
| 7 | Pilihan tipe channel di dialog Add channel = `ToggleGroupItem` ditimpa `h-10` (bukan ukuran DS) | `settings.tsx:146` | `Choicebox` (pilihan berbentuk kartu) atau `ToggleGroup size="lg"` (h-9) | A: `Choicebox` · A: `size="lg"` · C | |
| 8 | Form dialog Add channel disusun manual (`div` + `Label` + `Input`, label grup = `span id`) | `settings.tsx:132-178` | `FieldGroup` / `Field` / `FieldLabel` / `FieldSet` + `FieldLegend` | A | |
| 9 | Nama kontak = `<button>` mentah dengan gaya link (`hover:text-primary`) | `contacts.tsx:39` | `Button variant="link"` (warna `--link`) | A | |
| 10 | Item notifikasi & riwayat customer = `Button ghost` dipaksa `h-auto whitespace-normal` jadi baris list | `_parts/app-shell.tsx:206`, `ticket-sidebar.tsx:611` | `Item` (asChild button) / `ListPanelItem` | A · C | |
| 11 | Kartu tiket dibuat dari `<li>` + `rounded-lg border bg-card shadow-xs` | `_parts/ticket-row.tsx:57` | `Item variant="outline"` atau `Card size="sm"` | A · C (kartu khusus inbox) | |
| 12 | Wadah daftar tiket = `div rounded-xl bg-card shadow-xs` (Report/Contacts pakai `Card`) | `ticket-list.tsx:147` | `Card` (ring, tanpa shadow) | A | |
| 13 | Catatan internal di sidebar & bubble note/eskalasi = kotak `rounded-lg border border-warning/40 bg-warning-soft` manual | `ticket-sidebar.tsx:590`, `_parts/message-bubble.tsx:57` | `Alert` + token (pola README: `border-warning/30 bg-warning-soft`) | A · C (bubble memang gap DS) | |
| 14 | Badge "Connected" = `outline` + `text-success` + titik; README menyarankan `border-success/30 bg-success-soft text-success` | `settings.tsx:60` | `Badge` + token soft, atau `Status status="online"` | A | |
| 15 | Input file mentah tersembunyi untuk lampiran | `ticket-composer.tsx:280` | `FileUpload` / `Dropzone` | A · C (tombol klip sudah cukup) | |

## 2. Komponen DS dipakai tapi gayanya ditimpa

| # | Temuan | Lokasi | Gaya DS | Opsi | Keputusan |
|---|---|---|---|---|---|
| 16 | `KpiTile` menimpa `Stat`: label `text-xs uppercase`, nilai `font-mono text-xl` (DS `font-heading text-2xl`), padding `p-3` (DS `p-4`), trend digambar sendiri | `_parts/kpi-tile.tsx` | `Stat` + `delta` | B: tambah `goodWhen`/`size="sm"` ke `Stat` · C | |
| 17 | Item nav samping (queue rail, Report, Setting) — gaya sama disalin 3× : `h-8 px-2 font-normal hover:bg-accent`, aktif `bg-card shadow-xs ring-1`. Ghost DS hover-nya `bg-muted`, bukan `bg-accent` | `_parts/queue-rail.tsx:158`, `report.tsx:224`, `settings.tsx:213` | Tidak ada `Sidebar`/nav-item di DS | B: tambah `sidebar` (shadcn) / komponen nav-item · A: minimal satukan jadi satu part | |
| 18 | Tab navbar aktif = `Button ghost` + garis bawah `after:bg-primary`; indikator line di `Tabs` DS pakai `--ring` | `_parts/app-shell.tsx:156-165` | `Tabs` varian line / `NavigationMenu` | A: samakan warna ke `--ring` · B: nav-tab di DS · C | |
| 19 | Pill status agen = `Button outline` dipaksa `h-9 rounded-full px-3` (bentuk pill bukan varian Button) | `_parts/agent-status.tsx:24` | `Button size="lg"` (rounded-lg) atau `Pill` | A · B: varian `pill` di Button · C | |
| 20 | Kontrol tinggi di luar skala: `SelectTrigger size="sm"` (h-8) ditimpa `h-7`; `Input` (md, h-10) ditimpa `h-8` alih-alih `controlSize="sm"` | `ticket-composer.tsx:177,195`, `emoji-picker.tsx:80`, `ticket-sidebar.tsx:136,429`, `_parts/view-toolbar.tsx:159` | `controlSize` / `size` (sm = h-8, md = h-10) | A | |
| 21 | Override ukuran yang sama dengan default (tidak berefek): `CardTitle text-base`, `Button icon-sm size-7`, `Badge h-5` | `dashboard.tsx:37,141`, `ticket-composer.tsx:224,234`, `queue-rail.tsx:168`, `ticket-sidebar.tsx:161` | — | A: hapus | |
| 22 | Avatar ukuran non-DS `size-5` + teks `text-[0.625rem]` (DS: sm 24px / default 32px / lg 40px) | `ticket-sidebar.tsx:198` | `Avatar size="sm"` | A · B: tambah `size="xs"` | |
| 23 | Radius badge di kartu tiket ditimpa `rounded-md` (badge lain di app `rounded-4xl`) | `_parts/ticket-row.tsx:86` | `Badge` default | A: kembalikan · B: varian/radius badge di DS | A — badge kartu tiket diganti `Pill` |
| 24 | `Card` ditimpa `py-0` + `CardContent p-4` / `CardFooter border-t px-4 py-2.5`, melewati `--card-spacing` | `report.tsx:254`, `contacts.tsx:104`, `settings.tsx:53,77`, `dashboard.tsx:35` (`gap-3`) | `Card` / `Card size="sm"` | A | |
| 25 | `SelectTrigger` & `<button>` di sidebar dibentuk ulang total jadi "teks bisa diedit" (`editable`, `selectEditable`) | `ticket-sidebar.tsx:58-68` | Tidak ada inline-edit di DS | B: komponen inline-edit · C | |
| 26 | `Dialog` dipaksa full screen (`top-0 left-0 h-dvh w-screen rounded-none`, ukuran kecil `w-[min(1280px,94vw)] h-[92dvh]`) | `inbox.tsx:86-90` | `DialogContent` tanpa varian ukuran | B: `size="fullscreen"/"xl"` di Dialog · C | |
| 27 | Lebar `Sheet` kanan arbitrer `w-[22rem]` | `ticket-detail.tsx:177` | Default `SheetContent` | A · C | |
| 28 | `Kbd` di dalam tombol primary ditimpa warnanya | `ticket-detail.tsx:144` | `Kbd` tanpa varian inverse | B: varian inverse · C | |
| 29 | `Progress` ditipiskan `h-1.5` | `dashboard.tsx:180` | `Progress` default | A · C | |
| 30 | Filter timeline pakai `ToggleGroup` + override warna teks; secara pola ini tab | `ticket-timeline.tsx:59-61` | `Tabs` (aktif `bg-accent`) | A · C | |
| 31 | Pagination: prev/next dimatikan via `pointer-events-none opacity-50` + `text=""` | `ticket-list.tsx:212,220` | Pagination tanpa prop `disabled` | B · C | |

## 3. Konsistensi visual (elevasi, fokus, tipografi)

| # | Temuan | Lokasi | Gaya DS | Opsi | Keputusan |
|---|---|---|---|---|---|
| 32 | Elevasi campur: `shadow-xs` (kartu tiket, wadah list, nav aktif, composer), `shadow-md` (Jump to latest), `shadow-sm` (frame gallery); `Card` DS pakai `ring-1` tanpa shadow | `ticket-row.tsx`, `ticket-list.tsx`, `queue-rail.tsx`, `ticket-composer.tsx:143`, `ticket-timeline.tsx:101`, `block-frame.tsx:102` | ring, tanpa shadow | A: satu aturan elevasi · B: token shadow di DS | |
| 33 | Fokus beda dari DS: kartu tiket `outline-2 outline-ring`, composer `ring-ring/30` (DS: `ring-3 ring-ring/50`) | `ticket-row.tsx:80`, `ticket-composer.tsx:143` | `focus-visible:ring-3 ring-ring/50` | A | |
| 34 | Judul seksi kecil `text-xs font-semibold tracking-wide uppercase` disalin 4×; `FilterPanel` DS pakai `font-medium` untuk legend yang sama | `queue-rail.tsx:124`, `report.tsx:216`, `contact-detail.tsx:89`, `kpi-tile.tsx:19` | Tidak ada komponen heading seksi | A: samakan ke `font-medium` · B: komponen/utility heading | |
| 35 | Bobot heading campur: judul halaman/seksi `font-semibold`, `CardTitle` DS `font-medium`; ukuran judul dialog tiket `text-lg`, halaman `text-xl` | `app-shell.tsx:321`, `ticket-header.tsx:76`, `report.tsx`, `settings.tsx:241`, `ticket-sidebar.tsx:531` | `CardTitle`/`DialogTitle` default | A · C | |
| 36 | Grafik: ukuran font sumbu `11` dan dash grid ditulis per chart | `dashboard.tsx:31,96,108,126` | `ChartContainer` tidak punya default sumbu | B: default di `chart.tsx` · C | |

## 4. Gap/bug DS yang sudah diakali di blocks (perlu diperbaiki di `components/ui`)

| # | Temuan | Lokasi akal-akalan | Opsi | Keputusan |
|---|---|---|---|---|
| 37 | `ScrollArea` root tanpa `overflow-hidden`, viewport butuh `[&_[data-slot=scroll-area-viewport]>div]:block!` (diulang 4×) | `inbox.tsx:49`, `ticket-list.tsx:184`, `ticket-timeline.tsx:69`, `ticket-sidebar.tsx:524` | B: perbaiki `scroll-area.tsx` · C | |
| 38 | `AccordionContent` tinggi beku saat buka + `mb-4` pada `<p>` | `ticket-sidebar.tsx:168` | B · C | |
| 39 | `CommandDialog` tidak merender root `Command` | `app-shell.tsx:334` | B · C | |
| 40 | `TooltipTrigger` di `ToggleGroupItem` menimpa `data-state` | `ticket-composer.tsx:158` | B · C | |
| 41 | `Stat` menganggap naik = baik (lihat #16) | `kpi-tile.tsx` | B · C | |
| 42 | Skala tinggi DS sendiri tidak seragam: `Button` default h-8, `Input`/`Select` md h-10, `InputGroup` h-8 — penyebab banyak override di #20 | `components/ui/button.tsx`, `input.tsx`, `input-group.tsx` | B: samakan skala · C | |

Belum dicek: tampilan per tema di browser (audit ini dari kode saja), dan `_data/*` (hanya data).
