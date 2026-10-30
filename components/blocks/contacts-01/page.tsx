import { Contacts } from "@/components/blocks/contacts-01/components/contacts"

export const meta = {
  id: "contacts-01",
  title: "Contact",
  description: "Searchable, sortable contact list with each customer's channel identities, tags and latest ticket.",
  category: "Main pages",
} as const

export default function Contacts01() {
  return <Contacts />
}
