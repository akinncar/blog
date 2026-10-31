export type Sleep = {
  total_min: number | null
  deep_min: number | null
  light_min: number | null
  rem_min: number | null
  awake_min: number | null
  avg_hr: number | null
  score: number | null
}

export type Day = {
  date: string
  steps: number | null
  calories_kcal: number | null
  exercise_min: number | null
  stress_avg: number | null
  resting_hr: number | null
  hrv_avg_ms: number | null
  sleep: Sleep | null
}

export type Workout = {
  date: string
  sport: string | null
  duration_s: number | null
  distance_m: number | null
  avg_hr: number | null
  calories_kcal: number | null
}

export type HealthData = {
  days: Day[]
  workouts: Workout[]
}

export type Slot = {
  date: string
  day: Day | null
  workouts: Workout[]
}

export const RANGES = [
  { id: '7d', label: '7d', days: 7 },
  { id: '30d', label: '30d', days: 30 },
  { id: '90d', label: '90d', days: 90 },
  { id: 'all', label: 'All', days: null },
] as const

export type RangeId = (typeof RANGES)[number]['id']

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const SPORT_LABELS: Record<string, string> = {
  pool_swim: 'Pool swim',
  open_water_swim: 'Open water swim',
  strength: 'Strength',
  run: 'Run',
  trail_run: 'Trail run',
  bike: 'Bike',
  indoor_bike: 'Indoor bike',
  walk: 'Walk',
  hike: 'Hike',
  row: 'Row',
  yoga: 'Yoga',
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + n))
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${mm}-${dd}`
}

export function diffDays(start: string, end: string): number {
  const [ay, am, ad] = start.split('-').map(Number)
  const [by, bm, bd] = end.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000)
}

export function eachDate(start: string, end: string): string[] {
  const out: string[] = []
  if (start > end) return out
  let cur = start
  while (cur <= end) {
    out.push(cur)
    if (out.length > 20000) {
      throw new Error(`Date range ${start} to ${end} is too long`)
    }
    cur = addDays(cur, 1)
  }
  return out
}

export function weekdayIndex(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function weekdayShort(iso: string): string {
  return WEEKDAYS[weekdayIndex(iso)]
}

/** Monday of the calendar week containing `iso`. */
export function weekStartMonday(iso: string): string {
  const day = weekdayIndex(iso)
  const delta = day === 0 ? -6 : 1 - day
  return addDays(iso, delta)
}

export function formatMonthDay(iso: string, withYear = false): string {
  const [y, m, d] = iso.split('-').map(Number)
  const base = `${MONTHS[m - 1]} ${d}`
  return withYear ? `${base}, ${y}` : base
}

export function formatLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${MONTHS_LONG[m - 1]} ${d}, ${y}`
}

