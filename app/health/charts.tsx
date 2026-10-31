import type { ReactNode } from 'react'
import {
  axisIndexes,
  axisLabel,
  chartGeom,
  figureLine,
  formatLong,
  formatMonthDay,
  formatSport,
  formatTick,
  heatLevel,
  monthGrid,
  monthsCovered,
  paddedDomain,
  sleepMinutes,
  sleepParts,
  slotSummary,
  weekdayIndex,
  weekdayShort,
  workoutMinutes,
  type ChartGeom,
  type Slot,
} from './model'

const SLEEP_SEGMENTS = [
  { key: 'deep', label: 'Deep', color: 'var(--sleep-deep)' },
  { key: 'light', label: 'Light', color: 'var(--sleep-light)' },
  { key: 'rem', label: 'REM', color: 'var(--sleep-rem)' },
  { key: 'awake', label: 'Awake', color: 'var(--sleep-awake)' },
  { key: 'other', label: 'Other', color: 'var(--sleep-other)' },
] as const

export function StageBar({ sleep, className = '' }: { sleep: Parameters<typeof sleepParts>[0]; className?: string }) {
  const parts = sleepParts(sleep)
  if (!parts) return null
  const total = parts.deep + parts.light + parts.rem + parts.awake + parts.other
  if (total <= 0) return null
  return (
    <span className={`flex h-1.5 overflow-hidden ${className}`} aria-hidden="true">
      {SLEEP_SEGMENTS.map((segment) => {
        const value = parts[segment.key]
        if (value <= 0) return null
        return (
          <span
            key={segment.key}
            style={{ width: `${(value / total) * 100}%`, background: segment.color }}
          />
        )
      })}
    </span>
  )
}

export function SleepLegend() {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
      {SLEEP_SEGMENTS.filter((segment) => segment.key !== 'other').map((segment) => (
        <li key={segment.key} className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2" style={{ background: segment.color }} aria-hidden="true" />
          {segment.label}
        </li>
      ))}
    </ul>
  )
}

