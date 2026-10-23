import { ArrowRightIcon, PlusIcon } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
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

const formStates = [
  { id: "default", label: "Default" },
  { id: "disabled", label: "Disabled", disabled: true },
  { id: "invalid", label: "Invalid", invalid: true },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Parry UI</h1>
          <p className="text-muted-foreground">
            Design system berbasis shadcn — Plus Jakarta Sans &amp;{" "}
            <code className="font-mono text-sm">JetBrains Mono</code>
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-4">
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
    </main>
  );
}
