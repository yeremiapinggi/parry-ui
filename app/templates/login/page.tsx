import type { Metadata } from "next"
import Link from "next/link"

import { LoginForm } from "@/components/auth-templates"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Login · Templates · Parry UI",
  description: "A split-screen login page with email and password, social sign-in, and a testimonial panel.",
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
  { title: "Mode Switch", text: "Links between Login and Sign Up. Each mode is its own page, so the switch is navigation, not tabs." },
  { title: "Heading", text: "A short welcome and one line that tells people what to enter." },
  { title: "Credentials", text: "Email and password fields with visible labels, a show/hide password toggle, and a Forgot password? link beside the label." },
  { title: "Primary Action", text: "One full-width Log In button that shows a pending state while the request runs." },
  { title: "Social Sign-in", text: "Google, Microsoft, and SSO options below an OR divider, for teams that use an identity provider." },
  { title: "Testimonial Panel", text: "A dark panel with a customer quote and previous/next controls. It is hidden on narrow screens so the form comes first." },
]

const interactionStates = [
  ["Default", "Empty fields with placeholders; the password is hidden."],
  ["Validation Error", "Submitting a blank or malformed email, or a blank password, shows an inline error under the field and focuses the first invalid one."],
  ["Password Visible", "The eye button toggles the password between hidden and plain text and reports its pressed state to assistive technology."],
  ["Pending", "Fields and buttons are disabled and the Log In button shows a spinner for a moment."],
  ["Success", "A toast confirms the preview login and the password field is cleared; no server is contacted."],
  ["Social Provider", "Choosing Google, Microsoft, or SSO shows a toast explaining that providers are not connected in this preview."],
]

const doGuidelines = [
  "Keep labels visible above fields; placeholders alone disappear once people type.",
  "Use autocomplete values (email, current-password) so password managers can fill the form.",
  "Show one generic error for wrong credentials so the page doesn't reveal which accounts exist.",
  "Keep the Forgot password? link next to the password field where people look for it.",
  "Offer the identity providers your customers actually use, and nothing else.",
]

const dontGuidelines = [
  "Do not block pasting into the password field.",
  "Do not clear the email field after a failed attempt.",
  "Do not auto-rotate the testimonial panel; moving content distracts from the form.",
  "Do not put the only path to sign up inside the decorative panel.",
  "Do not rely on red borders alone to show an error.",
]

export default function LoginPage() {
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
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Login</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A split-screen login page with email and password, social sign-in, and a testimonial panel. Use the live preview to try validation, the password toggle, and the pending state.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Login keeps the form in a narrow column on the left and gives the right half to a brand panel with customer quotes. The form works on its own, so the panel is hidden on narrow screens without losing any function.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Register, Forgot Password, and Change Password share the same layout, so people move between them without the page shifting around.
          </p>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Submit the empty form to see validation, toggle the password, or log in with any valid-looking email. Nothing leaves this browser.</p>
          </div>
          <div className="rounded-lg border bg-background p-4 sm:p-6">
            <LoginForm />
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
          <p className="leading-relaxed text-muted-foreground">Keep the credentials, primary action, and recovery link as the core. Social sign-in and the testimonial panel are optional and can be removed per product.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Core structure</CardTitle><CardDescription>Recommended for every login page</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Email and password", "Show/hide password", "Forgot password link", "Inline validation", "Sign up link"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Optional</CardTitle><CardDescription>Use only when the product needs them</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Google sign-in", "Microsoft sign-in", "SSO", "Testimonial panel", "Login / Sign Up switch"].map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}
            </CardContent>
          </Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">The preview covers the full path from an empty form through validation and the pending state to success.</p>
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
          <p className="leading-relaxed text-muted-foreground">Make logging in fast for returning people and recoverable for people who forgot their password.</p>
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
          <p className="leading-relaxed text-muted-foreground">The template composes existing Parry UI controls; the brand icons for Google and Microsoft are inline SVGs.</p>
          <div className="flex flex-wrap gap-2">
            {["button", "input", "label", "separator", "sonner", "tabs"].map((name) => (
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
