import { Dashboard } from "@/components/blocks/dashboard-01/components/dashboard"

export const meta = {
  id: "dashboard-01",
  title: "Dashboard",
  description: "Team KPIs, tickets per channel, response time trend, sentiment split and agent performance.",
  category: "Main pages",
} as const

export default function Dashboard01() {
  return <Dashboard />
}
