export type PipelineDefinition = {
  id: string
  name: string
  stages: string[]
  entityLabel: string
  currency: string
  wonStage: string
  lostStage: string
  metricLabels?: { pipelineValue?: string; wonRevenue?: string; winRate?: string; weightedForecast?: string; value?: string; averageDealValue?: string }
}

export type StageTransition = {
  stage: string
  changedAt: Date
  winProbability: number
}

export type PipelineOpportunity = {
  id: string
  name: string
  company: string
  owner: string
  leadSource: string
  pipelineId: string
  value: number
  expectedCloseAt: Date
  history: StageTransition[]
}

export type ReportWindow = {
  start: Date
  end: Date
}

export type StageSummary = {
  stage: string
  opportunityCount: number
  previousOpportunityCount: number
  previousConversionRate: number
  previousDropOffRate: number
  previousEntriesInPeriod: number
  totalValue: number
  averageDealValue: number
  averageDaysInStage: number
  entriesInPeriod: number
  conversionRate: number
  dropOffRate: number
}

export type OpportunitySnapshot = {
  opportunity: PipelineOpportunity
  stage: string
  daysInStage: number
  winProbability: number
}

export type MonthlyForecast = {
  month: string
  openValue: number
  weightedValue: number
}

export type PipelineMetrics = {
  snapshots: OpportunitySnapshot[]
  previousSnapshots: OpportunitySnapshot[]
  stages: StageSummary[]
  newInflows: number
  wonRevenue: number
  wonCount: number
  lostCount: number
  winRate: number
  totalPipelineValue: number
  weightedForecast: number
  averageDaysInStage: number
  agingBuckets: { label: string; count: number }[]
  stalledOpportunities: OpportunitySnapshot[]
  highestAgingStage: { stage: string; days: number } | null
  monthlyForecast: MonthlyForecast[]
  stageEntries: Record<string, number>
}

export const PIPELINE_DEFINITIONS: PipelineDefinition[] = [
  {
    id: "cognivo-sales",
    name: "Cognivo Sales Pipeline",
    entityLabel: "opportunities",
    currency: "USD",
    wonStage: "Won",
    lostStage: "Lost",
    metricLabels: { pipelineValue: "Total Pipeline Value", wonRevenue: "Won Revenue", winRate: "Win Rate", weightedForecast: "Weighted Revenue Forecast", averageDealValue: "Average Deal Value" },
    stages: ["New Lead", "Qualified", "Discovery", "Proposal", "Negotiation"],
  },
  {
    id: "enterprise-growth",
    name: "Enterprise Growth Pipeline",
    entityLabel: "opportunities",
    currency: "USD",
    wonStage: "Won",
    lostStage: "Lost",
    metricLabels: { pipelineValue: "Total Pipeline Value", wonRevenue: "Won Revenue", winRate: "Win Rate", weightedForecast: "Weighted Revenue Forecast", averageDealValue: "Average Deal Value" },
    stages: ["Identified", "Validated", "Evaluation", "Commercial Review", "Contracting"],
  },
]

export const PIPELINE_OWNERS = ["Alya Pratama", "Rafael Putra", "Mei Tan", "Jonas Lee", "Camila Santos"]
export const PIPELINE_LEAD_SOURCES = ["Inbound", "Partner", "Outbound", "Product-led"]

const companyNames = [
  "Northstar Labs", "Lattice Health", "Meridian Works", "Redwood Freight", "Horizon Group", "Saffron Digital",
  "Brightwell Systems", "Juniper Collective", "Atlas Commerce", "Vantage Robotics", "Cedarline Bank", "Alpine Energy",
  "Bluebird Logistics", "Fable Learning", "Monument Media", "Orbit Manufacturing", "Clearwater Care", "Pioneer Foods",
]
const opportunityNames = [
  "Customer data platform", "Service desk expansion", "Regional analytics", "Workflow automation", "Enterprise support",
  "AI operations pilot", "Revenue intelligence", "Customer portal refresh", "Global rollout", "Operations workspace",
  "Contact center modernization", "Forecasting suite", "Unified service console", "Data residency program", "Field team enablement",
]