export function TrendSparkline({ slots }: { slots: Slot[] }) {
  const sleepTotals = slots.map((slot) => (slot.day ? sleepMinutes(slot.day.sleep) : null))
  const hasSleep = sleepTotals.some((value) => value != null)
  const steps = slots.map((slot) => slot.day?.steps ?? null)
  const mode = hasSleep ? 'sleep' : steps.some((value) => value != null) ? 'steps' : null
  if (!mode) return null
  const max = Math.max(
    1,
    ...(mode === 'sleep'
      ? sleepTotals.filter((value): value is number => value != null)
      : steps.filter((value): value is number => value != null))
  )
  return (
    <div className="mt-4 grid grid-cols-7 gap-1.5" aria-hidden="true">
      {slots.map((slot, index) => {
        const parts = mode === 'sleep' && slot.day ? sleepParts(slot.day.sleep) : null
        const stepValue = steps[index]
        return (
          <div key={slot.date}>
            <div className="flex h-8 flex-col justify-end">
              {parts ? (
                <span className="flex flex-col-reverse">
                  {SLEEP_SEGMENTS.map((segment) =>
                    parts[segment.key] > 0 ? (
                      <span
                        key={segment.key}
                        style={{
                          height: `${(parts[segment.key] / max) * 32}px`,
                          background: segment.color,
                        }}
                      />
                    ) : null
                  )}
                </span>
              ) : stepValue != null && stepValue > 0 ? (
                <span
                  className="block w-full bg-current opacity-80"
                  style={{ height: `${Math.max(1, (stepValue / max) * 32)}px` }}
                />
              ) : (
                <span className="block h-px w-full bg-current opacity-20" />
              )}
            </div>
            <span className="mt-1 block text-center text-[10px] tabular-nums text-neutral-400">
              {Number(slot.date.slice(8))}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function pointerIndex(
  event: { clientX: number; currentTarget: SVGSVGElement },
  geom: ChartGeom,
  count: number
): number | null {
  const rect = event.currentTarget.getBoundingClientRect()
  if (rect.width === 0) return null
  const viewX = ((event.clientX - rect.left) / rect.width) * geom.width
  if (viewX < geom.plot.x || viewX > geom.plot.x + geom.plot.w) return null
  const index = Math.floor((viewX - geom.plot.x) / geom.slotW)
  if (index < 0 || index >= count) return null
  return index
}

function ChartFrame({
  slots,
  geom,
  ticks,
  formatY,
  label,
  active,
  onHover,
  onPick,
  children,
}: {
  slots: Slot[]
  geom: ChartGeom
  ticks: number[]
  formatY: (value: number) => string
  label: string
  active: string | null
  onHover: (date: string | null) => void
  onPick: (date: string) => void
  children: ReactNode
}) {
  const activeIndex = active ? slots.findIndex((slot) => slot.date === active) : -1
  const labels = axisIndexes(slots.length, geom.x)
  let previous: string | null = null
  return (
    <svg
      viewBox={`0 0 ${geom.width} ${geom.height}`}
      className="block h-auto w-full cursor-pointer"
      style={{ fontFamily: 'inherit' }}
      role="img"
      aria-label={label}
      onPointerMove={(event) => {
        const index = pointerIndex(event, geom, slots.length)
        onHover(index == null ? null : slots[index].date)
      }}
      onPointerLeave={() => onHover(null)}
      onClick={(event) => {
        const index = pointerIndex(event, geom, slots.length)
        if (index != null) onPick(slots[index].date)
      }}
    >
      <title>{label}</title>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={geom.plot.x}
            x2={geom.plot.x + geom.plot.w}
            y1={geom.y(tick)}
            y2={geom.y(tick)}
            stroke="currentColor"
            strokeOpacity={0.12}
          />
          <text
            x={geom.plot.x - 6}
            y={Math.min(geom.height - 4, Math.max(8, geom.y(tick)))}
            textAnchor="end"
            dominantBaseline="middle"
            fill="currentColor"
            fillOpacity={0.5}
            fontSize={10}
          >
            {formatY(tick)}
          </text>
        </g>
      ))}
      {activeIndex >= 0 && (
        <rect
          x={geom.x(activeIndex) - geom.slotW / 2}
          y={geom.plot.y}
          width={geom.slotW}
          height={geom.plot.h}
          fill="currentColor"
          opacity={0.06}
        />
      )}
      {children}
      {labels.map((index) => {
        const text = axisLabel(slots[index].date, previous)
        previous = slots[index].date
        return (
          <text
            key={slots[index].date}
            x={geom.x(index)}
            y={geom.height - 4}
            textAnchor="middle"
            fill="currentColor"
            fillOpacity={0.5}
            fontSize={10}
          >
            {text}
          </text>
        )
      })}
    </svg>
  )
}

function chartLabel(slots: Slot[], noun: string, detail: string): string {
  if (slots.length === 0) return noun
  const start = formatLong(slots[0].date)
  const end = formatLong(slots[slots.length - 1].date)
  return `${noun} from ${start} to ${end}. ${detail}`
}

export function SleepChart({
  slots,
  active,
  onHover,
  onPick,
}: {
  slots: Slot[]
  active: string | null
  onHover: (date: string | null) => void
  onPick: (date: string) => void
}) {
  const hours = slots.map((slot) => {
    const minutes = slot.day ? sleepMinutes(slot.day.sleep) : null
    return minutes == null ? null : minutes / 60
  })
  const present = hours.filter((value): value is number => value != null)
  if (present.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">No sleep in this range.</p>
  }
  const domain = paddedDomain(present, true)
  const geom = chartGeom(slots.length, domain.min, domain.max, 168)
  const longest = Math.max(...present)
  return (
    <ChartFrame
      slots={slots}
      geom={geom}
      ticks={domain.ticks}
      formatY={(value) => `${formatTick(value)}h`}
      label={chartLabel(slots, 'Sleep by stage', `Longest night ${formatTick(longest)} hours.`)}
      active={active}
      onHover={onHover}
      onPick={onPick}
    >
      {slots.map((slot, index) => {
        const parts = slot.day ? sleepParts(slot.day.sleep) : null
        if (!parts) return null
        let cursor = 0
        const dim = active != null && active !== slot.date
        return (
          <g key={slot.date} opacity={dim ? 0.35 : 1}>
            {SLEEP_SEGMENTS.map((segment) => {
              const minutes = parts[segment.key]
              if (minutes <= 0) return null
              const y = geom.y((cursor + minutes) / 60)
              const height = geom.y(cursor / 60) - y
              cursor += minutes
              return (
                <rect
                  key={segment.key}
                  x={geom.x(index) - geom.barW / 2}
                  y={y}
                  width={geom.barW}
                  height={Math.max(0, height)}
                  fill={segment.color}
                />
              )
            })}
          </g>
        )
      })}
    </ChartFrame>
  )
}

export function StepsChart({
  slots,
  active,
  onHover,
  onPick,
}: {
  slots: Slot[]
  active: string | null
  onHover: (date: string | null) => void
  onPick: (date: string) => void
}) {
  const values = slots.map((slot) => slot.day?.steps ?? null)
  const present = values.filter((value): value is number => value != null)
  if (present.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">No steps in this range.</p>
  }
  const domain = paddedDomain(present, true)
  const geom = chartGeom(slots.length, domain.min, domain.max, 148)
  const peak = Math.max(...present)
  return (
    <ChartFrame
      slots={slots}
      geom={geom}
      ticks={domain.ticks}
      formatY={formatTick}
      label={chartLabel(slots, 'Daily steps', `Peak ${formatTick(peak)} steps.`)}
      active={active}
      onHover={onHover}
      onPick={onPick}
    >
      {slots.map((slot, index) => {
        const value = values[index]
        if (value == null) return null
        const y = geom.y(Math.max(0, value))
        const height = Math.max(value > 0 ? 1 : 0, geom.y(0) - y)
        const dim = active != null && active !== slot.date
        return (
          <rect
            key={slot.date}
            x={geom.x(index) - geom.barW / 2}
            y={y}
            width={geom.barW}
            height={height}
            fill="currentColor"
            opacity={dim ? 0.28 : 0.88}
          />
        )
      })}
    </ChartFrame>
  )
}

export function LineChart({
  slots,
  values,
  label,
  unit,
  active,
  onHover,
  onPick,
  height = 132,
}: {
  slots: Slot[]
  values: Array<number | null>
  label: string
  unit: string
  active: string | null
  onHover: (date: string | null) => void
  onPick: (date: string) => void
  height?: number
}) {
  const present = values.filter((value): value is number => value != null)
  if (present.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">No {label.toLowerCase()} in this range.</p>
  }
  const domain = paddedDomain(present, false)
  const geom = chartGeom(slots.length, domain.min, domain.max, height)
  const segments: Array<Array<{ index: number; value: number }>> = []
  let current: Array<{ index: number; value: number }> = []
  values.forEach((value, index) => {
    if (value == null) {
      if (current.length) segments.push(current)
      current = []
    } else {
      current.push({ index, value })
    }
  })
  if (current.length) segments.push(current)
  return (
    <ChartFrame
      slots={slots}
      geom={geom}
      ticks={domain.ticks}
      formatY={formatTick}
      label={chartLabel(slots, label, unit)}
      active={active}
      onHover={onHover}
      onPick={onPick}
    >
      {segments.map((segment) =>
        segment.length > 1 ? (
          <polyline
            key={segment[0].index}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={segment.map((point) => `${geom.x(point.index).toFixed(2)},${geom.y(point.value).toFixed(2)}`).join(' ')}
          />
        ) : null
      )}
      {present.length <= 45 &&
        values.map((value, index) =>
          value == null ? null : (
            <circle
              key={slots[index].date}
              cx={geom.x(index)}
              cy={geom.y(value)}
              r={active === slots[index].date ? 3.5 : 2.4}
              fill="currentColor"
            />
          )
        )}
    </ChartFrame>
  )
}

function durationWidth(minutes: number | null): string {
  if (minutes == null) return '0%'
  if (minutes <= 0) return '18%'
  return `${Math.min(100, (minutes / 90) * 100)}%`
}

function DayButton({
  slot,
  active,
  onPick,
  children,
  className,
}: {
  slot: Slot
  active: string | null
  onPick: (date: string) => void
  children: ReactNode
  className: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active === slot.date}
      aria-label={slotSummary(slot)}
      onClick={() => onPick(slot.date)}
      className={`cursor-pointer bg-transparent p-0 text-left text-inherit ${className} ${
        active === slot.date ? 'ring-1 ring-neutral-900 dark:ring-neutral-100' : ''
      }`}
    >
      {children}
    </button>
  )
}

function DurationTrack({ slot }: { slot: Slot }) {
  const minutes = workoutMinutes(slot)
  if (!slot.workouts.length) {
    return <span className="mt-1 block h-1 w-full bg-neutral-200 dark:bg-neutral-800" aria-hidden="true" />
  }
  return (
    <span className="mt-1 block h-1 w-full bg-neutral-200 dark:bg-neutral-800" aria-hidden="true">
      <span className="block h-1 bg-[var(--accent)]" style={{ width: durationWidth(minutes) }} />
    </span>
  )
}

export function WorkoutCalendar({
  slots,
  active,
  onPick,
}: {
  slots: Slot[]
  active: string | null
  onPick: (date: string) => void
}) {
  if (slots.length === 0) return null
  if (slots.length <= 10) return <WeekStrip slots={slots} active={active} onPick={onPick} />
  if (slots.length <= 45) return <MonthCalendars slots={slots} active={active} onPick={onPick} />
  return <ContributionGraph slots={slots} active={active} onPick={onPick} />
}

function WeekStrip({
  slots,
  active,
  onPick,
}: {
  slots: Slot[]
  active: string | null
  onPick: (date: string) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {slots.map((slot) => {
        const caption =
          slot.workouts.length > 1
            ? `${slot.workouts.length} sessions`
            : slot.workouts.length === 1
              ? formatSport(slot.workouts[0].sport)
              : '—'
        return (
          <DayButton
            key={slot.date}
            slot={slot}
            active={active}
            onPick={onPick}
            className="min-h-[4.75rem] rounded-md border border-neutral-200 px-1 py-1.5 dark:border-neutral-800"
          >
            <span className="block text-[10px] text-neutral-500">{weekdayShort(slot.date)}</span>
            <span className="block text-sm tabular-nums">{Number(slot.date.slice(8))}</span>
            <span className="mt-1 block truncate text-[10px] leading-tight text-neutral-600 dark:text-neutral-300">
              {caption}
            </span>
            <DurationTrack slot={slot} />
          </DayButton>
        )
      })}
    </div>
  )
}

function MonthCalendars({
  slots,
  active,
  onPick,
}: {
  slots: Slot[]
  active: string | null
  onPick: (date: string) => void
}) {
  const byDate = new Map(slots.map((slot) => [slot.date, slot]))
  const months = monthsCovered(slots[0].date, slots[slots.length - 1].date)
  return (
    <div className="space-y-6">
      {months.map(({ year, month }) => (
        <div key={`${year}-${month}`}>
          <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
            {formatLong(`${year}-${String(month).padStart(2, '0')}-01`).split(' ')[0]} {year}
          </p>
          <div className="mb-1 grid grid-cols-7 gap-1.5 text-center text-[10px] text-neutral-400">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {monthGrid(year, month).map((date, index) => {
              if (!date) return <div key={`pad-${index}`} />
              const slot = byDate.get(date) ?? null
              if (!slot) {
                return (
                  <div key={date} className="px-1 py-1 text-sm tabular-nums text-neutral-300 dark:text-neutral-700">
                    {Number(date.slice(8))}
                  </div>
                )
              }
              const caption =
                slot.workouts.length > 1
                  ? `${slot.workouts.length}`
                  : slot.workouts.length === 1
                    ? formatSport(slot.workouts[0].sport)
                    : null
              return (
                <DayButton
                  key={date}
                  slot={slot}
                  active={active}
                  onPick={onPick}
                  className="rounded-md px-1 py-1"
                >
                  <span
                    className={`block text-sm tabular-nums ${
                      slot.day || slot.workouts.length
                        ? 'text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {Number(date.slice(8))}
                  </span>
                  {caption && (
                    <span className="block truncate text-[10px] leading-tight text-neutral-600 dark:text-neutral-300">
                      {caption}
                    </span>
                  )}
                  {slot.workouts.length > 0 && <DurationTrack slot={slot} />}
                </DayButton>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function ContributionGraph({
  slots,
  active,
  onPick,
}: {
  slots: Slot[]
  active: string | null
  onPick: (date: string) => void
}) {
  const lead = (weekdayIndex(slots[0].date) + 6) % 7
  const cells: Array<Slot | null> = []
  for (let i = 0; i < lead; i++) cells.push(null)
  slots.forEach((slot) => cells.push(slot))
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: Array<Array<Slot | null>> = []
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7))

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="flex w-max">
          <div className="mr-1 mt-5 flex flex-col gap-[3px] text-[10px] leading-3 text-neutral-400">
            {['Mo', '', 'We', '', 'Fr', '', ''].map((label, index) => (
              <div key={index} className="h-3">
                {label}
              </div>
            ))}
          </div>
          <div>
            <div className="mb-1 flex gap-[3px]">
              {weeks.map((week, index) => {
                const days = week.filter((day): day is Slot => day != null)
                const firstOfMonth = days.find((day) => day.date.endsWith('-01'))
                const label =
                  days.length === 0
                    ? ''
                    : index === 0
                      ? formatMonthDay(days[0].date).split(' ')[0]
                      : firstOfMonth
                        ? formatMonthDay(firstOfMonth.date).split(' ')[0]
                        : ''
                return (
                  <div key={index} className="h-4 w-3 overflow-visible whitespace-nowrap text-[10px] text-neutral-400">
                    {label}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((slot, dayIndex) => {
                    if (!slot) return <div key={`empty-${weekIndex}-${dayIndex}`} className="h-3 w-3" />
                    const minutes = workoutMinutes(slot) ?? 0
                    const level = slot.workouts.length === 0 ? 0 : heatLevel(minutes > 0 ? minutes : 20)
                    return (
                      <button
                        key={slot.date}
                        type="button"
                        tabIndex={-1}
                        aria-label={slotSummary(slot)}
                        aria-pressed={active === slot.date}
                        title={slotSummary(slot)}
                        onClick={() => onPick(slot.date)}
                        className="h-3 w-3 rounded-[2px] border-0 p-0"
                        style={{
                          background: `var(--heat-${level})`,
                          outline: active === slot.date ? '1px solid currentColor' : 'none',
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-500">
        <span>Less</span>
        {[0, 1, 2, 3].map((level) => (
          <span key={level} className="h-3 w-3 rounded-[2px]" style={{ background: `var(--heat-${level})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

export function activeLine(slots: Slot[], active: string | null): string {
  if (slots.length === 0) return ''
  if (!active) {
    const recorded = slots.filter((slot) => slot.day).length
    const workouts = slots.reduce((total, slot) => total + slot.workouts.length, 0)
    const range = `${formatMonthDay(slots[0].date)} – ${formatMonthDay(slots[slots.length - 1].date)}`
    const dayLabel = recorded === 1 ? '1 day recorded' : `${recorded} days recorded`
    const workoutLabel = workouts === 1 ? '1 workout' : `${workouts} workouts`
    return `${range} · ${dayLabel} · ${workoutLabel}`
  }
  const slot = slots.find((item) => item.date === active)
  if (!slot) return formatLong(active)
  const line = figureLine(slot)
  return line ? `${formatLong(slot.date)} · ${line}` : `${formatLong(slot.date)} · no data`
}
