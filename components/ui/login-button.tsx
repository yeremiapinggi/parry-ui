import * as React from "react"
import { LogInIcon, MailIcon, UserPlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SocialIcon, type SocialProvider } from "@/components/ui/social-button"

const intents = {
  login: { label: "Log in", icon: <LogInIcon /> },
  signup: { label: "Sign up", icon: <UserPlusIcon /> },
  email: { label: "Continue with email", icon: <MailIcon /> },
} as const

function LoginButton({
  intent = "login",
  provider,
  hideIcon = false,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  intent?: keyof typeof intents
  // A provider logo replaces the intent icon, e.g. "Sign in with GitHub".
  provider?: SocialProvider
  hideIcon?: boolean
}) {
  const { label, icon } = intents[intent]

  return (
    <Button data-slot="login-button" {...props}>
      {!hideIcon && (provider ? <SocialIcon provider={provider} /> : icon)}
      {children ?? label}
    </Button>
  )
}

export { LoginButton }
