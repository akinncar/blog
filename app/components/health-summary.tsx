import Link from 'next/link'
import { TrendSparkline } from 'app/health/charts'
import { loadHealth } from 'app/health/load'
import { formatAvg, formatInt, formatMinutes, formatMonthDay, formatSport, sleepMinutes, summarize } from 'app/health/model'

export function HealthSummary() {
  const { days, workouts } = loadHealth()
  const summary = summarize(days, workouts)
  if (!summary) return null

  const middle =
    summary.seven.restingHr.avg != null
      ? {
          value: formatAvg(summary.seven.restingHr.avg, 'tenth'),
          label: 'Resting HR',
          hint: '7-day avg',
          numeric: true,
        }
      : summary.seven.hrv.avg != null
        ? {
            value: formatAvg(summary.seven.hrv.avg, 'tenth'),
            label: 'HRV',
            hint: '7-day avg',
            numeric: true,
          }
        : {
            value: summary.seven.steps.avg != null ? formatInt(summary.seven.steps.avg) : '—',
            label: 'Steps',
            hint: '7-day avg',
            numeric: true,
          }

  const third =
    summary.week.workouts > 0
      ? {
          value: String(summary.week.workouts),
          label: 'Workouts',
          hint: 'This week',
          numeric: true,
        }
      : summary.latestWorkout
        ? {
            value: formatSport(summary.latestWorkout.sport),
            label: 'Last workout',
            hint: formatMonthDay(summary.latestWorkout.date),
            numeric: false,
          }
        : {
            value: '0',
            label: 'Workouts',
            hint: 'This week',
            numeric: true,
          }

  const sleepLabel = summary.lastSleep ? formatMinutes(summary.lastSleep.minutes) : '—'
  const sleepHint = summary.lastSleep ? formatMonthDay(summary.lastSleep.date) : 'No night yet'
  const hasSpark = summary.spark.some(
    (slot) => (slot.day && sleepMinutes(slot.day.sleep) != null) || slot.day?.steps != null
  )

  return (
    <Link
      href="/health"
      className="group mb-10 block border-y border-neutral-200 py-4 dark:border-neutral-800"
    >
      <span className="mb-3 flex items-baseline justify-between">
        <span className="tracking-tight group-hover:underline">Health</span>
        <span className="text-sm text-neutral-500 transition-colors group-hover:text-neutral-800 dark:text-neutral-400 dark:group-hover:text-neutral-200">
          View
        </span>
      </span>
      <span className="grid grid-cols-3 gap-3">
        <Stat value={sleepLabel} label="Last sleep" hint={sleepHint} numeric />
        <Stat value={middle.value} label={middle.label} hint={middle.hint} numeric={middle.numeric} />
        <Stat value={third.value} label={third.label} hint={third.hint} numeric={third.numeric} />
      </span>
      {hasSpark && <TrendSparkline slots={summary.spark} />}
    </Link>
  )
}

function Stat({
  value,
  label,
  hint,
  numeric,
}: {
  value: string
  label: string
  hint: string
  numeric: boolean
}) {
  return (
    <span className="min-w-0">
      <span
        className={`block font-semibold tracking-tighter tabular-nums ${
          numeric ? 'text-xl sm:text-2xl' : 'text-lg leading-snug sm:text-xl'
        }`}
      >
        {value}
      </span>
      <span className="mt-1 block text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="mt-0.5 block text-xs text-neutral-400">{hint}</span>
    </span>
  )
}
