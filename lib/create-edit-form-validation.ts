import type { ContactRecord, ContactRecordValues } from "@/lib/create-edit-form-config"

export type ContactRecordErrors = Partial<Record<keyof ContactRecordValues, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[\d\s().-]+$/

export function validateContactRecord(
  values: ContactRecordValues,
  records: ContactRecord[],
  editingRecordId?: string,
): ContactRecordErrors {
  const errors: ContactRecordErrors = {}
  const fullName = values.fullName.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()

  if (!fullName) errors.fullName = "Full name is required."
  if (!email) {
    errors.email = "Email address is required."
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address."
  } else if (
    records.some((record) => record.id !== editingRecordId && record.values.email.trim().toLowerCase() === email.toLowerCase())
  ) {
    errors.email = "A demo record already uses this email address."
  }

  if (phone) {
    const digits = phone.replace(/\D/g, "")
    if (!phonePattern.test(phone) || digits.length < 7 || digits.length > 15) {
      errors.phone = "Enter a valid phone number with 7 to 15 digits."
    }
  }

  if (values.preferredContactMethod === "Email" && !email) {
    errors.email = "An email address is required for email contact."
  }

  return errors
}
