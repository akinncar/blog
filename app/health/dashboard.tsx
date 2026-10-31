'use client'

import { useMemo, useState } from 'react'
import { buildSlots, defaultRange, figureLine, formatLong, formatMonthDay, formatSport, RANGES, workoutDetail, type Day, type RangeId, type Slot, type Workout } from './model'
import { activeLine, LineChart, SleepChart, SleepLegend, StepsChart, WorkoutCalendar } from './charts'

export function Dashboard({ days, workouts }: { days: Day[]; workouts: Workout[] }) {
  const [range, setRange] = useState<RangeId>(() => defaultRange(days, workouts))
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const slots = useMemo(() => buildSlots(days, workouts, range), [days, workouts, range])
  const active = hover ?? pinned
  const showStress = days.some((day) => day.stress_avg != null)
  const listed = [...slots].reverse().filter((slot) => slot.day || slot.workouts.length > 0)
  const workoutsInRange = [...slots]
    .flatMap((slot) => slot.workouts)
    .sort((a, b) => b.date.localeCompare(a.date) || (a.sport ?? '').localeCompare(b.sport ?? ''))

  function pick(date: string) {
    setPinned((current) => (current === date ? null : date))
  }

  function changeRange(next: RangeId) {
    setRange(next)
    setHover(null)
    setPinned(null)
  }

  const resting = slots.map((slot) => slot.day?.resting_hr ?? null)
  const hrv = slots.map((slot) => slot.day?.hrv_avg_ms ?? null)
  const stress = slots.map((slot) => slot.day?.stress_avg ?? null)

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <div className="flex gap-1 text-sm" role="tablist" aria-label="Date range">
          {RANGES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={range === item.id}
              onClick={() => changeRange(item.id)}
              className={`cursor-pointer bg-transparent px-2 py-1 ${
                range === item.id
                  ? 'underline'
                  : 'text-neutral-400 dark:text-neutral-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <p
        className="mb-8 min-h-10 text-sm text-neutral-600 dark:text-neutral-400"
        aria-live="polite"
      >
        {activeLine(slots, active)}
      </p>

      <section className="mb-12">
        <h2 className="mb-2 text-xl font-medium tracking-tight">Sleep</h2>
        <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
          Height is the whole night. Awake sits on top. Blank days have no file.
        </p>
        <SleepLegend />
        <SleepChart slots={slots} active={active} onHover={setHover} onPick={pick} />
      </section>

      <section className="mb-12">
        <h2 className="mb-2 text-xl font-medium tracking-tight">Heart</h2>
        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          Resting heart rate and heart-rate variability, when a day file includes them.
        </p>
        <h3 className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">Resting HR</h3>
        <LineChart
          slots={slots}
          values={resting}
          label="Resting heart rate"
          unit="Beats per minute."
          active={active}
          onHover={setHover}
          onPick={pick}
        />
        <h3 className="mb-2 mt-6 text-sm text-neutral-500 dark:text-neutral-400">HRV</h3>
        <LineChart
          slots={slots}
          values={hrv}
          label="Heart rate variability"
          unit="Milliseconds."
          active={active}
          onHover={setHover}
          onPick={pick}
        />
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-medium tracking-tight">Steps</h2>
        <StepsChart slots={slots} active={active} onHover={setHover} onPick={pick} />
      </section>

      {showStress && (
        <section className="mb-12">
          <h2 className="mb-2 text-xl font-medium tracking-tight">Stress</h2>
          <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">Daily average from the watch.</p>
          <LineChart
            slots={slots}
            values={stress}
            label="Stress"
            unit="Daily average."
            active={active}
            onHover={setHover}
            onPick={pick}
            height={120}
          />
        </section>
      )}

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-medium tracking-tight">Workouts</h2>
        <WorkoutCalendar slots={slots} active={active} onPick={pick} />
        {workoutsInRange.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">No workouts in this range.</p>
        ) : (
          <ul className="mt-6">
            {workoutsInRange.map((workout, index) => (
              <li key={`${workout.date}-${workout.sport ?? 'workout'}-${workout.duration_s ?? index}`} className="mb-4">
                <button
                  type="button"
                  onClick={() => pick(workout.date)}
                  className={`w-full cursor-pointer border-l-2 bg-transparent py-0.5 pl-3 text-left ${
                    active === workout.date ? 'border-current' : 'border-transparent'
                  }`}
                >
                  <span className="flex flex-col md:flex-row md:gap-2">
                    <span className="w-[160px] shrink-0 whitespace-nowrap tabular-nums text-neutral-600 dark:text-neutral-400">
                      {formatLong(workout.date)}
                    </span>
                    <span>
                      <span className="block tracking-tight text-neutral-900 dark:text-neutral-100">
                        {formatSport(workout.sport)}
                      </span>
                      <span className="block text-sm tabular-nums text-neutral-600 dark:text-neutral-400">
                        {workoutDetail(workout)}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {listed.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-3 text-xl font-medium tracking-tight">Daily figures</h2>
          {listed.length > 21 ? (
            <details>
              <summary className="cursor-pointer text-sm text-neutral-500 dark:text-neutral-400">
                {listed.length} days in this range
              </summary>
              <FigureList slots={listed.slice(0, 60)} active={active} onPick={pick} />
            </details>
          ) : (
            <FigureList slots={listed} active={active} onPick={pick} />
          )}
        </section>
      )}
    </div>
  )
}

function FigureList({
  slots,
  active,
  onPick,
}: {
  slots: Slot[]
  active: string | null
  onPick: (date: string) => void
}) {
  const withYear = slots.some((slot) => slot.date.slice(0, 4) !== slots[0]?.date.slice(0, 4))
  return (
    <div>
      {slots.map((slot) => (
        <button
          key={slot.date}
          type="button"
          onClick={() => onPick(slot.date)}
          className={`-mx-2 grid w-full cursor-pointer grid-cols-[4.75rem_1fr] gap-x-3 border-0 px-2 py-2 text-left text-sm ${
            active === slot.date ? 'bg-neutral-100 dark:bg-neutral-900' : 'bg-transparent'
          }`}
        >
          <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
            {formatMonthDay(slot.date, withYear)}
          </span>
          <span className="tabular-nums text-neutral-800 dark:text-neutral-200">{figureLine(slot)}</span>
        </button>
      ))}
    </div>
  )
}
