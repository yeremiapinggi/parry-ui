"use client"

import { useSyncExternalStore } from "react"
import { demoConversations, type Conversation } from "@/lib/conversation-table-data"

type ConversationUpdater = Conversation[] | ((current: Conversation[]) => Conversation[])

let snapshot = demoConversations
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return snapshot
}

export function setSharedConversations(updater: ConversationUpdater) {
  snapshot = typeof updater === "function" ? updater(snapshot) : updater
  listeners.forEach((listener) => listener())
}

export function useSharedConversations() {
  const conversations = useSyncExternalStore(subscribe, getSnapshot, () => demoConversations)
  return [conversations, setSharedConversations] as const
}