export function formatInt(n: number): string {
  const rounded = Math.round(n)
  const sign = rounded < 0 ? '-' : ''
  return sign + Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatAvg(n: number | null, kind: 'int' | 'tenth' = 'int'): string {
  if (n == null || !Number.isFinite(n)) return '—'
  if (kind === 'int') return formatInt(n)
  const tenth = Math.round(n * 10) / 10
  return Number.isInteger(tenth) ? String(tenth) : tenth.toFixed(1)
}

export function formatMinutes(min: number | null): string {
  if (min == null || !Number.isFinite(min)) return '—'
  const sign = min < 0 ? '-' : ''
  const abs = Math.round(Math.abs(min))
  const h = Math.floor(abs / 60)
  const m = abs % 60
  if (h === 0) return `${sign}${m}m`
  if (m === 0) return `${sign}${h}h`
  return `${sign}${h}h ${m}m`
}

export function formatDuration(seconds: number | null): string | null {
  if (seconds == null || !Number.isFinite(seconds)) return null
  return formatMinutes(seconds / 60)
}

export function formatDistance(meters: number | null): string | null {
  if (meters == null || !Number.isFinite(meters)) return null
  const abs = Math.abs(meters)
  if (abs < 1000) return `${Math.round(meters)} m`
  const km = meters / 1000
  const digits = Math.abs(km) >= 100 ? 0 : Math.abs(km) >= 10 ? 1 : 2
  const text = km.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1')
  return `${text} km`
}

export function formatSport(sport: string | null): string {
  if (!sport) return 'Workout'
  if (SPORT_LABELS[sport]) return SPORT_LABELS[sport]
  return sport
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function mean(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  if (nums.length === 0) return null
  return nums.reduce((sum, value) => sum + value, 0) / nums.length
}

export function sum(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  if (nums.length === 0) return null
  return nums.reduce((total, value) => total + value, 0)
}

export function sleepMinutes(sleep: Sleep | null | undefined): number | null {
  if (!sleep) return null
  if (typeof sleep.total_min === 'number' && Number.isFinite(sleep.total_min)) return sleep.total_min
  const parts = [sleep.deep_min, sleep.light_min, sleep.rem_min, sleep.awake_min]
  const nums = parts.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  if (nums.length === 0) return null
  return nums.reduce((total, value) => total + value, 0)
}

export type SleepParts = {
  deep: number
  light: number
  rem: number
  awake: number
  other: number
}

export function sleepParts(sleep: Sleep | null | undefined): SleepParts | null {
  if (!sleep) return null
  const staged = [sleep.deep_min, sleep.light_min, sleep.rem_min, sleep.awake_min].some(
    (value) => typeof value === 'number' && Number.isFinite(value)
  )
  const total = typeof sleep.total_min === 'number' && Number.isFinite(sleep.total_min) ? sleep.total_min : null
  if (!staged) {
    if (total == null || total <= 0) return null
    return { deep: 0, light: 0, rem: 0, awake: 0, other: total }
  }
  const deep = Math.max(0, sleep.deep_min ?? 0)
  const light = Math.max(0, sleep.light_min ?? 0)
  const rem = Math.max(0, sleep.rem_min ?? 0)
  const awake = Math.max(0, sleep.awake_min ?? 0)
  const stagedSum = deep + light + rem + awake
  const other = total != null && total > stagedSum ? total - stagedSum : 0
  if (stagedSum + other <= 0) return null
  return { deep, light, rem, awake, other }
}

export function dataSpan(days: Day[], workouts: Workout[]): { start: string; end: string } | null {
  let start: string | null = null
  let end: string | null = null
  const consider = (date: string) => {
    if (!start || date < start) start = date
    if (!end || date > end) end = date
  }
  days.forEach((day) => consider(day.date))
  workouts.forEach((workout) => consider(workout.date))
  if (!start || !end) return null
  return { start, end }
}

export function defaultRange(days: Day[], workouts: Workout[]): RangeId {
  const span = dataSpan(days, workouts)
  if (!span) return 'all'
  return diffDays(span.start, span.end) > 90 ? '30d' : 'all'
}

export function buildSlots(days: Day[], workouts: Workout[], range: RangeId): Slot[] {
  const span = dataSpan(days, workouts)
  if (!span) return []
  const spec = RANGES.find((item) => item.id === range)
  const start = spec && spec.days ? addDays(span.end, -(spec.days - 1)) : span.start
  const dayMap = new Map(days.map((day) => [day.date, day]))
  const workoutsByDate = new Map<string, Workout[]>()
  workouts.forEach((workout) => {
    const list = workoutsByDate.get(workout.date)
    if (list) list.push(workout)
    else workoutsByDate.set(workout.date, [workout])
  })
  return eachDate(start, span.end).map((date) => ({
    date,
    day: dayMap.get(date) ?? null,
    workouts: workoutsByDate.get(date) ?? [],
  }))
}

export function workoutMinutes(slot: Slot): number | null {
  const known = slot.workouts
    .map((workout) => workout.duration_s)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (known.length === 0) return slot.workouts.length > 0 ? 0 : null
  return known.reduce((total, value) => total + value, 0) / 60
}

export function heatLevel(minutes: number): 0 | 1 | 2 | 3 {
  if (minutes <= 0) return 0
  if (minutes < 30) return 1
  if (minutes < 60) return 2
  return 3
}

export function workoutDetail(workout: Workout): string {
  const bits: string[] = []
  const duration = formatDuration(workout.duration_s)
  if (duration) bits.push(duration)
  const distance = formatDistance(workout.distance_m)
  if (distance) bits.push(distance)
  if (workout.avg_hr != null) bits.push(`${formatAvg(workout.avg_hr, 'tenth')} bpm`)
  if (workout.calories_kcal != null) bits.push(`${formatInt(workout.calories_kcal)} kcal`)
  return bits.join(' · ')
}

export function workoutSummary(workout: Workout): string {
  const detail = workoutDetail(workout)
  const sport = formatSport(workout.sport)
  return detail ? `${sport} · ${detail}` : sport
}

export function figureLine(slot: Slot): string {
  const bits: string[] = []
  if (slot.day) {
    const slept = sleepMinutes(slot.day.sleep)
    if (slept != null) bits.push(`${formatMinutes(slept)} sleep`)
    if (slot.day.steps != null) bits.push(`${formatInt(slot.day.steps)} steps`)
    if (slot.day.stress_avg != null) bits.push(`stress ${formatAvg(slot.day.stress_avg, 'tenth')}`)
    if (slot.day.resting_hr != null) bits.push(`${formatAvg(slot.day.resting_hr, 'tenth')} bpm resting`)
    if (slot.day.hrv_avg_ms != null) bits.push(`HRV ${formatAvg(slot.day.hrv_avg_ms, 'tenth')}`)
    if (slot.day.exercise_min != null && slot.day.exercise_min > 0) {
      bits.push(`${formatInt(slot.day.exercise_min)} min exercise`)
    }
    if (slot.day.calories_kcal != null) bits.push(`${formatInt(slot.day.calories_kcal)} kcal`)
  }
  slot.workouts.forEach((workout) => bits.push(workoutSummary(workout)))
  return bits.join(' · ')
}

export function slotSummary(slot: Slot): string {
  const line = figureLine(slot)
  if (!line) return `${formatLong(slot.date)}, no data`
  return `${formatLong(slot.date)}. ${line}`
}

export type Stat = { avg: number | null; days: number }

function stat(values: Array<number | null | undefined>): Stat {
  const nums = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (nums.length === 0) return { avg: null, days: 0 }
  return { avg: nums.reduce((total, value) => total + value, 0) / nums.length, days: nums.length }
}

export type Summary = {
  anchor: string
  lastSleep: {
    date: string
    minutes: number
    awake: number | null
    avgHr: number | null
    score: number | null
    sleep: Sleep
  } | null
  seven: {
    start: string
    end: string
    steps: Stat
    sleep: Stat
    stress: Stat
    restingHr: Stat
    hrv: Stat
  }
  week: {
    start: string
    end: string
    steps: number | null
    exercise: number | null
    calories: number | null
    workouts: number
  }
  latestWorkout: Workout | null
  spark: Slot[]
}

export function summarize(days: Day[], workouts: Workout[]): Summary | null {
  const span = dataSpan(days, workouts)
  if (!span) return null
  const anchor = span.end
  const sevenStart = addDays(anchor, -6)
  const weekStart = weekStartMonday(anchor)
  const weekEnd = addDays(weekStart, 6)
  const inSeven = days.filter((day) => day.date >= sevenStart && day.date <= anchor)
  const inWeek = days.filter((day) => day.date >= weekStart && day.date <= weekEnd)
  const weekWorkouts = workouts.filter((workout) => workout.date >= weekStart && workout.date <= weekEnd)

  const sleepDays = [...days].sort((a, b) => b.date.localeCompare(a.date))
  let lastSleep: Summary['lastSleep'] = null
  for (let i = 0; i < sleepDays.length; i++) {
    const day = sleepDays[i]
    const minutes = sleepMinutes(day.sleep)
    if (minutes == null || !day.sleep) continue
    lastSleep = {
      date: day.date,
      minutes,
      awake: day.sleep.awake_min,
      avgHr: day.sleep.avg_hr,
      score: day.sleep.score,
      sleep: day.sleep,
    }
    break
  }

  const latestWorkout = workouts.length
    ? [...workouts].sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date)
        return (b.duration_s ?? 0) - (a.duration_s ?? 0)
      })[0]
    : null

  return {
    anchor,
    lastSleep,
    seven: {
      start: sevenStart,
      end: anchor,
      steps: stat(inSeven.map((day) => day.steps)),
      sleep: stat(inSeven.map((day) => sleepMinutes(day.sleep))),
      stress: stat(inSeven.map((day) => day.stress_avg)),
      restingHr: stat(inSeven.map((day) => day.resting_hr)),
      hrv: stat(inSeven.map((day) => day.hrv_avg_ms)),
    },
    week: {
      start: weekStart,
      end: weekEnd,
      steps: sum(inWeek.map((day) => day.steps)),
      exercise: sum(inWeek.map((day) => day.exercise_min)),
      calories: sum(inWeek.map((day) => day.calories_kcal)),
      workouts: weekWorkouts.length,
    },
    latestWorkout,
    spark: buildSlots(days, workouts, '7d'),
  }
}

