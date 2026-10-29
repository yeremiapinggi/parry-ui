import type { Metadata } from "next"
import Link from "next/link"

import { ConversationWorkspacePreview } from "@/components/conversation-workspace-preview"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Conversation Workspace · Templates · Parry UI",
  description: "An interactive workspace for managing customer conversations, replying to messages, and handling conversation workflows.",
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
  { title: "Conversation List", text: "Searches and filters conversations by status, with customer identity, channel, latest message, time, unread count, bookmark, and current state in each row." },
  { title: "Conversation Header", text: "Keeps customer, channel, conversation ID, status, and assignee visible, with assignment, priority, bookmark, transfer, and status actions close to the thread." },
  { title: "Message Timeline", text: "Separates incoming replies, outgoing replies, and workspace-only internal notes; supports date markers, timestamps, delivery state, images, and files." },
  { title: "Composer", text: "Maintains drafts per conversation, supports reply and internal-note modes, validates demo attachments, and keeps the action area anchored below the thread." },
  { title: "Customer Details", text: "Groups contact information, editable assignee and priority, conversation metadata, tags, and recent activity into collapsible sections." },
  { title: "Responsive Navigation", text: "Uses independently collapsible panels on desktop, list and details drawers on tablet, and a list-to-thread flow with a details drawer on mobile." },
]

const features = [
  "Search and status filters", "Unread count and read-on-open behavior", "Reply and internal-note modes", "Per-conversation drafts", "Image and file attachments", "Delivery and failure states", "Assign to me or an agent", "Priority and status management", "Transfer and close confirmation", "Reopen confirmation", "Bookmark conversations", "Shared demo data with Conversation Table",
]

const states = [
  ["No Conversation Selected", "Clear the selection from the demo-state control to inspect the empty workspace prompt."],
  ["Active, unread, and empty thread", "Select a conversation to mark its unread count as read; use the state control to inspect an empty message timeline."],
  ["Open, In Progress, Pending, and Closed", "Change status from the header menu. Replies move Open or Pending conversations to In Progress; Closed conversations remain read-only until reopened."],
  ["Sending, sent, and failed", "A demo send shows a short Sending state before Sent. Select Failed send to inspect recovery while preserving the draft."],
  ["Unassigned and assigned", "Assign to yourself, choose an agent, or transfer with confirmation. Changes also appear in the Conversation Table."],
  ["No search results and loading", "Search for a nonexistent customer or use the Loading demo state to inspect unavailable-list feedback."],
  ["Transfer and reopen confirmation", "Transfer, close, and reopen actions explain their effects before applying a demo update."],
]

const guidelines = [
  "Keep the latest message visible and keep the composer anchored at the bottom of the thread.",
  "Use explicit labels in addition to status, priority, and channel colors or icons.",
  "Make internal notes visually distinct and identify them as workspace-only content.",
  "Preserve each conversation’s unsent draft when the agent switches threads.",
  "Ask for confirmation before closing, transferring, or reopening a conversation.",
]

const componentLinks = ["avatar", "badge", "button", "dialog", "dropdown-menu", "input", "select", "tabs", "textarea", "toggle-group"]

export default function ConversationWorkspacePage() {
  return <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
    <article className="flex min-w-0 flex-col gap-12 py-10">
      <header className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/templates" className="hover:text-foreground">Templates</Link><span aria-hidden="true">/</span><span>Workspaces</span></div>
        <Badge variant="secondary">Page template</Badge>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Conversation Workspace</h1>
        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">An interactive workspace for managing customer conversations, replying to messages, and handling conversation workflows.</p>
      </header>

      <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
        <p className="leading-relaxed text-muted-foreground">Conversation Workspace is an agent-facing surface for reading and responding to customer conversations with the context needed to take the next action. It combines an omnichannel inbox, a threaded timeline, a message composer, and an editable customer profile in one responsive layout.</p>
        <p className="leading-relaxed text-muted-foreground"><strong className="font-medium text-foreground">Conversation Table</strong> is optimized for queue triage across many records: compare SLA, priority, status, and assignment, then perform row or bulk actions. <strong className="font-medium text-foreground">Conversation Workspace</strong> is optimized for working one record: inspect the full thread, reply or add an internal note, and update the conversation while keeping customer details visible. Open any record from the Conversation Table preview to enter its workspace without losing the table filters or page.</p>
        <p className="leading-relaxed text-muted-foreground">The live preview uses deterministic fictional records and a shared in-memory dataset with Conversation Table. Assignment, status, priority, bookmarks, and replies remain consistent during the current browser session; no real messaging service, backend, or persistent storage is connected.</p>
      </section>

      <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
        <div className="flex flex-col gap-1"><h2 id="preview-heading" className={sectionHeading}>Live Preview</h2><p className="text-sm leading-relaxed text-muted-foreground">Select a thread, change its status or assignment, preserve drafts across threads, add a note, or send a simulated reply. The preview state control exposes key empty, loading, and error states.</p></div>
        <ConversationWorkspacePreview />
      </section>

      <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
        <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
        <div className="grid gap-3 sm:grid-cols-2">{anatomy.map((item) => <Card key={item.title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent></Card>)}</div>
      </section>

      <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
        <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
        <Card><CardHeader><CardTitle className="text-base">Included interactions</CardTitle><CardDescription>Available in the local demo workspace</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{features.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Choose the conversation surface</CardTitle><CardDescription>Table and workspace solve complementary jobs</CardDescription></CardHeader><CardContent className="grid gap-4 text-sm leading-relaxed text-muted-foreground md:grid-cols-2"><div><p className="font-medium text-foreground">Conversation Table</p><p>A scannable queue for monitoring many conversations, filtering and sorting workload, comparing SLA and priority, and applying row or bulk actions.</p></div><div><p className="font-medium text-foreground">Conversation Workspace</p><p>A focused thread for reading message history, replying, adding internal notes, handling attachments, and updating one customer’s conversation in context.</p></div></CardContent></Card>
      </section>

      <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
        <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
        <p className="leading-relaxed text-muted-foreground">Use the live preview selector and conversation actions to inspect the documented states. All customer and message content is fictional.</p>
        <div className="grid gap-3 sm:grid-cols-2">{states.map(([title, text]) => <Card key={title} className="gap-2 py-4"><CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent></Card>)}</div>
      </section>

      <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
        <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
        <p className="leading-relaxed text-muted-foreground">Keep customer identity and the latest thread context easy to find, make response state explicit, and give agents a predictable path back to the queue.</p>
        <Card><CardHeader><CardTitle className="text-base">Design principles</CardTitle></CardHeader><CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{guidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>
        <p className="text-sm leading-relaxed text-muted-foreground">Attachments and message delivery are simulated locally. Do not use this preview to send real customer data or messages.</p>
      </section>

      <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
        <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
        <p className="leading-relaxed text-muted-foreground">The workspace composes Parry UI semantic tokens and existing shadcn primitives for conversation navigation, actions, forms, and dialogs.</p>
        <div className="flex flex-wrap gap-2">{componentLinks.map((name) => <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>)}</div>
        <Separator />
        <p className="text-sm text-muted-foreground">Compare with the <Link href="/templates/conversation-table" className="font-medium text-link hover:underline">Conversation Table</Link>, explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link>, or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
      </section>
    </article>
    <aside className="hidden py-10 xl:block"><div className="sticky top-24"><DocsToc items={toc} /></div></aside>
  </div>
}