const DAY_MS = 24 * 60 * 60 * 1000
export const PIPELINE_DEMO_ANCHOR_DATE = new Date("2026-10-29T00:00:00.000Z")

export function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

export function daysBetween(start: Date, end: Date) {
  return Math.max(0, Math.floor((startOfDay(end).getTime() - startOfDay(start).getTime()) / DAY_MS))
}

export function dateInputValue(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10)
}

export function parseDateInput(value: string) {
  return startOfDay(new Date(`${value}T00:00:00.000Z`))
}

export function getPresetWindow(days: number, end = PIPELINE_DEMO_ANCHOR_DATE): ReportWindow {
  const normalizedEnd = startOfDay(end)
  return { start: addDays(normalizedEnd, -(days - 1)), end: normalizedEnd }
}

export function getPreviousWindow(window: ReportWindow): ReportWindow {
  const length = daysBetween(window.start, window.end) + 1
  const end = addDays(window.start, -1)
  return { start: addDays(end, -(length - 1)), end }
}

function isBetween(date: Date, window: ReportWindow) {
  return date >= window.start && date <= window.end
}

function stageProbability(stageIndex: number, stageCount: number, seed: number) {
  const baseline = 0.12 + (stageIndex / Math.max(1, stageCount - 1)) * 0.62
  return Math.min(0.92, Math.max(0.08, baseline + ((seed % 7) - 3) * 0.025))
}

export function buildPipelineOpportunities(anchor = PIPELINE_DEMO_ANCHOR_DATE): PipelineOpportunity[] {
  const today = startOfDay(anchor)
  const opportunities: PipelineOpportunity[] = []

  for (let index = 0; index < 64; index += 1) {
    const pipeline = PIPELINE_DEFINITIONS[index % 4 === 0 ? 1 : 0]
    const stages = pipeline.stages
    const outcome = index % 11 < 2 ? "won" : index % 11 < 5 ? "lost" : "open"
    const currentStageIndex = outcome === "won"
      ? stages.length - 1
      : outcome === "lost"
        ? 1 + ((index * 3) % (stages.length - 1))
        : (index * 7 + 1) % stages.length
    const path = stages.slice(0, currentStageIndex + 1)
    if (outcome === "won") path.push("Won")
    if (outcome === "lost") path.push("Lost")

    const currentDaysInStage = 1 + ((index * 19) % 48)
    const transitionSpacing = 5 + (index % 12)
    const history = path.map((stage, pathIndex) => {
      const daysAgo = currentDaysInStage + (path.length - pathIndex - 1) * transitionSpacing
      const finalState = pathIndex === path.length - 1
      const stageIndex = stages.indexOf(stage)
      const winProbability = stage === "Won" ? 1 : stage === "Lost" ? 0 : stageProbability(stageIndex, stages.length, index)
      return {
        stage,
        changedAt: addDays(today, -daysAgo),
        winProbability: finalState ? winProbability : stageProbability(stageIndex, stages.length, index),
      }
    })

    const createdAt = history[0].changedAt
    const expectedCloseAt = addDays(createdAt, 42 + ((index * 17) % 120))
    const value = Math.round((18_000 + ((index * 11_937) % 260_000)) / 1_000) * 1_000

    opportunities.push({
      id: `COG-${String(2840 + index).padStart(4, "0")}`,
      name: `${opportunityNames[index % opportunityNames.length]} ${index > 14 ? `· ${Math.floor(index / 15) + 1}` : ""}`.trim(),
      company: companyNames[index % companyNames.length],
      owner: PIPELINE_OWNERS[index % PIPELINE_OWNERS.length],
      leadSource: PIPELINE_LEAD_SOURCES[index % PIPELINE_LEAD_SOURCES.length],
      pipelineId: pipeline.id,
      value,
      expectedCloseAt,
      history,
    })
  }

  return opportunities
}

export function getOpportunityCreatedAt(opportunity: PipelineOpportunity) {
  return opportunity.history[0].changedAt
}

