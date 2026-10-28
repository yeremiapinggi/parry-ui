export type DemoAgentId = "general" | "research" | "support"
export type ConversationGroup = "Today" | "Yesterday" | "Older"
export type AiMessageRole = "user" | "assistant" | "system"
export type AiResponseStatus = "thinking" | "streaming" | "completed" | "error" | "stopped"

export type DemoAgent = {
  id: DemoAgentId
  name: string
  description: string
  availability: "Available" | "Busy"
}

export type AiChatMessage = {
  id: string
  role: AiMessageRole
  content: string
  agentId?: DemoAgentId
  timestamp: string
  status?: AiResponseStatus
  attempt?: number
}

export type AiChatConversation = {
  id: string
  title: string
  agentId: DemoAgentId
  group: ConversationGroup
  updatedAt: number
  messages: AiChatMessage[]
}

export const demoAgents: DemoAgent[] = [
  {
    id: "general",
    name: "General Assistant",
    description: "A helpful starting point for everyday work and ideas.",
    availability: "Available",
  },
  {
    id: "research",
    name: "Research Assistant",
    description: "Organizes questions, sources, and research notes.",
    availability: "Available",
  },
  {
    id: "support",
    name: "Support Assistant",
    description: "Helps structure customer support replies and summaries.",
    availability: "Busy",
  },
]

export function getDemoAgent(agentId: DemoAgentId) {
  return demoAgents.find((agent) => agent.id === agentId) ?? demoAgents[0]
}

export function createInitialAiConversations(): AiChatConversation[] {
  return [
    {
      id: "demo-research-trends",
      title: "Summarize recent support trends",
      agentId: "research",
      group: "Today",
      updatedAt: 3,
      messages: [
        {
          id: "demo-research-user",
          role: "user",
          content: "Help me organize the main themes from our latest support feedback.",
          timestamp: "10:24 AM",
          agentId: "research",
        },
        {
          id: "demo-research-assistant",
          role: "assistant",
          content: "Here is a locally generated demo outline:\n\n- **Response time:** note recurring wait-time mentions.\n- **Product clarity:** group questions about setup and feature discovery.\n- **Follow-up:** compare each theme with the source notes before sharing.\n\nThis sample is deterministic preview content, not a live AI response.",
          timestamp: "10:24 AM",
          agentId: "research",
          status: "completed",
          attempt: 0,
        },
      ],
    },
    {
      id: "demo-general-launch",
      title: "Plan a thoughtful launch checklist",
      agentId: "general",
      group: "Today",
      updatedAt: 2,
      messages: [
        {
          id: "demo-general-user",
          role: "user",
          content: "What should I include in a small product launch checklist?",
          timestamp: "9:42 AM",
          agentId: "general",
        },
        {
          id: "demo-general-assistant",
          role: "assistant",
          content: "A concise checklist can keep the team aligned:\n\n1. Confirm the audience and launch goal.\n2. Review product, support, and measurement readiness.\n3. Assign an owner to each announcement and follow-up.\n\nThis is an example generated locally for the template preview.",
          timestamp: "9:42 AM",
          agentId: "general",
          status: "completed",
          attempt: 0,
        },
      ],
    },
    {
      id: "demo-support-summary",
      title: "Draft a customer-friendly update",
      agentId: "support",
      group: "Yesterday",
      updatedAt: 1,
      messages: [
        {
          id: "demo-support-user",
          role: "user",
          content: "Help me write a clear update while an issue is being investigated.",
          timestamp: "4:18 PM",
          agentId: "support",
        },
        {
          id: "demo-support-assistant",
          role: "assistant",
          content: "A useful update acknowledges the impact, shares what is known, and sets a clear next step. Review every detail against your actual support context before sending.\n\nThis is fictional demo content and is not connected to a support system.",
          timestamp: "4:18 PM",
          agentId: "support",
          status: "completed",
          attempt: 0,
        },
      ],
    },
    {
      id: "demo-research-vendors",
      title: "Structure a vendor comparison",
      agentId: "research",
      group: "Older",
      updatedAt: 0,
      messages: [
        {
          id: "demo-vendor-user",
          role: "user",
          content: "Give me a structure for comparing a few vendors.",
          timestamp: "Monday",
          agentId: "research",
        },
        {
          id: "demo-vendor-assistant",
          role: "assistant",
          content: "Start with a consistent set of criteria, such as capabilities, implementation effort, support, and cost. Record the source for each finding and mark unknowns instead of assuming a value.\n\nDemo-generated content · no live research connection.",
          timestamp: "Monday",
          agentId: "research",
          status: "completed",
          attempt: 0,
        },
      ],
    },
  ]
}

export function createDemoResponse(agentId: DemoAgentId, prompt: string) {
  const agent = getDemoAgent(agentId)
  const safePrompt = prompt.trim().replace(/\s+/g, " ")

  if (agentId === "research") {
    return `A locally generated example from **${agent.name}** for “${safePrompt}”:\n\n- **Question:** capture the decision or topic you want to explore.\n- **Evidence:** collect relevant notes and label each source.\n- **Next step:** compare findings, then record what still needs review.\n\nThis deterministic response is demo-generated. No live research or AI model is connected.`
  }

  if (agentId === "support") {
    return `A locally generated example from **${agent.name}** for “${safePrompt}”:\n\n1. Acknowledge the customer’s request in plain language.\n2. Share only details that have been verified.\n3. Set a clear expectation for the next update.\n\nReview this fictional draft against your support policy before using it. No live support system or AI model is connected.`
  }

  return `A locally generated example from **${agent.name}** for “${safePrompt}”:\n\n- **Clarify:** write down the outcome you want.\n- **Organize:** break the work into a few practical steps.\n- **Review:** check the result against your own context.\n\nFor repeatable previews, this workspace uses \`local-demo\` responses only. No live AI model is connected.`
}
