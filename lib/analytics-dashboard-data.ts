export const ANALYTICS_END_DATE = "2026-10-27"
export const ANALYTICS_DAY_COUNT = 180
const DAY_IN_MS = 24 * 60 * 60 * 1000

export const CHANNELS = [
  { key: "web", label: "Web" },
  { key: "email", label: "Email" },
  { key: "chat", label: "Chat" },
  { key: "voice", label: "Voice" },
] as const

export const SEGMENTS = [
  { key: "support", label: "Support" },
  { key: "sales", label: "Sales" },
  { key: "success", label: "Customer success" },
  { key: "billing", label: "Billing" },
  { key: "operations", label: "Operations" },
] as const

export type ChannelKey = (typeof CHANNELS)[number]["key"]
export type SegmentKey = (typeof SEGMENTS)[number]["key"]

export type ChannelDay = {
  activity: number
  completed: number
  responseSeconds: number
}

export type AnalyticsDay = {
  date: string
  activity: number
  userIds: string[]
  completed: number
  responseSeconds: number
  channels: Record<ChannelKey, ChannelDay>
  segments: Record<SegmentKey, number>
}

export type ChannelSummary = {
  key: ChannelKey
  name: string
  activity: number
  share: number
  completionRate: number
  averageResponseSeconds: number
}

export type SegmentSummary = {
  key: SegmentKey
  name: string
  activity: number
  share: number
}

export type AnalyticsAggregate = {
  activity: number
  uniqueUsers: number
  completed: number
  completionRate: number
  responseSeconds: number
  averageResponseSeconds: number
  channels: ChannelSummary[]
  segments: SegmentSummary[]
}

export type TrendPoint = {
  label: string
  currentRange: string
  previousRange: string
  activity: number
  previousActivity: number
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function addDaysToISO(value: string, amount: number) {
  const date = parseDate(value)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

export function getDateOffset(start: string, end: string) {
  return Math.round((parseDate(end).getTime() - parseDate(start).getTime()) / DAY_IN_MS)
}

export function getInclusiveDateCount(start: string, end: string) {
  if (!start || !end || end < start) return 0
  return getDateOffset(start, end) + 1
}

export function getPresetDateRange(days: 7 | 30 | 90) {
  return {
    start: addDaysToISO(ANALYTICS_END_DATE, -(days - 1)),
    end: ANALYTICS_END_DATE,
  }
}

export function formatAnalyticsDate(value: string, includeYear = false) {
  return parseDate(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  })
}

export function formatAnalyticsRange(start: string, end: string) {
  if (start === end) return formatAnalyticsDate(start, true)
  const crossesYear = start.slice(0, 4) !== end.slice(0, 4)
  return `${formatAnalyticsDate(start, crossesYear)} – ${formatAnalyticsDate(end, crossesYear)}`
}

function allocateCounts(total: number, weights: number[]) {
  if (!weights.length) return []
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0)
  if (weightTotal === 0) return weights.map(() => 0)

  const exact = weights.map((weight) => (total * weight) / weightTotal)
  const counts = exact.map(Math.floor)
  const remainder = total - counts.reduce((sum, count) => sum + count, 0)
  const remainders = exact
    .map((count, index) => ({ index, remainder: count - Math.floor(count) }))
    .sort((first, second) => second.remainder - first.remainder)

  for (let index = 0; index < remainder; index += 1) {
    counts[remainders[index % remainders.length].index] += 1
  }

  return counts
}

function createAnalyticsDay(index: number): AnalyticsDay {
  const date = addDaysToISO(ANALYTICS_END_DATE, index - (ANALYTICS_DAY_COUNT - 1))
  const weekday = parseDate(date).getUTCDay()
  const weeklyAdjustment = weekday === 0 || weekday === 6 ? -46 : 18
  const activity = Math.max(
    120,
    Math.round(475 + index * 1.25 + Math.sin(index / 8) * 46 + Math.cos(index / 19) * 31 + weeklyAdjustment),
  )
  const completionRate = 0.79 + Math.sin(index / 13) * 0.025 + Math.cos(index / 5) * 0.012
  const completed = Math.round(activity * completionRate)
  const uniqueUserCount = Math.round(activity * (0.54 + Math.sin(index / 17) * 0.025))
  const userIds = Array.from({ length: uniqueUserCount }, (_, userIndex) => {
    const stableId = (index * 373 + userIndex * 97) % 26000
    return `user-${stableId}`
  })

  const channelWeights = [
    0.3 + Math.sin(index / 15) * 0.025,
    0.22 + Math.cos(index / 12) * 0.018,
    0.31 + Math.sin(index / 10 + 1) * 0.03,
    0.17 + Math.cos(index / 18 + 2) * 0.018,
  ]
  const channelActivity = allocateCounts(activity, channelWeights)
  const channelCompleted = allocateCounts(completed, channelActivity)
  const responseBaselines = [42, 34, 29, 51]
  const channelEntries = CHANNELS.map((channel, channelIndex) => {
    const responseTime = responseBaselines[channelIndex] + Math.sin(index / 9 + channelIndex) * 3.2
    return [channel.key, {
      activity: channelActivity[channelIndex],
      completed: channelCompleted[channelIndex],
      responseSeconds: channelActivity[channelIndex] * responseTime,
    }] as const
  })
  const channels = Object.fromEntries(channelEntries) as Record<ChannelKey, ChannelDay>
  const responseSeconds = channelEntries.reduce((sum, [, value]) => sum + value.responseSeconds, 0)

  const segmentWeights = [
    0.28 + Math.sin(index / 21) * 0.025,
    0.2 + Math.cos(index / 14) * 0.02,
    0.24 + Math.sin(index / 11 + 2) * 0.025,
    0.14 + Math.cos(index / 8 + 1) * 0.014,
    0.14 + Math.sin(index / 16 + 3) * 0.012,
  ]
  const segmentActivity = allocateCounts(activity, segmentWeights)
  const segments = Object.fromEntries(
    SEGMENTS.map((segment, segmentIndex) => [segment.key, segmentActivity[segmentIndex]]),
  ) as Record<SegmentKey, number>

  return { date, activity, userIds, completed, responseSeconds, channels, segments }
}