export function niceStep(span: number, count: number): number {
  const rough = Math.abs(span) / Math.max(1, count)
  if (!Number.isFinite(rough) || rough === 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(rough)))
  const err = rough / pow
  const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1
  return mult * pow
}

export function paddedDomain(
  values: number[],
  zeroBased: boolean
): { min: number; max: number; ticks: number[] } {
  const finite = values.filter((value) => Number.isFinite(value))
  if (finite.length === 0) return { min: 0, max: 1, ticks: [0, 1] }
  let min = Math.min(...finite)
  let max = Math.max(...finite)
  if (zeroBased) {
    min = Math.min(0, min)
    if (max <= min) max = min + 1
    const step = niceStep(max - min, 4)
    const top = Math.max(step, Math.ceil((max - min) / step) * step + min)
    const ticks: number[] = []
    for (let value = min; value <= top + step * 0.01 && ticks.length < 8; value += step) {
      ticks.push(Number(value.toFixed(6)))
    }
    return { min, max: ticks[ticks.length - 1] ?? top, ticks }
  }
  if (min === max) {
    const pad = Math.abs(min) * 0.25 || 1
    min -= pad
    max += pad
  } else {
    const pad = (max - min) * 0.18
    min -= pad
    max += pad
  }
  const step = niceStep(max - min, 3)
  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let value = start; value <= end + step * 0.01 && ticks.length < 8; value += step) {
    ticks.push(Number(value.toFixed(6)))
  }
  return { min: ticks[0] ?? start, max: ticks[ticks.length - 1] ?? end, ticks }
}

