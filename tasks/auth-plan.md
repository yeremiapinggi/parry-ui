# Implementation Plan: Authentication templates

## Overview
Add four page templates (Login, Register, Forgot Password and Change Password) to the Parry UI templates catalog.
The layout follows the reference screenshot: a split-screen card with the form column on the left and a visual panel
on the right. It is built only from existing `components/ui/*` primitives and theme tokens. Like the other
templates, each one gets a doc page at `/templates/<slug>` and a card in the gallery with a thumbnail and a live preview.

## Decisions (agreed with the user on 2026-10-28)
- **4 templates on 1 shared layout.** Slugs: `login`, `register`, `forgot-password`, `change-password`.
- **One `AuthLayout` component** (`components/auth-layout.tsx`) owns the split screen and the right-hand testimonial panel.
  The four form components plug into it as `children`. On screens narrower than `lg`, the right panel is hidden.
- **Social providers: Google, Microsoft, SSO.** Lucide 1.x ships no brand icons, so Google and Microsoft are small
  inline SVGs inside the auth components; SSO uses lucide `KeyRound`. No new dependency.
- **Right panel: token gradient + testimonial carousel.** The gradient is built from `--sidebar` (Midnight) and `--ring`
  (Frost Blue), so no image asset is needed. The glass card uses `bg-white/10 backdrop-blur` with prev/next `Button variant="ghost" size="icon"`.
  The carousel is local `useState` over 3 fictional testimonials, has an `aria-live="polite"` region, and does not auto-rotate.
- **Login / Sign Up switcher** = existing `Tabs` (`TabsList` + `TabsTrigger`). Each trigger links to the sibling
  template; no new segmented control.
- **Password show/hide** = `Input` + an absolutely positioned `Button variant="ghost" size="icon-sm"` (lucide `Eye`/`EyeOff`)
  with `aria-label` and `aria-pressed`. Shared as `PasswordInput` inside `auth-layout.tsx`, not added to `components/ui`.
- **"OR" divider** = `Separator` + a muted label.
- **Primary CTA** = `Button` default variant (already Midnight via `--primary`), `size="lg"`, `w-full`.
- **Links** (Forgot password?, Sign up) use the `text-link` token, as the other templates do.
- **Demo-only behavior**, matching existing templates: client-side validation, a simulated pending state of about 800ms, a `sonner`
  toast on success, and no network calls. Copy states that this is a preview.

## Reused, not built
`Button`, `Input`, `Label`, `Tabs`, `Separator`, `Checkbox` (remember me, accept terms), `Alert` (form-level error),
`Card` (none: the outer split card is a plain bordered `div`, as in the reference), `sonner` toast, `DocsToc`, and the doc page
section structure from `app/templates/settings-form/page.tsx`.

## Dependency graph
```
AuthLayout + PasswordInput + provider buttons   (T1, built with Login)
   ├── LoginForm            → /templates/login doc page → gallery entry   (T1)
   ├── RegisterForm         → /templates/register        → gallery entry   (T2)
   ├── ForgotPasswordForm   → /templates/forgot-password → gallery entry   (T3)
   └── ChangePasswordForm   → /templates/change-password → gallery entry   (T4)
Gallery: new "Authentication" category + thumbnails (added per task)        (T1–T4)
```
T2 to T4 depend only on T1. Once T1 lands they are independent of each other, but all of them edit
`components/templates-gallery.tsx`, so build them one after another, not in parallel.

## Tasks (vertical slices)

### Phase 1: Shared layout + Login
**T1. Login template end to end**
- `components/auth-layout.tsx`: `AuthLayout`, `AuthTestimonialPanel`, `PasswordInput`, `SocialSignInButtons`.
- `components/auth-templates.tsx`: `LoginForm` (email, password with toggle, "Forgot password?" link, Log In,
  OR divider, Google/Microsoft/SSO buttons, and a "Don't have an account? Sign up" footer).
- `app/templates/login/page.tsx`: a doc page with the same sections as settings-form (Overview, Live Preview,
  Anatomy, Features & Variants, Interaction States, Usage Guidelines, Components Used).
- `components/templates-gallery.tsx`: add `"Authentication"` to `TemplateCategory`, the `login` entry, a
  `LoginThumbnail`, and the branches in the thumbnail and preview ternaries.

Acceptance:
- [ ] `/templates/login` renders the split layout at ≥1024px and the form alone at 375px with no horizontal scroll.
- [ ] Empty or invalid email and an empty password show inline errors linked by `aria-describedby`; the first invalid field gets focus.
- [ ] The show/hide toggle works by keyboard and announces its state.
- [ ] Valid submit → button pending state → success toast; no network request.
- [ ] Testimonial prev/next cycles through 3 items and is keyboard reachable.
- [ ] Light and dark both read correctly (right panel stays dark in both).
- [ ] A Login card appears under the "Authentication" filter in `/templates`, and its preview dialog shows the live form.

Verify: `npm run lint`, `npm run build`, then the preview at `/templates/login` and `/templates` at desktop + mobile, light + dark.

### Checkpoint A
The user reviews the Login page against the reference before the pattern is copied to three more screens.

### Phase 2: Remaining screens (one task each, same slice shape as T1)
**T2. Register**: full name, work email, password with a strength hint (length ≥8 plus letter and number, shown as text and not
by color alone), confirm password, "I agree to the Terms" checkbox, Create account, social buttons, and an "Already have an
account? Log in" footer. The Tabs switcher has Sign Up active.

**T3. Forgot Password**: email field and Send reset link. On submit the form swaps to a "Check your email" state
(icon, the masked email, a Resend link with a 30s cooldown, and Back to login). No tabs and no social buttons.

**T4. Change Password**: current password, new password, and confirm new password with the same strength hint as Register;
it errors when the new password equals the current one or the confirmation doesn't match. On success it shows a toast and the
form resets. A "Back to login" link sits in the header (this screen also works as a reset-from-link page).

Acceptance for each: the same checklist as T1 where it applies, plus the screen-specific validation above, plus
a gallery card and thumbnail under "Authentication".

Verify for each: `npm run lint`, `npm run build`, and a preview check of the new route + gallery.

### Checkpoint B (final)
- [ ] All 4 routes build; the gallery "Authentication" filter shows 4 cards.
- [ ] Cross-links between templates work (Login ↔ Register ↔ Forgot ↔ Change).
- [ ] `npm run check:contrast` still passes (no new tokens expected).
- [ ] The user reviews.

## Out of scope
Real auth, a backend or OAuth wiring, middleware/route protection, an OTP/2FA screen, registry (`public/r`) items for
the auth templates, and a photo asset for the right panel.

## Risks
- `templates-gallery.tsx` already has long slug ternaries; four more branches make them longer. Follow the existing pattern
  now and leave the refactor to its own task.
- The `backdrop-blur` glass card over a gradient may fall below text contrast in light mode. Keep the panel dark in both themes.
