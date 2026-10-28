export type RankingMetric = "mentions" | "engagement" | "reach" | "engagementRate"
export type SentimentKey = "positive" | "neutral" | "negative"

export type DailyAccountMetrics = {
  mentions: number
  engagement: number
  reach: number
  positive: number
  neutral: number
  negative: number
}

export type SocialAccount = {
  id: string
  name: string
  handle: string
  platform: "Instagram" | "TikTok" | "YouTube" | "X" | "LinkedIn"
  dailyCurrent: DailyAccountMetrics[]
  dailyPrevious: DailyAccountMetrics[]
}

export type PeriodMetrics = {
  mentions: number
  engagement: number
  reach: number
  engagementRate: number
  positive: number
  neutral: number
  negative: number
}

const dayMilliseconds = 24 * 60 * 60 * 1000
export const rankingDataEnd = new Date("2026-10-28T00:00:00.000Z")
export const rankingDataStart = new Date(rankingDataEnd.getTime() - 89 * dayMilliseconds)

const accountSeeds = [
  { name: "Studio Nusa", handle: "@studionusa", platform: "Instagram", mentions: 410, engagement: 6920, reach: 53200, sentiment: [0.68, 0.23, 0.09] },
  { name: "Morrow Coffee", handle: "@morrowcoffee", platform: "Instagram", mentions: 355, engagement: 6440, reach: 48600, sentiment: [0.72, 0.2, 0.08] },
  { name: "Aster Running", handle: "@asterrunning", platform: "TikTok", mentions: 382, engagement: 7280, reach: 55800, sentiment: [0.61, 0.27, 0.12] },
  { name: "Field Notes Co.", handle: "@fieldnotesco", platform: "YouTube", mentions: 306, engagement: 5310, reach: 46300, sentiment: [0.58, 0.31, 0.11] },
  { name: "Sunday Supply", handle: "@sundaysupply", platform: "Instagram", mentions: 286, engagement: 4930, reach: 39800, sentiment: [0.64, 0.25, 0.11], tieGroup: "shared-studio" },
  { name: "Kindred Goods", handle: "@kindredgoods", platform: "TikTok", mentions: 286, engagement: 4930, reach: 39800, sentiment: [0.64, 0.25, 0.11], tieGroup: "shared-studio" },
  { name: "Northstar Audio", handle: "@northstaraudio", platform: "YouTube", mentions: 328, engagement: 5680, reach: 44100, sentiment: [0.55, 0.3, 0.15] },
  { name: "Mica Skincare", handle: "@micaskincare", platform: "Instagram", mentions: 268, engagement: 5240, reach: 41600, sentiment: [0.73, 0.2, 0.07] },
  { name: "Civic Table", handle: "@civictable", platform: "X", mentions: 244, engagement: 3090, reach: 28600, sentiment: [0.48, 0.34, 0.18] },
  { name: "Goodside Market", handle: "@goodsidemarket", platform: "TikTok", mentions: 301, engagement: 5870, reach: 51200, sentiment: [0.66, 0.24, 0.1] },
  { name: "Luma House", handle: "@lumahouse", platform: "Instagram", mentions: 224, engagement: 4620, reach: 36700, sentiment: [0.7, 0.22, 0.08] },
  { name: "Morrow Active", handle: "@morrowactive", platform: "YouTube", mentions: 253, engagement: 4780, reach: 38800, sentiment: [0.59, 0.29, 0.12] },
  { name: "Common Ground", handle: "@commonground", platform: "LinkedIn", mentions: 218, engagement: 3280, reach: 30100, sentiment: [0.63, 0.28, 0.09] },
  { name: "Aster Studio", handle: "@asterstudio", platform: "Instagram", mentions: 237, engagement: 4510, reach: 37400, sentiment: [0.67, 0.24, 0.09] },
  { name: "Little Orchard", handle: "@littleorchard", platform: "TikTok", mentions: 208, engagement: 4220, reach: 34300, sentiment: [0.75, 0.18, 0.07] },
  { name: "Harbor Works", handle: "@harborworks", platform: "LinkedIn", mentions: 186, engagement: 2740, reach: 24800, sentiment: [0.57, 0.3, 0.13] },
  { name: "Open Frame", handle: "@openframe", platform: "YouTube", mentions: 191, engagement: 3660, reach: 31900, sentiment: [0.52, 0.32, 0.16] },
  { name: "Brightland Home", handle: "@brightlandhome", platform: "Instagram", mentions: 174, engagement: 3480, reach: 29300, sentiment: [0.71, 0.21, 0.08] },
  { name: "Good Form Lab", handle: "@goodformlab", platform: "TikTok", mentions: 163, engagement: 3190, reach: 26700, sentiment: [0.6, 0.28, 0.12] },
  { name: "Atlas Journal", handle: "@atlasjournal", platform: "X", mentions: 148, engagement: 2020, reach: 18600, sentiment: [0.46, 0.36, 0.18] },
] as const

