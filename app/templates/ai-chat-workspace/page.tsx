import type { Metadata } from "next"
import Link from "next/link"

import { AiChatWorkspace } from "@/components/ai-chat-workspace"
import { TemplateDocumentationLayout } from "@/components/template-documentation-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "AI Chat Workspace · Templates · Parry UI",
  description: "An interactive AI chat workspace with agent selection, conversation history, and AI response states.",
}

const toc = [
  { id: "overview", label: "Overview" },
  { id: "live-preview", label: "Live Preview" },
  { id: "anatomy", label: "Anatomy" },
  { id: "features-variants", label: "Features & Variants" },
  { id: "interaction-states", label: "Interaction States" },
  { id: "usage-guidelines", label: "Usage Guidelines" },
  { id: "components-used", label: "Components Used" },
]

const sectionHeading = "scroll-mt-24 font-heading text-2xl font-semibold tracking-tight"

const anatomy = [
  { title: "Conversation Sidebar", text: "Starts chats, searches titles, groups recent history, identifies each conversation’s agent, and exposes rename or confirmed-delete actions. Collapse it independently on desktop or open it as a mobile panel." },
  { title: "Agent Header", text: "Keeps the current agent and conversation title visible without introducing another application shell or global navigation." },
  { title: "Message History", text: "Presents right-aligned user turns, left-aligned agent responses, system notices, timestamps, response states, safe Markdown formatting, and copy or retry actions." },
  { title: "Agent Selector", text: "Shows the selected agent’s description and availability. Switching an existing chat keeps its transcript and adds a system notice." },
  { title: "Composer", text: "Maintains a draft per conversation, grows with multiline input, sends on Enter, preserves Shift + Enter for new lines, and offers stop-generation control." },
  { title: "Local Response Status", text: "Simulates thinking, streaming, completion, failure, retry, and cancellation using deterministic local content only." },
]

const features = [
  "New conversations and generated titles",
  "Conversation history grouped by date",
  "Search, rename, and confirmed deletion",
  "Three fictional AI agents with availability",
  "Agent switching with retained transcript",
  "Drafts preserved between conversations",
  "Auto-growing composer and keyboard shortcuts",
  "Thinking and simulated streaming states",
  "Stop, error, and retry interactions",
  "Readable Markdown and copy response",
  "Responsive and independently collapsible sidebar",
  "Local-only state with no backend or AI API",
]

const states = [
  ["Initial Empty Chat", "Load the template to see the selected General Assistant, example prompts, and the unselected conversation state."],
  ["New Conversation", "Choose New chat and submit the first message. A local conversation record and short title are created at that point."],
  ["Active Conversation", "Choose any history item to inspect its agent association and retained transcript."],
  ["AI Thinking and Streaming", "Send a message and watch the local response move from thinking to incremental text."],
  ["Completed Response", "Completed messages show the demo-generated label, timestamp, Markdown, and a copy action."],
  ["Response Error and Retry", "Send the exact prompt “simulate error” to inspect a deterministic error state. Retry the response to complete it."],
  ["Response Stopped", "Select Stop generating while text is streaming. The timer is cancelled, the partial response remains, and Retry is available."],
  ["Agent Switched", "Change agents from the composer selector in an existing chat. The transcript remains and a system notice records the switch."],
  ["Sidebar Collapsed", "Use the sidebar control at desktop widths to switch between the full history and the compact rail."],
  ["No Search Results", "Search for a title that does not exist to view the empty search state."],
  ["Conversation Deleted", "Use a conversation’s action menu and confirm deletion. Deleting the active conversation returns to the empty chat state."],
]

const useCases = ["AI Agent Chat", "Internal AI Assistant", "Knowledge Assistant", "AI Research Workspace"]
const componentLinks = ["alert-dialog", "badge", "button", "dialog", "dropdown-menu", "input", "textarea"]

export default function AiChatWorkspacePage() {
  return (
    <TemplateDocumentationLayout items={toc} maxWidth="wide">
      
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Workspaces</span></div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">AI Chat Workspace</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">An interactive AI chat workspace with agent selection, conversation history, and AI response states.</p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">AI Chat Workspace is a reusable interface for working with AI agents across multiple conversations. It brings together searchable chat history, per-conversation drafts, an agent selector, readable response states, and a focused composer. Sociomile Agentics is the fictional demo scenario; the component structure stays product-neutral.</p>
          <p className="leading-relaxed text-muted-foreground">All conversations and responses are local demo content held in shared React state while the preview is open. Responses are deterministic and explicitly marked as demo-generated. No model, external AI API, backend, or persistent storage is connected.</p>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Create chats, change agents, preserve drafts between conversations, and inspect the simulated thinking, streaming, stop, error, retry, copy, and delete states.</p></div>
          <div className="rounded-xl border bg-card p-2 sm:p-4"><AiChatWorkspace /></div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
          <Card><CardHeader><CardTitle className="text-base">Included interactions</CardTitle><CardDescription>Available in the local demo workspace</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{features.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">One template, multiple use cases</CardTitle><CardDescription>Keep the interaction model reusable and product-neutral</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{useCases.map((useCase) => <Badge key={useCase} variant="outline">{useCase}</Badge>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">AI Chat Workspace and Conversation Workspace</CardTitle><CardDescription>Two different jobs, not alternate names for the same surface</CardDescription></CardHeader><CardContent className="grid gap-4 text-sm leading-relaxed text-muted-foreground md:grid-cols-2"><div><p className="font-medium text-foreground">AI Chat Workspace</p><p>Supports agent selection, AI-oriented prompts, Markdown responses, local generation states, and continuing work across assistant conversations.</p></div><div><p className="font-medium text-foreground">Conversation Workspace</p><p>Supports customer-service operations: human-agent replies, customer context, assignment, status and priority, internal notes, and conversation workflow actions.</p></div></CardContent></Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">Use the live preview to inspect each state. The failure path is intentionally discoverable: send “simulate error” once, then retry to complete the local demo response.</p>
          <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
          <p className="leading-relaxed text-muted-foreground">Use this pattern when the primary workflow is a person working with an assistant, rather than an operator processing customer conversations.</p>
          <Card><CardHeader><CardTitle className="text-base">Good fits</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Design principles</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Keep the transcript readable and its width comfortable for longer answers.</li><li>Preserve drafts and conversation history when switching sessions.</li><li>Keep the active agent visible and disclose agent changes in the transcript.</li><li>Make thinking, streaming, stopped, and error states explicit and recoverable.</li><li>Clearly label local or simulated answers; never imply a live model is connected.</li></ul></CardContent></Card>
          <p className="text-sm leading-relaxed text-muted-foreground">The Sociomile Agentics names and conversations in this preview are fictional. Do not enter sensitive information.</p>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The workspace composes Parry UI semantic tokens with existing primitives for actions, agent selection, message entry, and confirmation dialogs.</p>
          <div className="flex flex-wrap gap-2">{componentLinks.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
          <Separator />
          <p className="text-sm text-muted-foreground">Compare with the <Link href="/templates/conversation-workspace" className="font-medium text-link hover:underline">Conversation Workspace</Link>, explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link>, or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
    </TemplateDocumentationLayout>
  )
}
