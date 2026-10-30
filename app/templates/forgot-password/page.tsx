import type { Metadata } from "next"
import Link from "next/link"

import { ForgotPasswordForm } from "@/components/auth-templates"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Forgot Password · Templates · Parry UI",
  description: "A two-step password recovery page: request a reset link, then confirm it was sent.",
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
  { title: "Heading", text: "Says what happened and what to do next in one line." },
  { title: "Email Field", text: "One field with a visible label and email autocomplete." },
  { title: "Primary Action", text: "Send reset link, with a pending state while the request runs." },
  { title: "Confirmation", text: "Replaces the form after submit. Shows a masked address and how long the link stays valid. Focus moves to its heading." },
  { title: "Resend with Cooldown", text: "Resend is disabled for 30 seconds after each send, with the countdown shown in the button." },
  { title: "Way Back", text: "A Back to login link on both steps and a way to try a different email." },
]

const interactionStates = [
  ["Default", "Empty email field and an enabled Send reset link button."],
  ["Validation Error", "A blank or malformed email shows an inline error and keeps focus on the field."],
  ["Pending", "The field and button are disabled and the button reads Sending… for a moment."],
  ["Link Sent", "The form is replaced by a confirmation with the masked address; screen readers land on its heading."],
  ["Cooldown", "Resend link counts down from 30 seconds before it can be used again."],
  ["Different Email", "Use a different email returns to the form with the previous address still filled in."],
]

const doGuidelines = [
  "Show the same confirmation whether or not the account exists, so the page doesn't reveal who has an account.",
  "Mask the address in the confirmation instead of echoing it in full.",
  "Say how long the link stays valid.",
  "Rate-limit resends and show the remaining wait in the button.",
  "Keep a path back to login on every step.",
]

const dontGuidelines = [
  "Do not say \"No account found\" for unknown addresses.",
  "Do not send the new password by email.",
  "Do not ask security questions as a replacement for the email link.",
  "Do not clear the typed address when people choose to try a different email.",
  "Do not put social sign-in on this page; it is a recovery flow, not a login.",
]

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">Templates</Link>
            <span aria-hidden="true">/</span>
            <span>Authentication</span>
          </div>
          <Badge variant="secondary">Page template</Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Forgot Password</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A two-step password recovery page: request a reset link, then confirm it was sent. Use the live preview to try validation, the confirmation step, and the resend cooldown.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Forgot Password asks for one thing, the email, and then confirms the link was sent without saying whether the account exists. It uses the same split layout as Login.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            The reset link would open <Link href="/templates/change-password" className="font-medium text-link hover:underline">Change Password</Link>, where people set the new password.
          </p>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Submit an empty or malformed email to see validation, then a valid one to see the confirmation and resend cooldown. No email is sent.</p>
          </div>
          <div className="rounded-lg border bg-background p-4 sm:p-6">
            <ForgotPasswordForm />
          </div>
        </section>

        <section id="anatomy" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="anatomy-heading">
          <h2 id="anatomy-heading" className={sectionHeading}>Anatomy</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {anatomy.map((item) => (
              <Card key={item.title} className="gap-2 py-4">
                <CardHeader className="pb-0"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="features-variants" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className={sectionHeading}>Features &amp; Variants</h2>
          <p className="leading-relaxed text-muted-foreground">Keep the single email field, the neutral confirmation, and the way back to login as the core. The testimonial panel is optional.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Core structure</CardTitle><CardDescription>Recommended for every recovery page</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Email field", "Inline validation", "Neutral confirmation", "Masked address", "Back to login"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Optional</CardTitle><CardDescription>Use only when the product needs them</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Resend cooldown", "Link expiry note", "Use a different email", "Testimonial panel"].map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}
            </CardContent>
          </Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">The preview covers the request step, the confirmation step, and the resend cooldown.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {interactionStates.map(([title, text]) => (
              <Card key={title} className="gap-2 py-4">
                <CardHeader className="pb-0"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="usage-guidelines" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="guidelines-heading">
          <h2 id="guidelines-heading" className={sectionHeading}>Usage Guidelines</h2>
          <p className="leading-relaxed text-muted-foreground">Get people back into their account without revealing which accounts exist.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Do</CardTitle></CardHeader>
              <CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{doGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Don&apos;t</CardTitle></CardHeader>
              <CardContent><ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">{dontGuidelines.map((item) => <li key={item}>{item}</li>)}</ul></CardContent>
            </Card>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">Below 1024px the testimonial panel is hidden and the form takes the full width of the card.</p>
        </section>

        <section id="components-used" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="components-heading">
          <h2 id="components-heading" className={sectionHeading}>Components Used</h2>
          <p className="leading-relaxed text-muted-foreground">The template composes existing Parry UI controls and shares its layout with the other authentication templates.</p>
          <div className="flex flex-wrap gap-2">
            {["button", "input", "label", "sonner"].map((name) => (
              <Link key={name} href={`/components#${name}`} className="rounded-md border bg-card px-2.5 py-1.5 font-mono text-xs text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{name}</Link>
            ))}
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">Explore <Link href="/components" className="font-medium text-link hover:underline">all Parry UI components</Link> or return to the <Link href="/templates" className="font-medium text-link hover:underline">Templates catalog</Link>.</p>
        </section>
      </article>
      <aside className="hidden py-10 xl:block">
        <div className="sticky top-24"><DocsToc items={toc} /></div>
      </aside>
    </div>
  )
}
