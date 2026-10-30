import type { Metadata } from "next"
import Link from "next/link"

import { ChangePasswordForm } from "@/components/auth-templates"
import { DocsToc } from "@/components/docs-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Change Password · Templates · Parry UI",
  description: "A password change page with the current password, live rules for the new one, and confirmation.",
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
  { title: "Back Link", text: "Back to login sits above the heading, so people can leave without submitting." },
  { title: "Current Password", text: "Confirms the person changing the password owns the account. Remove it when the page opens from a reset link." },
  { title: "New Password", text: "Shows the same live rules as Register and must differ from the current password." },
  { title: "Confirmation", text: "Catches typos in the new password before it is saved." },
  { title: "Primary Action", text: "One full-width Update password button with a pending state." },
  { title: "Testimonial Panel", text: "Shared with the other authentication templates and hidden on narrow screens." },
]

const interactionStates = [
  ["Default", "Three empty password fields; every rule shows as not met."],
  ["Validation Error", "Submitting shows an error under every invalid field and focuses the first one."],
  ["Same as Current", "A new password equal to the current one is rejected with its own message."],
  ["Mismatch", "If the confirmation differs from the new password, only the confirmation shows an error."],
  ["Pending", "Fields and the button are disabled and the button reads Updating… for a moment."],
  ["Success", "A toast confirms the change and all three fields are cleared; nothing is saved."],
]

const doGuidelines = [
  "Ask for the current password when someone is already logged in.",
  "Use the same password rules everywhere a password is created.",
  "Give every password field its own show/hide toggle.",
  "Sign out other sessions after a successful change, and say so.",
  "Use autocomplete values so password managers update the saved entry.",
]

const dontGuidelines = [
  "Do not accept the current password as the new one.",
  "Do not keep the passwords in the fields after a successful change.",
  "Do not hide the rules until after a failed submit.",
  "Do not email the new password to the user.",
  "Do not leave people without a way back.",
]

export default function ChangePasswordPage() {
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
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">Change Password</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A password change page with the current password, live rules for the new one, and confirmation. Use the live preview to try the rules and each validation case.
          </p>
        </header>

        <section id="overview" className="flex scroll-mt-24 flex-col gap-3" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={sectionHeading}>Overview</h2>
          <p className="leading-relaxed text-muted-foreground">
            Change Password verifies the current password, checks the new one against the shared rules, and confirms it. The same page works as the destination of a reset link once the current-password field is removed.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            It pairs with <Link href="/templates/forgot-password" className="font-medium text-link hover:underline">Forgot Password</Link>, which sends the reset link, and reuses the password rules from <Link href="/templates/register" className="font-medium text-link hover:underline">Register</Link>.
          </p>
        </section>

        <section id="live-preview" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="preview-heading">
          <div className="flex flex-col gap-1">
            <h2 id="preview-heading" className={sectionHeading}>Live Preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Try a weak password, reuse the current password, or mismatch the confirmation to see each error, then complete the form. Nothing leaves this browser.</p>
          </div>
          <div className="rounded-lg border bg-background p-4 sm:p-6">
            <ChangePasswordForm />
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
          <p className="leading-relaxed text-muted-foreground">Keep the new password, its rules, and the confirmation as the core. The current-password field depends on how people reach the page.</p>
          <Card>
            <CardHeader><CardTitle className="text-base">Core structure</CardTitle><CardDescription>Recommended for every password change page</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["New password", "Live password rules", "Confirmation", "Show/hide toggles", "Back to login"].map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Optional</CardTitle><CardDescription>Use only when the product needs them</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["Current password", "Different-from-current check", "Testimonial panel"].map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}
            </CardContent>
          </Card>
        </section>

        <section id="interaction-states" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="states-heading">
          <h2 id="states-heading" className={sectionHeading}>Interaction States</h2>
          <p className="leading-relaxed text-muted-foreground">The preview covers every validation case, the pending state, and success.</p>
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
          <p className="leading-relaxed text-muted-foreground">Make the new password easy to get right and hard to get wrong.</p>
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
          <p className="leading-relaxed text-muted-foreground">The template composes existing Parry UI controls and shares its layout and password rules with the other authentication templates.</p>
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
