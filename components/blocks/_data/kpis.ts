export type Kpi = { label: string; value: string; hint: string }

// ART = average response time, TR = total replies, ARR = agent reply rate.
export const teamToday: Kpi[] = [
  { label: "ART", value: "11s", hint: "Average response time" },
  { label: "TR", value: "2", hint: "Total replies" },
  { label: "ARR", value: "100%", hint: "Agent reply rate" },
  { label: "Target", value: "0", hint: "Tickets left to target" },
]
