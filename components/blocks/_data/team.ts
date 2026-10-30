export type Presence = "available" | "busy" | "break" | "offline"

export type Agent = { id: string; name: string; initials: string; email: string; presence: Presence; load: number }

export const teamName = "Yp Corp"

// Sample agents; not real people.
export const team: Agent[] = [
  { id: "pingottestting", name: "Pingot Testing", initials: "PT", email: "pingot.testing@example.com", presence: "available", load: 8 },
  { id: "dewi", name: "Dewi Lestari", initials: "DL", email: "dewi.lestari@example.com", presence: "available", load: 5 },
  { id: "rizky", name: "Rizky Pratama", initials: "RP", email: "rizky.pratama@example.com", presence: "busy", load: 11 },
  { id: "sari", name: "Sari Wulandari", initials: "SW", email: "sari.wulandari@example.com", presence: "break", load: 3 },
  { id: "budi", name: "Budi Santoso", initials: "BS", email: "budi.santoso@example.com", presence: "offline", load: 0 },
  { id: "intan", name: "Intan Permata", initials: "IP", email: "intan.permata@example.com", presence: "available", load: 6 },
]

export const currentAgent = team[0]
