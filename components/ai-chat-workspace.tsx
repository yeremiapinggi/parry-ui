"use client"

import { useEffect, useRef, useState } from "react"
import {
  BotIcon,
  HeadphonesIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AiChatComposer } from "@/components/ai-chat-composer"
import { AiChatMessage } from "@/components/ai-chat-message"
import { ConversationSidebar } from "@/components/ai-chat-sidebar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  createDemoResponse,
  createInitialAiConversations,
  getDemoAgent,
  type AiChatConversation,
  type AiChatMessage as AiChatMessageData,
  type DemoAgentId,
} from "@/lib/ai-chat-data"

type GenerationTimer = { timeoutId: number; intervalId?: number }

const newDraftKey = "new-conversation"
const examplePrompts = [
  "Summarize these notes into three clear themes.",
  "Help me outline a customer-friendly update.",
  "Create a simple research plan for this question.",
]

function AgentIcon({ agentId, className }: { agentId: DemoAgentId; className?: string }) {
  if (agentId === "research") return <SparklesIcon aria-hidden="true" className={className} />
  if (agentId === "support") return <HeadphonesIcon aria-hidden="true" className={className} />
  return <BotIcon aria-hidden="true" className={className} />
}

function createLocalId() {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createTimeLabel() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

function createConversationTitle(prompt: string) {
  const title = prompt.replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "")
  return title.length > 48 ? `${title.slice(0, 45).trimEnd()}…` : title
}

function EmptyChatState({ agentId, onPrompt }: { agentId: DemoAgentId; onPrompt: (prompt: string) => void }) {
  const agent = getDemoAgent(agentId)

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-4 py-8 text-center sm:px-8">
      <div className="flex size-12 items-center justify-center rounded-2xl border bg-muted/60 text-foreground"><AgentIcon agentId={agent.id} className="size-5" /></div>
      <div className="flex max-w-lg flex-col gap-2">
        <Badge variant="outline" className="mx-auto gap-1.5"><span aria-hidden="true" className={`size-1.5 rounded-full ${agent.availability === "Available" ? "bg-success" : "bg-warning"}`} />{agent.name}</Badge>
        <h2 className="font-heading text-xl font-semibold tracking-tight">What would you like to work on?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{agent.description} Start a conversation or choose a prompt below.</p>
      </div>
      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-3">
        {examplePrompts.map((prompt) => <Button key={prompt} type="button" variant="outline" className="h-auto min-h-14 justify-start whitespace-normal px-3 py-2.5 text-left text-xs leading-relaxed" onClick={() => onPrompt(prompt)}>{prompt}</Button>)}
      </div>
      <p className="max-w-md text-[11px] leading-relaxed text-muted-foreground">Preview mode only. Responses are deterministic and generated locally; no live AI connection is active.</p>
    </div>
  )
}

