import { Report } from "@/components/blocks/report-01/components/report"

export const meta = {
  id: "report-01",
  title: "Report",
  description: "Report types, filters and a sortable, paginated table with loading and empty states.",
  category: "Main pages",
} as const

export default function Report01() {
  return <Report />
}