export function getOpportunityCloseAt(opportunity: PipelineOpportunity, stage = "Won") {
  return opportunity.history.find((transition) => transition.stage === stage)?.changedAt ?? null
}

export function getSnapshotState(opportunity: PipelineOpportunity, endDate: Date): OpportunitySnapshot | null {
  const state = [...opportunity.history].reverse().find((transition) => transition.changedAt <= endDate)
  if (!state) return null
  return {
    opportunity,
    stage: state.stage,
    daysInStage: daysBetween(state.changedAt, endDate),
    winProbability: state.winProbability,
  }
}

function getActiveSnapshots(opportunities: PipelineOpportunity[], endDate: Date, wonStage: string, lostStage: string): OpportunitySnapshot[] {
  return opportunities.flatMap((opportunity) => {
    const snapshot = getSnapshotState(opportunity, endDate)
    return snapshot && snapshot.stage !== wonStage && snapshot.stage !== lostStage ? [snapshot] : []
  })
}

function getPeriodStageEntries(opportunities: PipelineOpportunity[], stage: string, window: ReportWindow) {
  return opportunities.flatMap((opportunity) => {
    const entry = opportunity.history.find((transition) => transition.stage === stage && isBetween(transition.changedAt, window))
    return entry ? [{ opportunity, entry }] : []
  })
}

function getMonthlyForecast(snapshots: OpportunitySnapshot[], startDate: Date): MonthlyForecast[] {
  const months: MonthlyForecast[] = []
  for (let offset = 0; offset < 5; offset += 1) {
    const monthDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + offset, 1))
    const monthSnapshots = snapshots.filter((snapshot) => {
      const closeDate = snapshot.opportunity.expectedCloseAt
      return closeDate.getUTCFullYear() === monthDate.getUTCFullYear() && closeDate.getUTCMonth() === monthDate.getUTCMonth()
    })
    months.push({
      month: monthDate.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }),
      openValue: monthSnapshots.reduce((total, snapshot) => total + snapshot.opportunity.value, 0),
      weightedValue: monthSnapshots.reduce((total, snapshot) => total + snapshot.opportunity.value * snapshot.winProbability, 0),
    })
  }
  return months
}

