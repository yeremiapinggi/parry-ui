"use client"

import { useSyncExternalStore } from "react"
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

const modes = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: LaptopIcon },
] as const

// The stored theme is only known on the client; render no selection on the server to avoid a hydration mismatch.
const useMounted = () => useSyncExternalStore(() => () => {}, () => true, () => false)

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <div data-slot="theme-switcher" role="group" aria-label="Theme mode" className="grid grid-cols-3 gap-2">
      {modes.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value
        return (
          <Button
            key={value}
            variant={active ? "default" : "outline"}
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className="h-auto flex-col gap-1 py-3"
          >
            <Icon />
            {label}
          </Button>
        )
      })}
    </div>
  )
}

export { ThemeSwitcher }