export type ChartGeom = {
  width: number
  height: number
  plot: { x: number; y: number; w: number; h: number }
  slotW: number
  barW: number
  min: number
  max: number
  x: (index: number) => number
  y: (value: number) => number
}

export function chartGeom(count: number, min: number, max: number, height: number): ChartGeom {
  const width = 560
  const padL = 42
  const padR = 4
  const padT = 12
  const padB = 22
  const plot = { x: padL, y: padT, w: width - padL - padR, h: height - padT - padB }
  const span = max - min || 1
  const slotW = plot.w / Math.max(count, 1)
  const barW =
    count <= 10 ? Math.min(28, slotW * 0.55) : count <= 31 ? slotW * 0.62 : Math.max(1.25, slotW * 0.78)
  return {
    width,
    height,
    plot,
    slotW,
    barW,
    min,
    max,
    x: (index) => plot.x + slotW * index + slotW / 2,
    y: (value) => plot.y + plot.h - ((value - min) / span) * plot.h,
  }
}

export function formatTick(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 10000) {
    const thousands = value / 1000
    const text = Number.isInteger(thousands) ? String(thousands) : thousands.toFixed(1)
    return `${text}k`
  }
  if (Number.isInteger(value)) return formatInt(value)
  const tenth = Math.round(value * 10) / 10
  return Number.isInteger(tenth) ? String(tenth) : tenth.toFixed(1)
}

export function axisIndexes(count: number, xAt: (index: number) => number): number[] {
  if (count <= 0) return []
  const step = count <= 14 ? 1 : count <= 21 ? 2 : count <= 45 ? 5 : count <= 120 ? 14 : Math.ceil(count / 6)
  const candidates: number[] = []
  for (let index = 0; index < count; index++) {
    if (index === 0 || index === count - 1 || index % step === 0) candidates.push(index)
  }
  const chosen: number[] = []
  candidates.forEach((index) => {
    if (chosen.length === 0) {
      chosen.push(index)
      return
    }
    const previous = chosen[chosen.length - 1]
    if (xAt(index) - xAt(previous) < 36 && index !== count - 1) return
    if (index === count - 1 && xAt(index) - xAt(previous) < 36) chosen.pop()
    chosen.push(index)
  })
  return chosen
}

export function axisLabel(date: string, previous: string | null): string {
  const day = String(Number(date.slice(8)))
  const month = date.slice(5, 7)
  if (!previous || previous.slice(5, 7) !== month) return `${MONTHS[Number(month) - 1]} ${day}`
  return day
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/** Monday-first cells. `null` is a leading or trailing pad. */
export function monthGrid(year: number, month: number): Array<string | null> {
  const count = daysInMonth(year, month)
  const first = `${year}-${String(month).padStart(2, '0')}-01`
  const lead = (weekdayIndex(first) + 6) % 7
  const cells: Array<string | null> = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let day = 1; day <= count; day++) {
    cells.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function monthsCovered(start: string, end: string): Array<{ year: number; month: number }> {
  const out: Array<{ year: number; month: number }> = []
  let year = Number(start.slice(0, 4))
  let month = Number(start.slice(5, 7))
  const endYear = Number(end.slice(0, 4))
  const endMonth = Number(end.slice(5, 7))
  while (year < endYear || (year === endYear && month <= endMonth)) {
    out.push({ year, month })
    month += 1
    if (month === 13) {
      month = 1
      year += 1
    }
  }
  return out
}
