"use client"

import { useState } from "react"
import {
  BellRingIcon,
  ClockIcon,
  CogIcon,
  ListPlusIcon,
  PlugIcon,
  PlusIcon,
  RefreshCwIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "cn"

import { channels as initialChannels, type Channel } from "@/components/blocks/_data/channels"
import { AppShell } from "@/components/blocks/_parts/app-shell"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { channelMeta, type ChannelId } from "@/components/blocks/channel-meta"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type SectionId = "general" | "user" | "account" | "channel" | "team" | "sla" | "custom-fields"

const sections: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "user", label: "User", icon: UserIcon },
  { id: "account", label: "Account", icon: CogIcon },
  { id: "channel", label: "Channel", icon: PlugIcon },
  { id: "team", label: "Team & Group", icon: UsersIcon },
  { id: "sla", label: "SLA", icon: ClockIcon },
  { id: "custom-fields", label: "Custom fields", icon: ListPlusIcon },
]

type ChannelCardData = Channel & { enabled: boolean }

function ChannelCard({ channel: c, onToggle }: { channel: ChannelCardData; onToggle: (enabled: boolean) => void }) {
  const meta = channelMeta[c.id]
  const status = !c.connected ? "disconnected" : c.enabled ? "active" : "paused"
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-start gap-3 p-4">
        <ChannelIcon channel={c.id} muted={!c.connected} className="size-10 rounded-lg [&_svg]:size-5" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{meta.label}</h3>
            {status === "active" && (
              <Badge variant="outline" className="text-success">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
                Connected
              </Badge>
            )}
            {status === "paused" && <Badge variant="secondary">Paused</Badge>}
            {status === "disconnected" && <Badge variant="destructive">Disconnected</Badge>}
          </div>
          <p className="truncate text-sm text-muted-foreground">{c.account}</p>
        </div>
        <Switch
          checked={c.connected && c.enabled}
          disabled={!c.connected}
          onCheckedChange={onToggle}
          aria-label={`${c.enabled ? "Disable" : "Enable"} ${meta.label} (${c.account})`}
        />
      </CardContent>
      <CardFooter className="justify-between gap-2 border-t px-4 py-2.5">
        <span className="text-xs text-muted-foreground">
          {status === "disconnected" ? "Token expired · reconnect to receive messages" : status === "paused" ? "New messages are not routed" : "Routing to Customer Care"}
        </span>
        {c.connected ? (
          <Button variant="outline" size="sm">
            Manage
          </Button>
        ) : (
          <Button size="sm">
            <RefreshCwIcon />
            Reconnect
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function AddChannelDialog({ onAdd }: { onAdd: (id: ChannelId, account: string) => void }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ChannelId>("chat")
  const [account, setAccount] = useState("")
  const [group, setGroup] = useState("Customer Care")

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setAccount("")
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Add channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!account.trim()) return
            onAdd(type, account.trim())
            setOpen(false)
            setAccount("")
          }}
        >
          <DialogHeader>
            <DialogTitle>Add channel</DialogTitle>
            <DialogDescription>Connect an account so its conversations arrive in the Ticket inbox.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <span id="channel-type-label" className="text-sm font-medium">
              Channel
            </span>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              value={type}
              onValueChange={(v) => v && setType(v as ChannelId)}
              aria-labelledby="channel-type-label"
              className="grid w-full grid-cols-2 sm:grid-cols-3"
            >
              {(Object.keys(channelMeta) as ChannelId[]).map((id) => (
                <ToggleGroupItem key={id} value={id} className="h-10 justify-start gap-2 px-2.5">
                  <ChannelIcon channel={id} />
                  <span className="truncate">{channelMeta[id].label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="channel-account">Account name</Label>
            <Input
              id="channel-account"
              placeholder={type === "email" ? "support@company.example" : `${channelMeta[type].label} page or handle`}
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="channel-group">Route to group</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger id="channel-group" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Customer Care", "Billing", "Dealer Support", "Digital"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!account.trim()}>
              Connect
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function Settings() {
  const [section, setSection] = useState<SectionId>("channel")
  const [list, setList] = useState<ChannelCardData[]>(() => initialChannels.map((c) => ({ ...c, enabled: c.connected })))
  const current = sections.find((s) => s.id === section)!
  const connected = list.filter((c) => c.connected).length

  return (
    <AppShell active="setting" title="Setting" description="Workspace configuration for Team Yp Corp · sample data">
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="flex flex-col gap-0.5 max-lg:hidden">
          {sections.map((s) => (
            <Button
              key={s.id}
              variant="ghost"
              size="sm"
              aria-current={s.id === section ? "page" : undefined}
              onClick={() => setSection(s.id)}
              className={cn(
                "h-8 justify-start gap-2 px-2 font-normal hover:bg-accent",
                s.id === section && "bg-card font-medium text-foreground shadow-xs ring-1 ring-border hover:bg-card"
              )}
            >
              <s.icon />
              {s.label}
            </Button>
          ))}
        </nav>

        <section aria-labelledby="settings-section-title" className="flex min-w-0 flex-col gap-4">
          <div className="lg:hidden">
            <Select value={section} onValueChange={(v) => setSection(v as SectionId)}>
              <SelectTrigger aria-label="Settings section" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 id="settings-section-title" className="font-heading text-lg font-semibold">
                {section === "channel" ? "Channels" : current.label}
              </h2>
              {section === "channel" && (
                <p className="text-sm text-muted-foreground">
                  {connected} of {list.length} channels connected. Paused channels keep their history but stop routing new messages.
                </p>
              )}
            </div>
            {section === "channel" && (
              <AddChannelDialog
                onAdd={(id, account) => setList((l) => [...l, { id, account, connected: true, enabled: true }])}
              />
            )}
          </div>

          {section === "channel" ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {list.map((c, i) => (
                <li key={`${c.id}-${c.account}`}>
                  <ChannelCard channel={c} onToggle={(enabled) => setList((l) => l.map((x, j) => (j === i ? { ...x, enabled } : x)))} />
                </li>
              ))}
            </ul>
          ) : (
            <Card>
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BellRingIcon />
                  </EmptyMedia>
                  <EmptyTitle>{current.label} settings</EmptyTitle>
                  <EmptyDescription>This sample block only lays out the Channel section. Pick Channel to see it.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Card>
          )}
        </section>
      </div>
    </AppShell>
  )
}
