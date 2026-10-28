# Todo: Authentication templates

See `tasks/auth-plan.md` for decisions and the acceptance criteria.

## Phase 1: Shared layout + Login
- [x] T1a `components/auth-layout.tsx`: AuthLayout, AuthTestimonialPanel (gradient + 3-item carousel), PasswordInput, SocialSignInButtons (Google/Microsoft SVG, SSO)
- [x] T1b `components/auth-templates.tsx`: LoginForm with validation, pending state, toast
- [x] T1c `app/templates/login/page.tsx` doc page (settings-form section structure)
- [x] T1d Gallery: `Authentication` category, `login` entry, LoginThumbnail, thumbnail and preview branches
- [x] T1e Verify: lint, build, preview at desktop and 375px, light and dark, keyboard pass
- [ ] **Checkpoint A: user reviews Login against the reference**

## Phase 2: Remaining screens
- [x] T2 Register: form, `/templates/register` doc page, gallery entry and thumbnail, verify
- [ ] T3 Forgot Password: form + "check your email" state, `/templates/forgot-password`, gallery, verify
- [ ] T4 Change Password: form, `/templates/change-password`, gallery, verify

## Final
- [ ] Cross-links between the 4 templates work
- [ ] `npm run lint`, `npm run build`, `npm run check:contrast` pass
- [ ] **Checkpoint B: user review**
