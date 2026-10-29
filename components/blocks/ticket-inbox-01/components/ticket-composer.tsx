"use client"

import { useRef, useState } from "react"
import {
  BoldIcon,
  ChevronDownIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  LockIcon,
  PaperclipIcon,
  RemoveFormattingIcon,
  SendHorizontalIcon,
  UnderlineIcon,
  XIcon,
  ZapIcon,
} from "lucide-react"

import { cn } from "cn"

import { channels } from "@/components/blocks/_data/channels"
import { quickReplies, type Ticket } from "@/components/blocks/_data/tickets"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { channelMeta } from "@/components/blocks/channel-meta"
import { EmojiPicker } from "@/components/blocks/ticket-inbox-01/components/emoji-picker"
import { escalationGroups, shortcuts } from "@/components/blocks/ticket-inbox-01/components/ticket-meta"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { Pill } from "@/components/ui/pill"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type ComposerMode = "reply" | "escalate" | "note"
export type ComposerSend = { mode: ComposerMode; body: string; account: string; to?: string; close?: boolean }

const MAX = 2000
const WARN_AT = 1800

const modes: { id: ComposerMode; label: string; shortcut: string }[] = [
  { id: "reply", label: "Reply", shortcut: shortcuts.reply },
  { id: "escalate", label: "Escalate", shortcut: shortcuts.escalate },
  { id: "note", label: "Note", shortcut: shortcuts.note },
]

const placeholders: Record<ComposerMode, string> = {
  reply: "Reply to the customer… type / for templates",
  escalate: "Describe the issue for the escalation group…",
  note: "Add an internal note, only agents can see it…",
}

