import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CircleCheckIcon, InfoIcon, OctagonXIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";

import { OverlayDemo } from "@/components/overlay-demo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const swatches = [
  ["background", "foreground"],
  ["card", "card-foreground"],
  ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"],
  ["muted", "muted-foreground"],
  ["accent", "accent-foreground"],
  ["sidebar", "sidebar-foreground"],
  ["destructive-soft", "destructive"],
  ["success-soft", "success"],
  ["warning-soft", "warning"],
  ["info-soft", "info"],
] as const;

const charts = [1, 2, 3, 4, 5];

const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;

const badgeVariants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;

// Semantic colors are applied with token utilities instead of forking Alert/Badge with new variants.
const semantic = [
  { name: "success", icon: CircleCheckIcon, className: "border-success/30 bg-success-soft text-success", title: "Berhasil disimpan", text: "Perubahan sudah tersinkron ke semua anggota tim." },
  { name: "warning", icon: TriangleAlertIcon, className: "border-warning/30 bg-warning-soft text-warning", title: "Kuota hampir habis", text: "Tersisa 12% dari kuota bulan ini." },
  { name: "info", icon: InfoIcon, className: "border-info/30 bg-info-soft text-info", title: "Fitur baru", text: "Ekspor laporan kini mendukung format CSV." },
  { name: "error", icon: OctagonXIcon, className: "border-destructive/30 bg-destructive-soft text-destructive", title: "Gagal terhubung", text: "Periksa koneksi lalu coba lagi." },
] as const;

const team = [
  { initials: "JD", name: "Jordan Doe", role: "Admin", status: "Aktif" },
  { initials: "SR", name: "Sari Rahma", role: "Editor", status: "Aktif" },
  { initials: "BT", name: "Budi Tan", role: "Viewer", status: "Diundang" },
] as const;

const bars = [40, 55, 48, 62, 58, 75, 90];

const formStates = [
  { id: "default", label: "Default" },
  { id: "disabled", label: "Disabled", disabled: true },
  { id: "invalid", label: "Invalid", invalid: true },
] as const;

export const metadata: Metadata = { title: "Komponen · Parry UI" };

export default function ComponentsPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            <Link href="/" className="hover:text-primary">Parry UI</Link>
          </h1>
          <p className="text-muted-foreground">
            Design system berbasis shadcn — Plus Jakarta Sans &amp;{" "}
            <code className="font-mono text-sm">JetBrains Mono</code>
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section id="warna" className="flex scroll-mt-8 flex-col gap-4">
        <h2 className="text-lg font-semibold">Warna</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {swatches.map(([bg, fg]) => (
            <div
              key={bg}
              data-swatch={bg}
              className="flex h-20 flex-col justify-end rounded-lg border p-3 text-sm"
              style={{ background: `var(--${bg})`, color: `var(--${fg})` }}
            >
              <span className="font-medium">{bg}</span>
              <span className="font-mono text-xs opacity-80">{fg}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {charts.map((n) => (
            <div
              key={n}
              className="h-8 flex-1 rounded-md"
              style={{ background: `var(--chart-${n})` }}
              title={`chart-${n}`}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Button</h2>
        <div className="flex flex-wrap items-center gap-3">
          {variants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">xs</Button>
          <Button size="sm">sm</Button>
          <Button>default</Button>
          <Button size="lg">
            lg <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button size="icon" aria-label="Tambah">
            <PlusIcon />
          </Button>
          <Button disabled>disabled</Button>
          <Button aria-invalid>invalid</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Form</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {formStates.map((s) => {
            const disabled = "disabled" in s;
            const invalid = "invalid" in s || undefined;
            return (
              <div key={s.id} className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`email-${s.id}`}>Email</Label>
                  <Input id={`email-${s.id}`} type="email" placeholder="nama@ivosights.com" disabled={disabled} aria-invalid={invalid} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`role-${s.id}`}>Peran</Label>
                  <Select disabled={disabled}>
                    <SelectTrigger id={`role-${s.id}`} className="w-full" aria-invalid={invalid}>
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`note-${s.id}`}>Catatan</Label>
                  <Textarea id={`note-${s.id}`} placeholder="Tulis catatan…" disabled={disabled} aria-invalid={invalid} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id={`terms-${s.id}`} disabled={disabled} aria-invalid={invalid} />
                  <Label htmlFor={`terms-${s.id}`}>Setuju dengan ketentuan</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id={`notify-${s.id}`} disabled={disabled} aria-invalid={invalid} defaultChecked={s.id === "default"} />
                  <Label htmlFor={`notify-${s.id}`}>Notifikasi email</Label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Feedback</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Alert>
            <InfoIcon />
            <AlertTitle>Default</AlertTitle>
            <AlertDescription>Alert bawaan memakai warna card.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <OctagonXIcon />
            <AlertTitle>Destructive</AlertTitle>
            <AlertDescription>Variant destructive bawaan shadcn.</AlertDescription>
          </Alert>
          {semantic.map(({ name, icon: Icon, className, title, text }) => (
            <Alert key={name} className={className}>
              <Icon />
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription className="text-current">{text}</AlertDescription>
            </Alert>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {badgeVariants.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
          {semantic.map(({ name, className }) => (
            <Badge key={name} className={className}>
              {name}
            </Badge>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Overlay</h2>
        <OverlayDemo />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Layout &amp; data</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total Components</CardDescription>
              <CardTitle className="text-3xl">48</CardTitle>
              <CardAction>
                <Badge className="border-success/30 bg-success-soft text-success">↑ 12%</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex h-16 items-end gap-1.5" aria-hidden>
              {bars.map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-chart-2" style={{ height: `${h}%` }} />
              ))}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">Dari bulan lalu</CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design system</CardTitle>
              <CardDescription>Komponen, token, dan panduan untuk produk Ivosights.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tokens">Tokens</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-2 text-sm text-muted-foreground">
                  20 item registry siap dipasang lewat shadcn CLI.
                </TabsContent>
                <TabsContent value="tokens" className="pt-2 text-sm text-muted-foreground">
                  Warna Midnight + Frost Blue, lolos WCAG AA.
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="px-0">
                Pelajari <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>

          <Card aria-busy="true" aria-label="Memuat">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Anggota tim</CardTitle>
            <CardDescription>Tabel dengan avatar, badge status, dan separator.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((m) => (
                  <TableRow key={m.initials}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>{m.initials}</AvatarFallback>
                        </Avatar>
                        {m.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.role}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={m.status === "Aktif" ? "secondary" : "outline"}>{m.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
