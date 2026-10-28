import {
  AlertCircleIcon,
  BotIcon,
  CheckIcon,
  ClipboardIcon,
  HeadphonesIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react"

import type { AiChatMessage as AiChatMessageData, DemoAgentId } from "@/lib/ai-chat-data"
import { getDemoAgent } from "@/lib/ai-chat-data"
import { Button } from "@/components/ui/button"

type AiChatMessageProps = {
  message: AiChatMessageData
  onCopy: (content: string) => void
  onRetry: (messageId: string) => void
}

function AgentIcon({ agentId, className }: { agentId: DemoAgentId; className?: string }) {
  if (agentId === "research") return <SparklesIcon aria-hidden="true" className={className} />
  if (agentId === "support") return <HeadphonesIcon aria-hidden="true" className={className} />
  return <BotIcon aria-hidden="true" className={className} />
}

function renderInlineMarkdown(value: string) {
  const parts = value.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${index}-${part}`} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${index}-${part}`} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">{part.slice(1, -1)}</code>
    }
    return <span key={`${index}-${part}`}>{part}</span>
  })
}

function renderMarkdown(content: string) {
  const lines = content.split("\n")
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (line.startsWith("```")) {
      const language = line.slice(3).trim()
      const codeLines: string[] = []
      index += 1
      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push(
        <pre key={`code-${index}`} className="my-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">
          {language && <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{language}</span>}
          <code className="font-mono">{codeLines.join("\n")}</code>
        </pre>,
      )
      continue
    }

    const unordered = /^\s*[-*]\s+/.test(line)
    const ordered = /^\s*\d+\.\s+/.test(line)
    if (unordered || ordered) {
      const items: string[] = []
      const pattern = unordered ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/
      while (index < lines.length && pattern.test(lines[index])) {
        items.push(lines[index].replace(pattern, ""))
        index += 1
      }
      const List = unordered ? "ul" : "ol"
      blocks.push(
        <List key={`list-${index}`} className={`my-2 flex flex-col gap-1.5 pl-5 ${unordered ? "list-disc" : "list-decimal"}`}>
          {items.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}>{renderInlineMarkdown(item)}</li>)}
        </List>,
      )
      continue
    }

    if (!line.trim()) {
      index += 1
      continue
    }

    const paragraph: string[] = []
    while (index < lines.length && lines[index].trim() && !lines[index].startsWith("```") && !/^\s*[-*]\s+/.test(lines[index]) && !/^\s*\d+\.\s+/.test(lines[index])) {
      paragraph.push(lines[index])
      index += 1
    }
    blocks.push(<p key={`paragraph-${index}`} className="my-1 leading-relaxed">{paragraph.map((text, lineIndex) => <span key={`${lineIndex}-${text}`}>{lineIndex > 0 && <br />}{renderInlineMarkdown(text)}</span>)}</p>)
  }

  return blocks
}

export function AiChatMessage({ message, onCopy, onRetry }: AiChatMessageProps) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center py-2" role="status">
        <p className="flex max-w-full items-center gap-2 rounded-full border bg-muted/70 px-3 py-1.5 text-center text-xs text-muted-foreground">
          <AlertCircleIcon aria-hidden="true" className="size-3.5 shrink-0" />
          <span>{message.content}</span>
        </p>
      </div>
    )
  }

  if (message.role === "user") {
    return (
      <article className="flex justify-end py-2">
        <div className="flex max-w-[min(88%,42rem)] flex-col items-end gap-1.5">
          <div className="rounded-2xl rounded-br-md border bg-muted px-4 py-3 text-sm text-foreground">
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
          <time className="px-1 text-[11px] text-muted-foreground">{message.timestamp}</time>
        </div>
      </article>
    )
  }

  const agentId = message.agentId ?? "general"
  const agent = getDemoAgent(agentId)
  const isActive = message.status === "thinking" || message.status === "streaming"

  return (
    <article className="flex justify-start py-2">
      <div className="flex w-full max-w-[min(94%,48rem)] items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground">
          <AgentIcon agentId={agentId} className="size-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold">{agent.name}</span>
            <span className="rounded border bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Demo-generated</span>
            {message.status === "completed" && message.content && (
              <Button type="button" size="icon-xs" variant="ghost" className="ml-auto" aria-label={`Copy response from ${agent.name}`} title="Copy response" onClick={() => onCopy(message.content)}>
                <ClipboardIcon />
              </Button>
            )}
          </div>
          {message.status === "thinking" ? (
            <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-3 text-sm text-muted-foreground" role="status">
              <LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin" />
              Preparing a local demo response…
            </div>
          ) : message.status === "error" ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm" role="alert">
              <p className="flex items-center gap-2 text-destructive"><AlertCircleIcon aria-hidden="true" className="size-4 shrink-0" />The demo response could not be generated.</p>
              <Button type="button" size="sm" variant="outline" onClick={() => onRetry(message.id)}>
                <RotateCcwIcon data-icon="inline-start" />Retry demo response
              </Button>
            </div>
          ) : (
            <div className="rounded-xl rounded-tl-sm border bg-card px-4 py-3 text-sm text-card-foreground">
              {message.content ? <div className="min-w-0 break-words">{renderMarkdown(message.content)}</div> : <p className="text-sm text-muted-foreground">Response stopped before any text was generated.</p>}
              {message.status === "stopped" && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                  <span className="text-xs text-muted-foreground">Response stopped</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => onRetry(message.id)}><RotateCcwIcon data-icon="inline-start" />Retry</Button>
                </div>
              )}
              {message.status === "streaming" && <span className="ml-1 inline-block size-1.5 animate-pulse rounded-full bg-primary align-middle" aria-label="Response is streaming" />}
            </div>
          )}
          <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
            <time>{message.timestamp}</time>
            {message.status === "completed" && <><span aria-hidden="true">·</span><CheckIcon aria-hidden="true" className="size-3" /><span>Complete</span></>}
            {message.status === "stopped" && <><span aria-hidden="true">·</span><span>Stopped</span></>}
            {isActive && message.status === "streaming" && <><span aria-hidden="true">·</span><span>Generating demo response</span></>}
          </div>
        </div>
      </div>
    </article>
  )
}