function Hint({ label, keys, children }: { label: string; keys?: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        {label}
        {keys && <Kbd>{keys}</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

const fileSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`)

/**
 * Compact until focused (or holding a draft); `disabled` dims it and makes it inert, for closed or locked tickets.
 * Ctrl/⌘+Enter sends, adding Shift sends and closes; "/" in an empty reply opens quick replies.
 */
export function TicketComposer({
  ticket,
  mode,
  onModeChange,
  onSend,
  disabled,
  textareaRef,
}: {
  ticket: Ticket
  mode: ComposerMode
  onModeChange: (mode: ComposerMode) => void
  onSend: (message: ComposerSend) => void
  disabled?: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  const [draft, setDraft] = useState("")
  const [focused, setFocused] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [to, setTo] = useState<string>()
  const accounts = channels.find((c) => c.id === ticket.channel)?.accounts ?? [ticket.account]
  const [account, setAccount] = useState(ticket.account)
  const fileInput = useRef<HTMLInputElement>(null)
  const templatesButton = useRef<HTMLButtonElement>(null)

  const expanded = focused || draft.length > 0 || files.length > 0
  const canSend = draft.trim().length > 0 && (mode !== "escalate" || Boolean(to))

  // Insert at the caret (or replace the selection), then put the caret after the inserted text.
  const insertAtCursor = (text: string) => {
    const el = textareaRef.current
    const start = el?.selectionStart ?? draft.length
    const end = el?.selectionEnd ?? draft.length
    setDraft((d) => d.slice(0, start) + text + d.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + text.length, start + text.length)
    })
  }

  const send = (close = false) => {
    if (!canSend) return
    onSend({ mode, body: draft.trim(), account, to, close: close && mode === "reply" })
    setDraft("")
    setFiles([])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      send(e.shiftKey)
    } else if (e.key === "/" && !draft && mode === "reply") {
      e.preventDefault()
      // Open from the trigger, as a click would; opening while the textarea holds focus loses a focus race and closes.
      templatesButton.current?.focus()
      setTemplatesOpen(true)
    }
  }

  return (
    <div
      inert={disabled}
      aria-disabled={disabled || undefined}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      className={cn(
        "flex flex-col rounded-xl border bg-card text-card-foreground shadow-xs transition-[opacity,box-shadow] focus-within:ring-3 focus-within:ring-ring/30",
        mode === "note" && "border-warning/50 bg-warning-soft",
        disabled && "opacity-50"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 px-2 pt-2">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={mode}
          onValueChange={(v) => v && onModeChange(v as ComposerMode)}
          aria-label="Composer mode"
        >
          {/* Tooltip sits on the label: as the item's trigger it would overwrite the item's data-state="on". */}
          {modes.map((m) => (
            <ToggleGroupItem key={m.id} value={m.id} className="px-3" aria-keyshortcuts={m.shortcut.replace(" ", "+")}>
              <Hint label={m.label} keys={m.shortcut}>
                <span>{m.label}</span>
              </Hint>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {mode === "reply" && (
          // Channel and sending account sit right above the text box; a picker only when there is a choice.
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            via
            <ChannelIcon channel={ticket.channel} className="size-4 [&_svg]:size-2.5" />
            <span className="font-medium text-foreground">{channelMeta[ticket.channel].typeLabel}</span>
            ·
            {accounts.length > 1 ? (
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger size="sm" aria-label="Send from account" className="h-7 max-w-56 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="truncate">{account}</span>
            )}
          </span>
        )}
        {mode === "escalate" && (
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger size="sm" aria-label="Escalate to group" className="h-7 min-w-48">
              <span className="text-muted-foreground">To</span>
              <SelectValue placeholder="Select group escalation" />
            </SelectTrigger>
            <SelectContent>
              {escalationGroups.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {mode === "note" && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-warning">
            <LockIcon aria-hidden="true" className="size-3.5" />
            Only visible to agents
          </span>
        )}
      </div>

      {mode === "escalate" && expanded && (
        // shortcut: formatting buttons are visual only, the DS has no rich-text editor; swap in one when it does.
        <div role="toolbar" aria-label="Formatting" className="flex items-center gap-0.5 px-2 pt-2">
          {[
            { label: "Bold", icon: BoldIcon },
            { label: "Italic", icon: ItalicIcon },
            { label: "Underline", icon: UnderlineIcon },
          ].map(({ label, icon: Icon }) => (
            <Toggle key={label} size="sm" aria-label={label} className="size-7 min-w-0 px-0">
              <Icon />
            </Toggle>
          ))}
          {[
            { label: "Insert link", icon: LinkIcon },
            { label: "Bulleted list", icon: ListIcon },
            { label: "Numbered list", icon: ListOrderedIcon },
            { label: "Clear formatting", icon: RemoveFormattingIcon },
          ].map(({ label, icon: Icon }) => (
            <Button key={label} variant="ghost" size="icon-sm" aria-label={label} className="size-7 text-muted-foreground">
              <Icon />
            </Button>
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        aria-label={modes.find((m) => m.id === mode)!.label + " message"}
        placeholder={placeholders[mode]}
        value={draft}
        maxLength={MAX}
        rows={expanded ? 4 : 1}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        className={cn(
          "resize-none rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
          expanded ? "min-h-24" : "min-h-10"
        )}
      />

      {files.length > 0 && (
        <ul aria-label="Attachments" className="flex flex-wrap gap-1.5 px-3 pb-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              <Pill className="h-7 gap-1 pr-0.5">
                <PaperclipIcon />
                <span className="max-w-40 truncate">{f.name}</span>
                <span className="text-muted-foreground">{fileSize(f.size)}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-5 rounded-full"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles((all) => all.filter((_, j) => j !== i))}
                >
                  <XIcon />
                </Button>
              </Pill>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-1 border-t px-2 py-1.5">
        <input
          ref={fileInput}
          type="file"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            setFiles((all) => [...all, ...Array.from(e.target.files ?? [])])
            e.target.value = ""
          }}
        />
        <Hint label="Attach files">
          <Button variant="ghost" size="icon-sm" aria-label="Attach files" className="text-muted-foreground" onClick={() => fileInput.current?.click()}>
            <PaperclipIcon />
          </Button>
        </Hint>
        <EmojiPicker onPick={insertAtCursor} onClose={() => textareaRef.current?.focus()} />
        {mode !== "note" && (
          <Popover open={templatesOpen} onOpenChange={setTemplatesOpen}>
            <Hint label="Templates" keys="/">
              <PopoverTrigger asChild>
                <Button ref={templatesButton} variant="ghost" size="sm" className="text-muted-foreground">
                  <ZapIcon />
                  Templates
                </Button>
              </PopoverTrigger>
            </Hint>
            <PopoverContent
              align="start"
              side="top"
              className="w-80 gap-0 overflow-hidden p-0"
              onCloseAutoFocus={(e) => (e.preventDefault(), textareaRef.current?.focus())}
            >
              <Command>
                <CommandInput placeholder="Search quick replies or /code…" />
                <CommandList className="max-h-60">
                  <CommandEmpty>No template found.</CommandEmpty>
                  <CommandGroup heading={`Quick replies · ${quickReplies.length}`}>
                    {quickReplies.map((t) => (
                      <CommandItem
                        key={t.id}
                        value={`/${t.shortcut} ${t.title} ${t.body}`}
                        onSelect={() => {
                          insertAtCursor(draft ? `\n${t.body}` : t.body)
                          setTemplatesOpen(false)
                        }}
                        className="flex-col items-stretch gap-0 py-1.5"
                      >
                        <span className="flex items-baseline gap-2">
                          <span className="truncate text-sm font-medium">{t.title}</span>
                          <CommandShortcut className="font-mono tracking-normal">/{t.shortcut}</CommandShortcut>
                        </span>
                        <span className="truncate text-xs text-muted-foreground">{t.body}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        <div className="ml-auto flex items-center gap-2">
          {draft.length >= WARN_AT && (
            <span aria-live="polite" className={cn("text-xs tabular-nums", draft.length >= MAX ? "text-destructive" : "text-warning")}>
              {draft.length}/{MAX}
            </span>
          )}
          {mode === "reply" ? (
            <ButtonGroup>
              <Hint label="Send" keys={shortcuts.send}>
                <Button size="sm" disabled={!canSend} onClick={() => send()}>
                  <SendHorizontalIcon />
                  Send
                </Button>
              </Hint>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-sm" disabled={!canSend} aria-label="More send options" className="border-l border-primary-foreground/30">
                    <ChevronDownIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top">
                  <DropdownMenuItem onSelect={() => send(true)}>
                    Send &amp; Close ticket
                    <DropdownMenuShortcut>{shortcuts.sendClose}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>
          ) : (
            <Hint label={mode === "note" ? "Add note" : "Send escalation"} keys={shortcuts.send}>
              <Button size="sm" disabled={!canSend} onClick={() => send()}>
                <SendHorizontalIcon />
                {mode === "note" ? "Add note" : "Send escalation"}
              </Button>
            </Hint>
          )}
        </div>
      </div>
    </div>
  )
}
