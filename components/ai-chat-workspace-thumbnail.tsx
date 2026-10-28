"use client"

import { useState } from "react"
import { BotIcon, ChevronDownIcon, HeadphonesIcon, SearchIcon, SendIcon, SparklesIcon } from "lucide-react"

import { demoAgents } from "@/lib/ai-chat-data"

const sampleThreads = ["Support trends overview", "Launch checklist", "Vendor research"]

export function AiChatWorkspaceThumbnail() {
  const [activeAgentIndex, setActiveAgentIndex] = useState(0)
  const [activeThread, setActiveThread] = useState(sampleThreads[0])
  const [showReply, setShowReply] = useState(false)
  const activeAgent = demoAgents[activeAgentIndex] ?? demoAgents[0]

  function cycleAgent() {
    setActiveAgentIndex((current) => (current + 1) % demoAgents.length)
    setShowReply(false)
  }

  return (
    <div aria-label="Interactive AI Chat Workspace gallery thumbnail" className="grid h-full min-h-0 grid-cols-[34%_1fr] overflow-hidden bg-background text-foreground">
      <aside className="flex min-h-0 flex-col border-r bg-muted/30">
        <div className="flex items-center gap-1.5 border-b px-2 py-2 text-[9px] font-semibold"><span className="flex size-4 items-center justify-center rounded bg-primary text-primary-foreground"><BotIcon aria-hidden="true" className="size-2.5" /></span>Conversations</div>
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-1.5">
          {sampleThreads.map((thread) => <button key={thread} type="button" onClick={() => { setActiveThread(thread); setShowReply(false) }} aria-pressed={activeThread === thread} className={`truncate rounded px-2 py-1.5 text-left text-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeThread === thread ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>{thread}</button>)}
        </div>
        <button type="button" onClick={() => { setActiveThread("New conversation"); setShowReply(false) }} className="m-1.5 flex items-center justify-center gap-1 rounded border bg-card px-1.5 py-1.5 text-[8px] font-medium hover:bg-muted"><span aria-hidden="true">+</span>New chat</button>
      </aside>
      <section className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-1 border-b px-2.5 py-2">
          <span className="truncate text-[9px] font-medium">{activeThread}</span>
          <span className="rounded border bg-muted px-1.5 py-0.5 text-[7px] text-muted-foreground">Demo</span>
        </header>
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-hidden p-2.5">
          <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground">
            {activeAgent.id === "research" ? <SparklesIcon aria-hidden="true" className="size-3" /> : activeAgent.id === "support" ? <HeadphonesIcon aria-hidden="true" className="size-3" /> : <BotIcon aria-hidden="true" className="size-3" />}
            <span className="truncate font-medium text-foreground">{activeAgent.name}</span>
          </div>
          <p className="max-w-[90%] rounded-lg rounded-tl-sm border bg-card px-2 py-1.5 text-[8px] leading-relaxed">{showReply ? "Here is a local demo outline with a clear next step." : "Ask a question or choose a previous conversation."}</p>
          <div className="mt-auto flex items-center gap-1">
            <button type="button" onClick={cycleAgent} className="flex min-w-0 items-center gap-1 rounded border bg-card px-1.5 py-1 text-[7px] text-muted-foreground hover:bg-muted" aria-label={`Switch demo agent. Current: ${activeAgent.name}`}>
              {activeAgent.id === "research" ? <SearchIcon aria-hidden="true" className="size-2.5" /> : activeAgent.id === "support" ? <HeadphonesIcon aria-hidden="true" className="size-2.5" /> : <BotIcon aria-hidden="true" className="size-2.5" />}
              <span className="truncate">{activeAgent.name}</span><ChevronDownIcon aria-hidden="true" className="size-2.5 shrink-0" />
            </button>
            <button type="button" aria-label="Send a sample prompt" onClick={() => setShowReply(true)} className="ml-auto flex size-6 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/90"><SendIcon aria-hidden="true" className="size-2.5" /></button>
          </div>
        </div>
      </section>
    </div>
  )
}