export const ANALYTICS_DAYS: AnalyticsDay[] = Array.from(
  { length: ANALYTICS_DAY_COUNT },
  (_, index) => createAnalyticsDay(index),
)

export function getAnalyticsDays(start: string, end: string) {
  return ANALYTICS_DAYS.filter((day) => day.date >= start && day.date <= end)
}

export function aggregateAnalytics(days: AnalyticsDay[]): AnalyticsAggregate {
  const activity = days.reduce((sum, day) => sum + day.activity, 0)
  const completed = days.reduce((sum, day) => sum + day.completed, 0)
  const responseSeconds = days.reduce((sum, day) => sum + day.responseSeconds, 0)
  const uniqueUsers = new Set(days.flatMap((day) => day.userIds)).size
  const channels = CHANNELS.map((channel) => {
    const activityByChannel = days.reduce((sum, day) => sum + day.channels[channel.key].activity, 0)
    const completedByChannel = days.reduce((sum, day) => sum + day.channels[channel.key].completed, 0)
    const responseByChannel = days.reduce((sum, day) => sum + day.channels[channel.key].responseSeconds, 0)

    return {
      key: channel.key,
      name: channel.label,
      activity: activityByChannel,
      share: activity ? activityByChannel / activity : 0,
      completionRate: activityByChannel ? (completedByChannel / activityByChannel) * 100 : 0,
      averageResponseSeconds: activityByChannel ? responseByChannel / activityByChannel : 0,
    }
  })
  const segments = SEGMENTS.map((segment) => {
    const segmentActivity = days.reduce((sum, day) => sum + day.segments[segment.key], 0)
    return {
      key: segment.key,
      name: segment.label,
      activity: segmentActivity,
      share: activity ? segmentActivity / activity : 0,
    }
  }).sort((first, second) => second.activity - first.activity)

  return {
    activity,
    uniqueUsers,
    completed,
    completionRate: activity ? (completed / activity) * 100 : 0,
    responseSeconds,
    averageResponseSeconds: activity ? responseSeconds / activity : 0,
    channels,
    segments,
  }
}

export function buildTrendSeries(
  currentDays: AnalyticsDay[],
  previousDays: AnalyticsDay[],
  start: string,
  end: string,
  periodLength: number,
): TrendPoint[] {
  const bucketSize = periodLength > 30 ? 7 : 1
  const previousByDate = new Map(previousDays.map((day) => [day.date, day]))
  const buckets = new Map<number, { activity: number; previousActivity: number }>()

  currentDays.forEach((day) => {
    const offset = getDateOffset(start, day.date)
    const bucketIndex = Math.floor(offset / bucketSize)
    const bucket = buckets.get(bucketIndex) ?? { activity: 0, previousActivity: 0 }
    const previousDate = addDaysToISO(day.date, -periodLength)
    bucket.activity += day.activity
    bucket.previousActivity += previousByDate.get(previousDate)?.activity ?? 0
    buckets.set(bucketIndex, bucket)
  })

  return [...buckets.entries()]
    .sort(([first], [second]) => first - second)
    .map(([bucketIndex, values]) => {
      const offset = bucketIndex * bucketSize
      const bucketStart = addDaysToISO(start, offset)
      const bucketEnd = addDaysToISO(start, Math.min(offset + bucketSize - 1, periodLength - 1))
      const previousStart = addDaysToISO(bucketStart, -periodLength)
      const previousEnd = addDaysToISO(bucketEnd, -periodLength)
      const currentRange = formatAnalyticsRange(bucketStart, bucketEnd)

      return {
        label: formatAnalyticsDate(bucketStart),
        currentRange,
        previousRange: formatAnalyticsRange(previousStart, previousEnd),
        activity: values.activity,
        previousActivity: values.previousActivity,
      }
    })
}
