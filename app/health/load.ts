import fs from 'fs'
import path from 'path'
import { isIsoDate, type Day, type HealthData, type Sleep, type Workout } from './model'

const SENSITIVE = /gps|lat|lng|lon|route|coord|polyline|sample|series|menstr|location|altitude|pace_series|hr_series|raw/i

function rel(file: string): string {
  return path.relative(process.cwd(), file)
}

function readJson(file: string): unknown {
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`${rel(file)}: invalid JSON`)
  }
}

function assertPublic(value: unknown, file: string): void {
  if (Array.isArray(value)) {
    if (value.length > 24) {
      throw new Error(
        `${rel(file)}: refusing a ${value.length}-item array. Store daily aggregates and workouts, not raw series.`
      )
    }
    value.forEach((item) => assertPublic(item, file))
    return
  }
  if (!value || typeof value !== 'object') return
  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    if (SENSITIVE.test(key)) {
      throw new Error(`${rel(file)}: "${key}" is not allowed in public health files`)
    }
    assertPublic(child, file)
  })
}

function numberField(value: unknown, file: string, field: string): number | null {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  throw new Error(`${rel(file)}: ${field} must be a number or null`)
}

function sleepField(value: unknown, file: string): Sleep | null {
  if (value == null) return null
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${rel(file)}: sleep must be an object or null`)
  }
  const sleep = value as Record<string, unknown>
  const normalized: Sleep = {
    total_min: numberField(sleep.total_min, file, 'sleep.total_min'),
    deep_min: numberField(sleep.deep_min, file, 'sleep.deep_min'),
    light_min: numberField(sleep.light_min, file, 'sleep.light_min'),
    rem_min: numberField(sleep.rem_min, file, 'sleep.rem_min'),
    awake_min: numberField(sleep.awake_min, file, 'sleep.awake_min'),
    avg_hr: numberField(sleep.avg_hr, file, 'sleep.avg_hr'),
    score: numberField(sleep.score, file, 'sleep.score'),
  }
  const any = Object.values(normalized).some((item) => item != null)
  return any ? normalized : null
}

function sportField(value: unknown, file: string): string | null {
  if (value == null) return null
  if (typeof value !== 'string') throw new Error(`${rel(file)}: sport must be a string or null`)
  const sport = value.trim()
  if (!sport) return null
  if (sport.length > 64) throw new Error(`${rel(file)}: sport is unexpectedly long`)
  return sport
}

function workoutField(value: unknown, file: string, fallbackDate: string | null): Workout {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${rel(file)}: a workout must be a JSON object`)
  }
  const record = value as Record<string, unknown>
  let date = record.date
  if (date == null && fallbackDate) date = fallbackDate
  if (typeof date !== 'string' || !isIsoDate(date)) {
    throw new Error(`${rel(file)}: workout date must be YYYY-MM-DD`)
  }
  if (fallbackDate && date !== fallbackDate) {
    throw new Error(`${rel(file)}: embedded workout date ${date} does not match ${fallbackDate}`)
  }
  return {
    date,
    sport: sportField(record.sport, file),
    duration_s: numberField(record.duration_s, file, 'duration_s'),
    distance_m: numberField(record.distance_m, file, 'distance_m'),
    avg_hr: numberField(record.avg_hr, file, 'avg_hr'),
    calories_kcal: numberField(record.calories_kcal, file, 'calories_kcal'),
  }
}

function filenameMatchesDate(filename: string, date: string): boolean {
  const base = filename.replace(/\.json$/i, '')
  return base === date || base.startsWith(`${date}-`)
}

function dayFromFile(file: string): { day: Day; workouts: Workout[] } {
  const parsed = readJson(file)
  assertPublic(parsed, file)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${rel(file)}: day file must be a JSON object`)
  }
  const record = parsed as Record<string, unknown>
  if (typeof record.date !== 'string' || !isIsoDate(record.date)) {
    throw new Error(`${rel(file)}: date must be YYYY-MM-DD`)
  }
  const base = path.basename(file)
  if (base !== `${record.date}.json`) {
    throw new Error(`${rel(file)}: filename must be ${record.date}.json`)
  }
  const workouts: Workout[] = []
  if (record.workouts != null) {
    if (!Array.isArray(record.workouts)) throw new Error(`${rel(file)}: workouts must be an array`)
    record.workouts.forEach((item) => workouts.push(workoutField(item, file, record.date as string)))
  }
  return {
    day: {
      date: record.date,
      steps: numberField(record.steps, file, 'steps'),
      calories_kcal: numberField(record.calories_kcal, file, 'calories_kcal'),
      exercise_min: numberField(record.exercise_min, file, 'exercise_min'),
      stress_avg: numberField(record.stress_avg, file, 'stress_avg'),
      resting_hr: numberField(record.resting_hr, file, 'resting_hr'),
      hrv_avg_ms: numberField(record.hrv_avg_ms, file, 'hrv_avg_ms'),
      sleep: sleepField(record.sleep, file),
    },
    workouts,
  }
}

function workoutsFromFile(file: string): Workout[] {
  const parsed = readJson(file)
  assertPublic(parsed, file)
  const items = Array.isArray(parsed) ? parsed : [parsed]
  return items.map((item) => {
    const workout = workoutField(item, file, null)
    if (!filenameMatchesDate(path.basename(file), workout.date)) {
      throw new Error(`${rel(file)}: filename must start with ${workout.date}`)
    }
    return workout
  })
}

function jsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith('.json') && !name.startsWith('.'))
    .map((name) => path.join(dir, name))
}

function workoutKey(workout: Workout): string {
  return [
    workout.date,
    workout.sport ?? '',
    workout.duration_s ?? '',
    workout.distance_m ?? '',
    workout.avg_hr ?? '',
    workout.calories_kcal ?? '',
  ].join('|')
}

export function loadHealth(): HealthData {
  const root = path.join(process.cwd(), 'data', 'health')
  const days: Day[] = []
  const workouts: Workout[] = []
  const seenDays = new Set<string>()
  const seenWorkouts = new Set<string>()

  jsonFiles(path.join(root, 'days')).forEach((file) => {
    const parsed = dayFromFile(file)
    if (seenDays.has(parsed.day.date)) {
      throw new Error(`${rel(file)}: duplicate day ${parsed.day.date}`)
    }
    seenDays.add(parsed.day.date)
    days.push(parsed.day)
    parsed.workouts.forEach((workout) => {
      const key = workoutKey(workout)
      if (seenWorkouts.has(key)) return
      seenWorkouts.add(key)
      workouts.push(workout)
    })
  })

  jsonFiles(path.join(root, 'workouts')).forEach((file) => {
    workoutsFromFile(file).forEach((workout) => {
      const key = workoutKey(workout)
      if (seenWorkouts.has(key)) return
      seenWorkouts.add(key)
      workouts.push(workout)
    })
  })

  days.sort((a, b) => a.date.localeCompare(b.date))
  workouts.sort((a, b) => a.date.localeCompare(b.date) || (a.sport ?? '').localeCompare(b.sport ?? ''))
  return { days, workouts }
}
