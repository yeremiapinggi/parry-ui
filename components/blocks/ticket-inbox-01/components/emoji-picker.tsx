"use client"

import { useState } from "react"
import { SmileIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Emoji are message content the agent inserts, not UI chrome. Names drive search and screen-reader labels.
const emoji: [string, string][] = [
  ["😊", "smiling face"],
  ["🙂", "slightly smiling"],
  ["😄", "grinning"],
  ["😉", "winking"],
  ["🙏", "folded hands thank you"],
  ["👍", "thumbs up"],
  ["👌", "ok hand"],
  ["👋", "waving hand hello"],
  ["🤝", "handshake"],
  ["👏", "clapping"],
  ["💪", "flexed biceps"],
  ["🙌", "raising hands"],
  ["❤️", "red heart"],
  ["✨", "sparkles"],
  ["🎉", "party popper"],
  ["🔥", "fire"],
  ["✅", "check mark done"],
  ["❌", "cross mark"],
  ["⚠️", "warning"],
  ["⏳", "hourglass waiting"],
  ["📞", "telephone"],
  ["📧", "email"],
  ["📍", "location pin"],
  ["🚗", "car"],
  ["🔧", "wrench service"],
  ["📄", "document"],
  ["💳", "credit card payment"],
  ["😔", "pensive sorry"],
  ["😅", "sweat smile"],
  ["🤔", "thinking"],
  ["😢", "crying"],
  ["😡", "angry"],
]

export function EmojiPicker({ onPick, onClose }: { onPick: (emoji: string) => void; onClose: () => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const shown = q ? emoji.filter(([, name]) => name.includes(q)) : emoji

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setQuery("")
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Insert emoji" className="text-muted-foreground">
              <SmileIcon />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Insert emoji</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="start"
        side="top"
        className="w-72 gap-2 p-2"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          onClose()
        }}
      >
        <Input aria-label="Search emoji" placeholder="Search emoji…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-8" />
        <p className="px-1 text-xs font-medium text-muted-foreground">{q ? `${shown.length} results` : "Frequently used"}</p>
        {shown.length === 0 ? (
          <p className="px-1 py-4 text-center text-sm text-muted-foreground">No emoji found.</p>
        ) : (
          <div role="group" aria-label="Emoji" className="grid grid-cols-8 gap-0.5">
            {shown.map(([char, name]) => (
              <Button
                key={name}
                variant="ghost"
                size="icon-sm"
                aria-label={name}
                title={name}
                className="text-lg"
                onClick={() => {
                  onPick(char)
                  setOpen(false)
                }}
              >
                {char}
              </Button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
