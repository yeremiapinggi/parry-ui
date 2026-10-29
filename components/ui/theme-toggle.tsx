"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

function ThemeToggle({
  variant = "outline",
  showLabel = false,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> & {
  showLabel?: boolean
}) {
  const { resolvedTheme, setTheme } = useTheme()

  // Icons and labels swap via the .dark class, so no mounted check is needed to avoid a hydration mismatch.
  return (
    <Button
      data-slot="theme-toggle"
      variant={variant}
      size={showLabel ? "default" : "icon"}
      aria-label={showLabel ? undefined : "Toggle light/dark theme"}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      {...props}
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
      {showLabel && (
        <>
          <span className="dark:hidden">Light</span>
          <span className="hidden dark:inline">Dark</span>
        </>
      )}
    </Button>
  )
}

export { ThemeToggle }
