"use client"

import { useLayoutEffect, useRef, type KeyboardEvent } from "react"
import { BotIcon, CheckIcon, ChevronDownIcon, HeadphonesIcon, SendIcon, SparklesIcon, StopCircleIcon } from "lucide-react"

import type { DemoAgent, DemoAgentId } from "@/lib/ai-chat-data"
import { demoAgents } from "@/lib/ai-chat-data"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"

function AgentIcon({ agentId, className }: { agentId: DemoAgentId; className?: string }) {
  if (agentId === "research") return <SparklesIcon aria-hidden="true" className={className} />
  if (agentId === "support") return <HeadphonesIcon aria-hidden="true" className={className} />
  return <BotIcon aria-hidden="true" className={className} />
}

function AgentSelector({ activeAgent, onAgentChange }: { activeAgent: DemoAgent; onAgentChange: (agentId: DemoAgentId) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" aria-label={`Select AI agent. Current agent: ${activeAgent.name}`} className="max-w-full">
          <span data-icon="inline-start"><AgentIcon agentId={activeAgent.id} /></span>
          <span className="max-w-48 truncate">{activeAgent.name}</span>
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72" data-parry-theme>
        <DropdownMenuLabel>Choose an AI agent</DropdownMenuLabel>
        <DropdownMenuGroup>
          {demoAgents.map((agent) => (
            <DropdownMenuItem key={agent.id} onSelect={() => onAgentChange(agent.id)} className="items-start gap-3 py-2.5">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground"><AgentIcon agentId={agent.id} className="size-4" /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium">{agent.name}{activeAgent.id === agent.id && <CheckIcon aria-label="Selected" className="size-3.5 text-primary" />}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{agent.description}</span>
                <span className="flex items-center gap-1.5 pt-0.5 text-[10px] text-muted-foreground"><span className={`size-1.5 rounded-full ${agent.availability === "Available" ? "bg-success" : "bg-warning"}`} />{agent.availability}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type AiChatComposerProps = {
  activeAgent: DemoAgent
  value: string
  isGenerating: boolean
  onChange: (value: string) => void
  onSend: () => void
  onStop: () => void
  onAgentChange: (agentId: DemoAgentId) => void
}

export function AiChatComposer({ activeAgent, value, isGenerating, onChange, onSend, onStop, onAgentChange }: AiChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    const nextHeight = Math.min(textarea.scrollHeight, 144)
    textarea.style.height = `${nextHeight}px`
    textarea.style.overflowY = textarea.scrollHeight > 144 ? "auto" : "hidden"
  }, [value])

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (value.trim() && !isGenerating) onSend()
    }
  }

  return (
    <div className="flex flex-col gap-2.5 px-3 py-3 sm:px-5 sm:py-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">Agent</span>
          <AgentSelector activeAgent={activeAgent} onAgentChange={onAgentChange} />
        </div>
        {isGenerating && <Button type="button" size="sm" variant="outline" onClick={onStop}><StopCircleIcon data-icon="inline-start" />Stop generating</Button>}
      </div>
      <div className="flex items-end gap-2 rounded-xl border bg-background p-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
        <Textarea
          ref={textareaRef}
          aria-label="Message composer"
          aria-describedby="ai-chat-composer-hint"
          placeholder={`Message ${activeAgent.name}…`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="min-h-10 max-h-36 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none ring-0 focus-visible:border-transparent focus-visible:ring-0"
        />
        <Button type="button" size="icon" aria-label="Send message" title="Send message" disabled={!value.trim() || isGenerating} onClick={onSend} className="mb-0.5">
          <SendIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p id="ai-chat-composer-hint" className="text-[10px] leading-relaxed text-muted-foreground">Enter to send · Shift + Enter for a new line</p>
        <p className="text-[10px] leading-relaxed text-muted-foreground">Local demo responses · No live AI connection</p>
      </div>
    </div>
  )
}