function createDailyMetrics(
  seed: (typeof accountSeeds)[number],
  pattern: number,
  day: number,
  previous: boolean,
): DailyAccountMetrics {
  const cycle = ((day * 7 + pattern * 13) % 17) / 100
  const trendStrength = ((pattern % 7) - 3) * 0.035
  const drift = previous ? 0.92 - (day / 90) * (0.18 + trendStrength) : 0.82 + (day / 90) * (0.26 + trendStrength)
  const factor = drift + cycle
  const engagementFactor = previous
    ? 0.88 + ((day * 5 + pattern * 2) % 17) / 100 + (pattern % 4) * 0.014
    : 0.9 + ((day * 3 + pattern * 5) % 15) / 100 + (pattern % 5) * 0.015
  const reachFactor = previous
    ? 0.9 + ((day * 3 + pattern * 11) % 15) / 100 + (pattern % 3) * 0.015
    : 0.92 + ((day * 2 + pattern * 7) % 13) / 100 + (pattern % 4) * 0.012
  const mentions = Math.max(0, Math.round(seed.mentions * factor))
  const engagement = Math.max(0, Math.round(seed.engagement * factor * engagementFactor))
  const reach = Math.max(1, Math.round(seed.reach * factor * reachFactor))
  const sentimentShift = ((day + pattern * 3) % 7) / 1000
  const positiveShare = seed.sentiment[0] - sentimentShift
  const neutralShare = seed.sentiment[1] + sentimentShift * 0.55
  const positive = Math.round(mentions * positiveShare)
  const neutral = Math.round(mentions * neutralShare)

  return { mentions, engagement, reach, positive, neutral, negative: Math.max(0, mentions - positive - neutral) }
}

export const socialAccounts: SocialAccount[] = accountSeeds.map((seed, index) => {
  const pattern = "tieGroup" in seed ? accountSeeds.findIndex((candidate) => "tieGroup" in candidate && candidate.tieGroup === seed.tieGroup) : index
  return {
    id: `account-${index + 1}`,
    name: seed.name,
    handle: seed.handle,
    platform: seed.platform,
    dailyCurrent: Array.from({ length: 90 }, (_, day) => createDailyMetrics(seed, pattern, day, false)),
    dailyPrevious: Array.from({ length: 90 }, (_, day) => createDailyMetrics(seed, pattern, day, true)),
  }
})

export const rankingPlatforms = ["Instagram", "TikTok", "YouTube", "X", "LinkedIn"] as const

export function aggregatePeriod(account: SocialAccount, startIndex: number, endIndex: number, previous = false): PeriodMetrics {
  const source = previous ? account.dailyPrevious : account.dailyCurrent
  const selected = source.slice(startIndex, endIndex + 1)
  const totals = selected.reduce((sum, day) => ({
    mentions: sum.mentions + day.mentions,
    engagement: sum.engagement + day.engagement,
    reach: sum.reach + day.reach,
    positive: sum.positive + day.positive,
    neutral: sum.neutral + day.neutral,
    negative: sum.negative + day.negative,
  }), { mentions: 0, engagement: 0, reach: 0, positive: 0, neutral: 0, negative: 0 })

  return {
    ...totals,
    engagementRate: totals.reach ? (totals.engagement / totals.reach) * 100 : 0,
  }
}

export function metricValue(metrics: PeriodMetrics, metric: RankingMetric) {
  return metrics[metric]
}

export function metricLabel(metric: RankingMetric) {
  return {
    mentions: "Total Mentions",
    engagement: "Engagement",
    reach: "Reach",
    engagementRate: "Engagement Rate",
  }[metric]
}

export function formatMetric(value: number, metric: RankingMetric, compact = false) {
  if (metric === "engagementRate") return `${value.toFixed(2)}%`
  return new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value)
}

export function aggregateTrend(account: SocialAccount, metric: RankingMetric, startIndex: number, endIndex: number, previous = false) {
  const count = endIndex - startIndex + 1
  const buckets = Math.min(7, count)
  return Array.from({ length: buckets }, (_, bucketIndex) => {
    const bucketStart = startIndex + Math.floor((bucketIndex * count) / buckets)
    const bucketEnd = startIndex + Math.floor(((bucketIndex + 1) * count) / buckets) - 1
    const metrics = aggregatePeriod(account, bucketStart, Math.max(bucketStart, bucketEnd), previous)
    return { label: `Period ${bucketIndex + 1}`, value: metricValue(metrics, metric) }
  })
}

export function formatRangeLabel(startIndex: number, endIndex: number) {
  const start = new Date(rankingDataStart.getTime() + startIndex * dayMilliseconds)
  const end = new Date(rankingDataStart.getTime() + endIndex * dayMilliseconds)
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
  return `${formatter.format(start)} – ${formatter.format(end)}, ${end.getUTCFullYear()}`
}

export function dateForIndex(index: number) {
  const date = new Date(rankingDataStart.getTime() + index * dayMilliseconds)
  return date.toISOString().slice(0, 10)
}

export function indexForDate(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return Math.max(0, Math.min(89, Math.round((parsed.getTime() - rankingDataStart.getTime()) / dayMilliseconds)))
}
