"use client"

import { useMemo, useState } from "react"
import {
  BotIcon,
  ChevronLeftIcon,
  CirclePlusIcon,
  HeadphonesIcon,
  MoreHorizontalIcon,
  PanelLeftOpenIcon,
  PencilIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import type { AiChatConversation, DemoAgentId } from "@/lib/ai-chat-data"
import { demoAgents, getDemoAgent } from "@/lib/ai-chat-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function AgentIcon({ agentId, className }: { agentId: DemoAgentId; className?: string }) {
  if (agentId === "research") return <SparklesIcon aria-hidden="true" className={className} />
  if (agentId === "support") return <HeadphonesIcon aria-hidden="true" className={className} />
  return <BotIcon aria-hidden="true" className={className} />
}

type ConversationSidebarProps = {
  conversations: AiChatConversation[]
  activeConversationId: string | null
  collapsed?: boolean
  onCollapse?: () => void
  onExpand?: () => void
  onCreate: () => void
  onSelect: (conversationId: string) => void
  onRename: (conversation: AiChatConversation) => void
  onDelete: (conversation: AiChatConversation) => void
  onDismiss?: () => void
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  collapsed = false,
  onCollapse,
  onExpand,
  onCreate,
  onSelect,
  onRename,
  onDelete,
  onDismiss,
}: ConversationSidebarProps) {
  const [query, setQuery] = useState("")
  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    const groups = ["Today", "Yesterday", "Older"] as const

    return groups.map((group) => ({
      name: group,
      conversations: conversations
        .filter((conversation) => conversation.group === group && conversation.title.toLocaleLowerCase().includes(normalized))
        .sort((first, second) => second.updatedAt - first.updatedAt),
    })).filter(({ conversations: groupConversations }) => groupConversations.length > 0)
  }, [conversations, query])

  if (collapsed) {
    return (
      <div className="flex h-full w-full flex-col items-center gap-3 py-3">
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Expand conversation sidebar" title="Expand sidebar" onClick={onExpand}><PanelLeftOpenIcon /></Button>
        <Button type="button" size="icon-sm" variant="default" aria-label="New chat" title="New chat" onClick={onCreate}><CirclePlusIcon /></Button>
      </div>
    )
  }

  return (
    <section aria-label="Conversation history" className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-primary"><BotIcon aria-hidden="true" className="size-4" /></div>
          <div className="flex min-w-0 flex-col"><h2 className="truncate text-sm font-semibold">Conversations</h2><p className="text-[11px] text-muted-foreground">Sociomile Agentics demo</p></div>
        </div>
        {onCollapse && <Button type="button" size="icon-sm" variant="ghost" aria-label="Collapse conversation sidebar" title="Collapse sidebar" onClick={onCollapse}><ChevronLeftIcon /></Button>}
        {onDismiss && <Button type="button" size="icon-sm" variant="ghost" aria-label="Close conversation sidebar" title="Close sidebar" onClick={onDismiss}><XIcon /></Button>}
      </header>

      <div className="shrink-0 border-b p-3">
        <Button type="button" className="w-full justify-start" onClick={() => { onCreate(); onDismiss?.() }}>
          <CirclePlusIcon data-icon="inline-start" />New chat
        </Button>
        <div className="relative mt-3">
          <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search conversations" placeholder="Search conversations" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 pl-9" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {filteredGroups.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-3 text-center" role="status">
            <SearchIcon aria-hidden="true" className="size-5 text-muted-foreground" />
            <p className="text-sm font-medium">No conversations found</p>
            <p className="text-xs leading-relaxed text-muted-foreground">Try a different title or start a new chat.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredGroups.map(({ name, conversations: groupConversations }) => (
              <section key={name} aria-label={`${name} conversations`} className="flex flex-col gap-1">
                <h3 className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{name}</h3>
                <ul className="flex flex-col gap-1">
                  {groupConversations.map((conversation) => {
                    const active = conversation.id === activeConversationId
                    const agent = getDemoAgent(conversation.agentId)

                    return (
                      <li key={conversation.id} className="group relative flex min-w-0 items-stretch">
                        <button
                          type="button"
                          onClick={() => { onSelect(conversation.id); onDismiss?.() }}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-w-0 flex-1 flex-col gap-1 rounded-lg border-l-2 py-2.5 pl-2.5 pr-9 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-l-primary bg-accent/70 text-accent-foreground" : "border-l-transparent hover:bg-muted/70"}`}
                        >
                          <span className="w-full truncate text-xs font-medium">{conversation.title}</span>
                          <span className="flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                            <AgentIcon agentId={conversation.agentId} className="size-3 shrink-0" />
                            <span className="truncate">{agent.name}</span>
                            <span aria-hidden="true">·</span>
                            <span className="shrink-0">{conversation.messages.filter(({ role }) => role !== "system").length} messages</span>
                          </span>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" size="icon-xs" variant="ghost" aria-label={`Actions for ${conversation.title}`} title="Conversation actions" className="absolute right-1 top-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                              <MoreHorizontalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" data-parry-theme>
                            <DropdownMenuItem onSelect={() => onRename(conversation)}><PencilIcon />Rename</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(conversation)}><Trash2Icon />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
      <footer className="flex shrink-0 items-center gap-2 border-t px-3 py-2.5 text-[10px] text-muted-foreground">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
        <span>{demoAgents.filter(({ availability }) => availability === "Available").length} agents available</span>
        <span className="ml-auto">Local demo</span>
      </footer>
    </section>
  )
}
