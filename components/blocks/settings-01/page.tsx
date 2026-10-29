import { Settings } from "@/components/blocks/settings-01/components/settings"

export const meta = {
  id: "settings-01",
  title: "Setting",
  description: "Settings navigation with the Channel section: channel cards, enable switches and an Add channel dialog.",
  category: "Main pages",
} as const

export default function Settings01() {
  return <Settings />
}
