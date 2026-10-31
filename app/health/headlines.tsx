import { StageBar } from './charts'
import {
  formatAvg,
  formatInt,
  formatMinutes,
  formatMonthDay,
  formatSport,
  summarize,
  workoutDetail,
  type Day,
  type Stat,
  type Summary,
  type Workout,
} from './model'

function coverage(stat: Stat): string | null {
  if (stat.avg == null || stat.days >= 7) return null
  return stat.days === 1 ? '1 day' : `${stat.days} days`
}

function Average({ label, value, note }: { label: string; value: string; note?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-0.5 tabular-nums tracking-tight">
        {value}
        {note && <span className="text-neutral-400"> · {note}</span>}
      </p>
    </div>
  )
}

function sleepHint(summary: Summary): string {
  const last = summary.lastSleep
  if (!last) return 'No night yet'
  const bits = [formatMonthDay(last.date)]
  if (last.avgHr != null) bits.push(`${formatAvg(last.avgHr, 'tenth')} bpm`)
  else if (last.score != null) bits.push(`score ${formatAvg(last.score, 'tenth')}`)
  return bits.join(' · ')
}

export function Headlines({ days, workouts }: { days: Day[]; workouts: Workout[] }) {
  const summary = summarize(days, workouts)
  if (!summary) return null
  const latestDetail = summary.latestWorkout ? workoutDetail(summary.latestWorkout) : ''

  return (
    <div className="mb-10">
      <div className="grid grid-cols-3 gap-3">
        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-tighter tabular-nums sm:text-2xl">
            {summary.lastSleep ? formatMinutes(summary.lastSleep.minutes) : '—'}
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Last sleep</p>
          {summary.lastSleep && <StageBar sleep={summary.lastSleep.sleep} className="mt-2 w-full" />}
          <p className="mt-1 text-xs text-neutral-400">{sleepHint(summary)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-tighter tabular-nums sm:text-2xl">
            {summary.seven.steps.avg != null ? formatInt(summary.seven.steps.avg) : '—'}
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Steps</p>
          <p className="text-xs text-neutral-400">7-day avg</p>
          <p className="text-xs text-neutral-400">
            {formatMonthDay(summary.seven.start)} – {formatMonthDay(summary.seven.end)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-tighter tabular-nums sm:text-2xl">
            {summary.week.steps != null ? formatInt(summary.week.steps) : '—'}
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Steps this week</p>
          <p className="mt-1 text-xs text-neutral-400">
            {summary.week.workouts === 0
              ? 'No workouts'
              : summary.week.workouts === 1
                ? '1 workout'
                : `${summary.week.workouts} workouts`}
          </p>
          {summary.week.exercise != null && (
            <p className="text-xs text-neutral-400">{formatInt(summary.week.exercise)} min</p>
          )}
          <p className="text-xs text-neutral-400">
            {formatMonthDay(summary.week.start)} – {formatMonthDay(summary.week.end)}
          </p>
        </div>
      </div>

      <p className="mb-3 mt-8 text-sm text-neutral-500 dark:text-neutral-400">
        7-day averages
        <span className="text-neutral-400">
          {' '}
          · {formatMonthDay(summary.seven.start)} – {formatMonthDay(summary.seven.end)}
        </span>
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
        <Average
          label="Sleep"
          value={formatMinutes(summary.seven.sleep.avg)}
          note={coverage(summary.seven.sleep)}
        />
        <Average
          label="Resting HR"
          value={
            summary.seven.restingHr.avg != null
              ? `${formatAvg(summary.seven.restingHr.avg, 'tenth')} bpm`
              : '—'
          }
          note={coverage(summary.seven.restingHr)}
        />
        <Average
          label="HRV"
          value={
            summary.seven.hrv.avg != null ? `${formatAvg(summary.seven.hrv.avg, 'tenth')} ms` : '—'
          }
          note={coverage(summary.seven.hrv)}
        />
        <Average
          label="Stress"
          value={formatAvg(summary.seven.stress.avg, 'tenth')}
          note={coverage(summary.seven.stress)}
        />
      </div>

      {summary.latestWorkout && (
        <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
          Last workout · {formatMonthDay(summary.latestWorkout.date, true)} ·{' '}
          {formatSport(summary.latestWorkout.sport)}
          {latestDetail ? ` · ${latestDetail}` : ''}
        </p>
      )}
    </div>
  )
}
