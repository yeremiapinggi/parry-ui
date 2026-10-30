import type { Metadata } from "next"
import Link from "next/link"

import { RegisterForm } from "@/components/auth-templates"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Register · Templates · Parry UI",
  description: "A split-screen sign-up page with password rules, terms consent, and social sign-up.",
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
  { title: "Mode Switch", text: "The same Login / Sign Up links as the Login page, with Sign Up marked as the current page." },
  { title: "Account Details", text: "Full name and work email, each with a visible label and autocomplete so browsers can fill them." },
  { title: "Password and Confirmation", text: "A new password with a live checklist of rules, and a confirmation field. Both have a show/hide toggle." },
  { title: "Terms Consent", text: "A required checkbox. Its error appears under it, not only as a red outline." },
  { title: "Primary Action", text: "One full-width Create account button with a pending state." },
  { title: "Social Sign-up", text: "Google, Microsoft, and SSO for teams that already use an identity provider." },
]

const interactionStates = [
  ["Default", "Empty fields; every password rule shows as not met."],
  ["Live Password Rules", "Each rule turns green with a check icon as it is met, and screen readers hear met or not met for each rule."],
  ["Validation Error", "Submitting shows an error under every invalid field and focuses the first one, top to bottom."],
  ["Mismatch", "If the confirmation differs from the password, only the confirmation field shows an error."],
  ["Pending", "Fields and buttons are disabled and Create account shows a spinner for a moment."],
  ["Success", "A toast confirms the preview account and both password fields are cleared; no server is contacted."],
]

const doGuidelines = [
  "Show password rules before people type, and update them as they type.",
  "Use autocomplete=\"new-password\" so password managers offer to generate one.",
  "Ask only for what you need to create the account; collect the rest after sign-up.",
  "Keep the terms checkbox unchecked by default.",
  "Keep a clear Log in link for people who already have an account.",
]

const dontGuidelines = [
  "Do not show rules only after a failed submit.",
  "Do not clear the name and email when the password is rejected.",
  "Do not rely on green and red alone; pair them with icons and text.",
  "Do not hide the terms text inside a tooltip.",
  "Do not ask for the password a third time.",
]

export default function RegisterPage() {
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
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Register</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A split-screen sign-up page with live password rules, terms consent, and social sign-up. Use the live preview to try the rules, validation, and the pending state.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Register uses the same split layout as Login so switching between them does not move the page. It asks for the minimum needed to create an account and shows password rules as people type.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Compare <Link href="/templates/login" className="font-medium text-link hover:underline">Login</Link> for returning people and <Link href="/templates/change-password" className="font-medium text-link hover:underline">Change Password</Link>, which reuses the same password rules.
          </p>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Type a password to watch the rules update, submit with empty or mismatched fields to see validation, or complete the form. Nothing leaves this browser.</p>
          </div>
          <div className="rounded-lg border bg-background p-4 sm:p-6">
            <RegisterForm />
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
          <p className="leading-relaxed text-muted-foreground">Keep the account fields, password rules, and terms consent as the core. Social sign-up and the testimonial panel are optional.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Core structure</CardTitle><CardDescription>Recommended for every sign-up page</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Name and work email", "Live password rules", "Password confirmation", "Terms consent", "Log in link"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Optional</CardTitle><CardDescription>Use only when the product needs them</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Google sign-up", "Microsoft sign-up", "SSO", "Testimonial panel", "Login / Sign Up switch"].map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}
            </CardContent>
          </Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">The preview covers the full path from an empty form through live rules, validation, and the pending state to success.</p>
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
          <p className="leading-relaxed text-muted-foreground">Make the rules visible up front so people get the password right the first time.</p>
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
            {["button", "checkbox", "input", "label", "separator", "sonner", "tabs"].map((name) => (
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