export function calculatePipelineMetrics({
  opportunities,
  pipeline,
  window,
  previousWindow,
  owner = "all",
  leadSource = "all",
  agingThreshold = 14,
}: {
  opportunities: PipelineOpportunity[]
  pipeline: PipelineDefinition
  window: ReportWindow
  previousWindow: ReportWindow
  owner?: string
  leadSource?: string
  agingThreshold?: number
}): PipelineMetrics {
  const filtered = opportunities.filter((opportunity) => (
    opportunity.pipelineId === pipeline.id
    && (owner === "all" || opportunity.owner === owner)
    && (leadSource === "all" || opportunity.leadSource === leadSource)
  ))
  const snapshots = getActiveSnapshots(filtered, window.end, pipeline.wonStage, pipeline.lostStage)
  const previousSnapshots = getActiveSnapshots(filtered, previousWindow.end, pipeline.wonStage, pipeline.lostStage)
  const stageEntries: Record<string, number> = {}

  const stages = pipeline.stages.map((stage, stageIndex) => {
    const stageSnapshots = snapshots.filter((snapshot) => snapshot.stage === stage)
    const previousCount = previousSnapshots.filter((snapshot) => snapshot.stage === stage).length
    const entries = getPeriodStageEntries(filtered, stage, window)
    const previousEntries = getPeriodStageEntries(filtered, stage, previousWindow)
    const nextStage = pipeline.stages[stageIndex + 1]
    const countAdvanced = (cohort: typeof entries, endDate: Date) => cohort.filter(({ opportunity, entry }) => opportunity.history.some((transition) => (
      transition.stage === nextStage && transition.changedAt > entry.changedAt && transition.changedAt <= endDate
    ))).length
    const countDropped = (cohort: typeof entries, endDate: Date) => cohort.filter(({ opportunity, entry }) => opportunity.history.some((transition) => (
      transition.stage === pipeline.lostStage && transition.changedAt > entry.changedAt && transition.changedAt <= endDate
    ))).length
    const advanced = countAdvanced(entries, window.end)
    const dropped = countDropped(entries, window.end)
    const previousAdvanced = countAdvanced(previousEntries, previousWindow.end)
    const previousDropped = countDropped(previousEntries, previousWindow.end)
    stageEntries[stage] = entries.length
    const totalValue = stageSnapshots.reduce((total, snapshot) => total + snapshot.opportunity.value, 0)

    return {
      stage,
      opportunityCount: stageSnapshots.length,
      previousOpportunityCount: previousCount,
      previousConversionRate: previousEntries.length ? (previousAdvanced / previousEntries.length) * 100 : 0,
      previousDropOffRate: previousEntries.length ? (previousDropped / previousEntries.length) * 100 : 0,
      previousEntriesInPeriod: previousEntries.length,
      totalValue,
      averageDealValue: stageSnapshots.length ? totalValue / stageSnapshots.length : 0,
      averageDaysInStage: stageSnapshots.length
        ? stageSnapshots.reduce((total, snapshot) => total + snapshot.daysInStage, 0) / stageSnapshots.length
        : 0,
      entriesInPeriod: entries.length,
      conversionRate: entries.length ? (advanced / entries.length) * 100 : 0,
      dropOffRate: entries.length ? (dropped / entries.length) * 100 : 0,
    }
  })

  const wonOpportunities = filtered.filter((opportunity) => {
    const closedAt = getOpportunityCloseAt(opportunity, pipeline.wonStage)
    return closedAt !== null && isBetween(closedAt, window)
  })
  const lostOpportunities = filtered.filter((opportunity) => {
    const closedAt = getOpportunityCloseAt(opportunity, pipeline.lostStage)
    return closedAt !== null && isBetween(closedAt, window)
  })
  const wonRevenue = wonOpportunities.reduce((total, opportunity) => total + opportunity.value, 0)
  const wonCount = wonOpportunities.length
  const lostCount = lostOpportunities.length
  const newInflows = filtered.filter((opportunity) => isBetween(getOpportunityCreatedAt(opportunity), window)).length
  const totalPipelineValue = snapshots.reduce((total, snapshot) => total + snapshot.opportunity.value, 0)
  const weightedForecast = snapshots.reduce((total, snapshot) => total + snapshot.opportunity.value * snapshot.winProbability, 0)
  const agingBuckets = [
    { label: "0–6 days", count: snapshots.filter((snapshot) => snapshot.daysInStage < 7).length },
    { label: "7–13 days", count: snapshots.filter((snapshot) => snapshot.daysInStage >= 7 && snapshot.daysInStage < 14).length },
    { label: "14–29 days", count: snapshots.filter((snapshot) => snapshot.daysInStage >= 14 && snapshot.daysInStage < 30).length },
    { label: "30+ days", count: snapshots.filter((snapshot) => snapshot.daysInStage >= 30).length },
  ]
  const stageAverages = stages.filter((stage) => stage.opportunityCount > 0)
  const highestAgingStage = stageAverages.length
    ? stageAverages.reduce((highest, stage) => stage.averageDaysInStage > highest.averageDaysInStage ? stage : highest)
    : null

  return {
    snapshots,
    previousSnapshots,
    stages,
    newInflows,
    wonRevenue,
    wonCount,
    lostCount,
    winRate: wonCount + lostCount ? (wonCount / (wonCount + lostCount)) * 100 : 0,
    totalPipelineValue,
    weightedForecast,
    averageDaysInStage: snapshots.length
      ? snapshots.reduce((total, snapshot) => total + snapshot.daysInStage, 0) / snapshots.length
      : 0,
    agingBuckets,
    stalledOpportunities: snapshots.filter((snapshot) => snapshot.daysInStage >= agingThreshold).sort((a, b) => b.daysInStage - a.daysInStage),
    highestAgingStage: highestAgingStage ? { stage: highestAgingStage.stage, days: highestAgingStage.averageDaysInStage } : null,
    monthlyForecast: getMonthlyForecast(snapshots, window.end),
    stageEntries,
  }
}