export function AiChatWorkspace() {
  const [conversations, setConversations] = useState<AiChatConversation[]>(() => createInitialAiConversations())
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<DemoAgentId>("general")
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<AiChatConversation | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<AiChatConversation | null>(null)
  const generationTimers = useRef(new Map<string, GenerationTimer>())
  const messageScrollRef = useRef<HTMLDivElement>(null)
  const shouldFollowLatest = useRef(true)

  const activeConversation = conversations.find(({ id }) => id === activeConversationId) ?? null
  const activeAgentId = activeConversation?.agentId ?? selectedAgentId
  const activeAgent = getDemoAgent(activeAgentId)
  const activeDraftKey = activeConversationId ?? newDraftKey
  const composerValue = drafts[activeDraftKey] ?? ""
  const isGenerating = activeConversation?.messages.some((message) => message.role === "assistant" && (message.status === "thinking" || message.status === "streaming")) ?? false

  useEffect(() => {
    const timers = generationTimers.current
    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer.timeoutId)
        if (timer.intervalId !== undefined) window.clearInterval(timer.intervalId)
      }
      timers.clear()
    }
  }, [])

  useEffect(() => {
    shouldFollowLatest.current = true
    const frame = window.requestAnimationFrame(() => {
      const element = messageScrollRef.current
      if (element) element.scrollTop = element.scrollHeight
    })
    return () => window.cancelAnimationFrame(frame)
  }, [activeConversationId])

  useEffect(() => {
    if (!shouldFollowLatest.current) return
    const frame = window.requestAnimationFrame(() => {
      const element = messageScrollRef.current
      if (element) element.scrollTop = element.scrollHeight
    })
    return () => window.cancelAnimationFrame(frame)
  }, [activeConversation?.messages])

  function updateMessage(conversationId: string, messageId: string, update: (message: AiChatMessageData) => AiChatMessageData) {
    setConversations((current) => current.map((conversation) => conversation.id !== conversationId ? conversation : {
      ...conversation,
      messages: conversation.messages.map((message) => message.id === messageId ? update(message) : message),
    }))
  }

  function startResponse(conversationId: string, messageId: string, prompt: string, agentId: DemoAgentId, attempt: number) {
    const shouldFail = attempt === 0 && /\bsimulate error\b/i.test(prompt)
    const timeoutId = window.setTimeout(() => {
      if (shouldFail) {
        updateMessage(conversationId, messageId, (message) => ({ ...message, status: "error", content: "" }))
        generationTimers.current.delete(conversationId)
        return
      }

      updateMessage(conversationId, messageId, (message) => ({ ...message, status: "streaming" }))
      const response = createDemoResponse(agentId, prompt)
      const chunks = response.match(/[\s\S]{1,18}/g) ?? [response]
      let chunkIndex = 0
      const intervalId = window.setInterval(() => {
        chunkIndex += 1
        const content = chunks.slice(0, chunkIndex).join("")
        const complete = chunkIndex >= chunks.length
        updateMessage(conversationId, messageId, (message) => ({
          ...message,
          content,
          status: complete ? "completed" : "streaming",
          timestamp: complete ? createTimeLabel() : message.timestamp,
        }))
        if (complete) {
          window.clearInterval(intervalId)
          generationTimers.current.delete(conversationId)
        }
      }, 28)
      generationTimers.current.set(conversationId, { timeoutId, intervalId })
    }, shouldFail ? 750 : 480)

    generationTimers.current.set(conversationId, { timeoutId })
  }

  function sendMessage(value = composerValue) {
    const prompt = value.trim()
    if (!prompt || isGenerating) return

    const conversationId = activeConversationId ?? createLocalId()
    const agentId = activeAgentId
    const timestamp = createTimeLabel()
    const userMessage: AiChatMessageData = {
      id: createLocalId(),
      role: "user",
      content: prompt,
      agentId,
      timestamp,
    }
    const responseMessage: AiChatMessageData = {
      id: createLocalId(),
      role: "assistant",
      content: "",
      agentId,
      timestamp,
      status: "thinking",
      attempt: 0,
    }

    if (!activeConversationId) {
      setConversations((current) => [{
        id: conversationId,
        title: createConversationTitle(prompt),
        agentId,
        group: "Today",
        updatedAt: Date.now(),
        messages: [userMessage, responseMessage],
      }, ...current])
      setActiveConversationId(conversationId)
    } else {
      setConversations((current) => current.map((conversation) => conversation.id !== conversationId ? conversation : {
        ...conversation,
        group: "Today",
        updatedAt: Date.now(),
        messages: [...conversation.messages, userMessage, responseMessage],
      }))
    }

    setSelectedAgentId(agentId)
    setDrafts((current) => ({ ...current, [activeDraftKey]: "" }))
    startResponse(conversationId, responseMessage.id, prompt, agentId, 0)
  }

  function stopResponse() {
    if (!activeConversationId) return
    const timer = generationTimers.current.get(activeConversationId)
    if (timer) {
      window.clearTimeout(timer.timeoutId)
      if (timer.intervalId !== undefined) window.clearInterval(timer.intervalId)
      generationTimers.current.delete(activeConversationId)
    }
    const currentResponse = [...(activeConversation?.messages ?? [])].reverse().find((message) => message.role === "assistant" && (message.status === "thinking" || message.status === "streaming"))
    if (currentResponse) updateMessage(activeConversationId, currentResponse.id, (message) => ({ ...message, status: "stopped" }))
  }

  function retryResponse(messageId: string) {
    if (!activeConversation) return
    const messageIndex = activeConversation.messages.findIndex((message) => message.id === messageId)
    const failedMessage = activeConversation.messages[messageIndex]
    const previousUserMessage = [...activeConversation.messages.slice(0, messageIndex)].reverse().find((message) => message.role === "user")
    if (!failedMessage || !previousUserMessage) return
    const attempt = (failedMessage.attempt ?? 0) + 1
    const agentId = failedMessage.agentId ?? activeConversation.agentId
    updateMessage(activeConversation.id, failedMessage.id, (message) => ({ ...message, content: "", status: "thinking", attempt, timestamp: createTimeLabel() }))
    startResponse(activeConversation.id, failedMessage.id, previousUserMessage.content, agentId, attempt)
  }

  function switchAgent(agentId: DemoAgentId) {
    if (agentId === activeAgentId) return
    setSelectedAgentId(agentId)
    if (!activeConversationId) return

    const nextAgent = getDemoAgent(agentId)
    const notice: AiChatMessageData = {
      id: createLocalId(),
      role: "system",
      content: `Conversation switched to ${nextAgent.name}.`,
      timestamp: createTimeLabel(),
    }
    setConversations((current) => current.map((conversation) => conversation.id !== activeConversationId ? conversation : {
      ...conversation,
      agentId,
      group: "Today",
      updatedAt: Date.now(),
      messages: [...conversation.messages, notice],
    }))
  }

  function selectConversation(conversationId: string) {
    const nextConversation = conversations.find(({ id }) => id === conversationId)
    if (!nextConversation) return
    setActiveConversationId(conversationId)
    setSelectedAgentId(nextConversation.agentId)
  }

  function startNewChat() {
    setActiveConversationId(null)
  }

  function beginRename(conversation: AiChatConversation) {
    setRenameTarget(conversation)
    setRenameValue(conversation.title)
  }

  function saveRename() {
    const title = renameValue.trim()
    if (!renameTarget || !title) return
    setConversations((current) => current.map((conversation) => conversation.id === renameTarget.id ? { ...conversation, title } : conversation))
    setRenameTarget(null)
    toast.success("Conversation renamed")
  }

  function confirmDelete() {
    if (!deleteTarget) return
    const conversationId = deleteTarget.id
    const timer = generationTimers.current.get(conversationId)
    if (timer) {
      window.clearTimeout(timer.timeoutId)
      if (timer.intervalId !== undefined) window.clearInterval(timer.intervalId)
      generationTimers.current.delete(conversationId)
    }
    setConversations((current) => current.filter((conversation) => conversation.id !== conversationId))
    setDrafts((current) => {
      const next = { ...current }
      delete next[conversationId]
      return next
    })
    if (activeConversationId === conversationId) {
      setActiveConversationId(null)
      setSelectedAgentId("general")
    }
    setDeleteTarget(null)
    toast.success("Conversation deleted")
  }

  async function copyResponse(content: string) {
    try {
      await navigator.clipboard.writeText(content)
      toast.success("Demo response copied")
    } catch {
      toast.error("Could not copy this response")
    }
  }

  function renderSidebar(collapsed = false, onCollapse?: () => void, onExpand?: () => void, onDismiss?: () => void) {
    return <ConversationSidebar
      conversations={conversations}
      activeConversationId={activeConversationId}
      collapsed={collapsed}
      onCollapse={onCollapse}
      onExpand={onExpand}
      onCreate={startNewChat}
      onSelect={selectConversation}
      onRename={beginRename}
      onDelete={setDeleteTarget}
      onDismiss={onDismiss}
    />
  }

  return (
    <div data-parry-theme className="relative flex h-[min(780px,calc(100dvh-2rem))] min-h-[560px] w-full min-w-0 overflow-hidden rounded-xl border bg-card font-data text-card-foreground shadow-sm">
      <aside className={`hidden min-h-0 shrink-0 border-r bg-background transition-[width] @3xl:flex ${sidebarCollapsed ? "w-14" : "w-72"}`}>
        {renderSidebar(sidebarCollapsed, () => setSidebarCollapsed(true), () => setSidebarCollapsed(false))}
      </aside>

      <section aria-label="AI chat workspace" className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 shrink-0 items-center gap-3 border-b px-3 py-2.5 sm:px-5">
          <Button type="button" size="icon-sm" variant="ghost" className="@3xl:hidden" aria-label="Open conversation sidebar" onClick={() => setMobileSidebarOpen(true)}><MenuIcon /></Button>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground"><AgentIcon agentId={activeAgent.id} className="size-4" /></div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h1 className="truncate text-sm font-semibold">{activeAgent.name}</h1>
            <p className="truncate text-[11px] text-muted-foreground">{activeConversation?.title ?? "New conversation"}</p>
          </div>
          <Badge variant="outline" className="shrink-0">Demo workspace</Badge>
          <Button type="button" size="icon-sm" variant="ghost" className="hidden @3xl:inline-flex" aria-label={sidebarCollapsed ? "Expand conversation sidebar" : "Collapse conversation sidebar"} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}>
            {sidebarCollapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
          </Button>
        </header>

        {activeConversation ? (
          <div
            ref={messageScrollRef}
            role="log"
            aria-label={`Messages in ${activeConversation.title}`}
            aria-live="polite"
            onScroll={(event) => {
              const element = event.currentTarget
              shouldFollowLatest.current = element.scrollHeight - element.scrollTop - element.clientHeight < 88
            }}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6"
          >
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-1 py-5 sm:py-7">
              {activeConversation.messages.map((message) => <AiChatMessage key={message.id} message={message} onCopy={copyResponse} onRetry={retryResponse} />)}
            </div>
          </div>
        ) : (
          <EmptyChatState agentId={activeAgent.id} onPrompt={sendMessage} />
        )}

        <footer className="shrink-0 border-t bg-card">
          <AiChatComposer
            activeAgent={activeAgent}
            value={composerValue}
            isGenerating={isGenerating}
            onChange={(value) => setDrafts((current) => ({ ...current, [activeDraftKey]: value }))}
            onSend={() => sendMessage()}
            onStop={stopResponse}
            onAgentChange={switchAgent}
          />
        </footer>
      </section>

      <Dialog open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <DialogContent showCloseButton={false} data-parry-theme className="left-2 top-2 flex h-[calc(100dvh-1rem)] w-[min(20rem,calc(100vw-1rem))] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Conversation history</DialogTitle>
            <DialogDescription>Search and switch between AI conversations.</DialogDescription>
          </DialogHeader>
          {renderSidebar(false, undefined, undefined, () => setMobileSidebarOpen(false))}
        </DialogContent>
      </Dialog>

      <Dialog open={renameTarget !== null} onOpenChange={(open) => { if (!open) setRenameTarget(null) }}>
        <DialogContent data-parry-theme>
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
            <DialogDescription>Choose a short title that makes this chat easy to find later.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); saveRename() }} className="flex flex-col gap-4">
            <Input autoFocus aria-label="Conversation title" value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault() }} maxLength={80} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={!renameValue.trim()}>Save title</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent data-parry-theme>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>This removes “{deleteTarget?.title}” and its local demo history from the current preview. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>Delete conversation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
