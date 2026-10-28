"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react"

import { PRODUCTS, hasScope, toggleScope, type Scope, type UsageDay } from "@/lib/developer-portal-data"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ScopeBadges({ scopes }: { scopes: Scope[] }) {
  if (!scopes.length) return <span className="text-sm text-muted-foreground">No scopes</span>
  return (
    <span className="flex flex-wrap gap-1">
      {scopes.map((scope) => <Badge key={scope.product} variant="outline" className="font-mono text-xs">{scope.product}:{scope.access}</Badge>)}
    </span>
  )
}

/** Product × access checkbox grid. `allowed` limits choices to a parent's scopes (e.g. an API key within its app). */
export function ScopeMatrix({ id, value, onChange, allowed, error }: { id: string; value: Scope[]; onChange: (scopes: Scope[]) => void; allowed?: Scope[]; error?: string }) {
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">Scopes</legend>
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[minmax(0,1fr)_64px_64px] border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
          <span>Application</span><span className="text-center">Read</span><span className="text-center">Write</span>
        </div>
        {PRODUCTS.map(({ key, name }) => (
          <div key={key} className="grid grid-cols-[minmax(0,1fr)_64px_64px] items-center border-b px-3 py-2 last:border-b-0">
            <span className="text-sm">{name}</span>
            {(["read", "write"] as const).map((access) => {
              const disabled = allowed ? !hasScope(allowed, key, access) : false
              const checkbox = (
                <Checkbox
                  id={`${id}-${key}-${access}`}
                  aria-label={`${name} ${access}`}
                  checked={hasScope(value, key, access)}
                  disabled={disabled}
                  onCheckedChange={(checked) => onChange(toggleScope(value, key, access, checked === true))}
                />
              )
              return (
                <span key={access} className="flex justify-center">
                  {disabled ? (
                    <Tooltip>
                      <TooltipTrigger asChild><span tabIndex={0} className="rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{checkbox}</span></TooltipTrigger>
                      <TooltipContent>The app does not have {key}:{access}</TooltipContent>
                    </Tooltip>
                  ) : checkbox}
                </span>
              )
            })}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Write includes read.</p>
      {error && <p id={`${id}-error`} className="text-sm text-destructive">{error}</p>}
    </fieldset>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => setCopied(true), () => setCopied(false))
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

export type RevealedSecret = { title: string; description: string; items: { label: string; value: string; secret?: boolean }[] }

/** Shows newly created credentials once. After closing, only masked values remain anywhere in the UI. */
export function SecretRevealDialog({ secret, onClose }: { secret: RevealedSecret | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(secret)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-parry-theme>
        <DialogHeader>
          <DialogTitle>{secret?.title}</DialogTitle>
          <DialogDescription>{secret?.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {secret?.items.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-md border bg-muted px-3 py-2 font-mono text-sm">{value}</code>
                <CopyButton value={value} label={label} />
              </div>
            </div>
          ))}
          {secret?.items.some((item) => item.secret) && (
            <Alert>
              <TriangleAlertIcon />
              <AlertDescription>Copy the secret now. You will not be able to see it again.</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter><Button onClick={onClose}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type Confirmation = { title: string; description: string; action: string; onConfirm: () => void }

export function ConfirmDialog({ confirmation, onClose }: { confirmation: Confirmation | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(confirmation)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-parry-theme>
        <DialogHeader>
          <DialogTitle>{confirmation?.title}</DialogTitle>
          <DialogDescription>{confirmation?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => { confirmation?.onConfirm(); onClose() }}>{confirmation?.action}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const usageConfig = {
  success: { label: "Successful", color: "var(--chart-2)" },
  errors: { label: "Errors", color: "var(--destructive)" },
} satisfies ChartConfig

/** Stacked daily requests (successful + errors). `summary` is the screen-reader description of the totals. */
export function UsageAreaChart({ days, summary, className = "h-64" }: { days: UsageDay[]; summary: string; className?: string }) {
  return (
    <ChartContainer config={usageConfig} aria-label={`Stacked area chart of daily API requests: ${summary}`} className={`aspect-auto w-full ${className}`}>
      <AreaChart data={days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 6" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={28} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <YAxis width={44} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value))} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area dataKey="success" stackId="requests" type="monotone" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
        <Area dataKey="errors" stackId="requests" type="monotone" stroke="var(--color-errors)" fill="var(--color-errors)" fillOpacity={0.25} strokeWidth={2} isAnimationActive={false} />
      </AreaChart>
    </ChartContainer>
  )
}
