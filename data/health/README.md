# Health data

Daily aggregates for the `/health` page. The site reads these files at **build time**. Adding or replacing a file and pushing to the repo is enough: the next deploy picks it up. There is no database and no runtime fetch.

Write **one new file per day** (and one per workout). Do not append to a shared array. Replacing a single day's file is fine when that day is restated. Leave older files untouched.

Dates are the wearer's calendar dates (`YYYY-MM-DD`), not UTC timestamps. Do not shift them.

## Privacy

This repository is public. Files may contain only the fields below.

Do not write GPS, coordinates, routes, pace splits, per-minute or per-sample series, heart-rate streams, or menstrual data. The build rejects keys that look like location or raw series, and it rejects arrays longer than a handful of workouts.

A missing file is a gap. JSON `null` (or an omitted field) is a gap for that field. A numeric `0` is a real zero. Do not backfill a baseline into days that do not have a measurement.

## Layout

```
data/health/days/YYYY-MM-DD.json
data/health/workouts/YYYY-MM-DD-<sport>.json
```

`<sport>` is the `sport` value with underscores turned into hyphens (`pool_swim` → `pool-swim`). If that path already exists, use `YYYY-MM-DD-<sport>-2.json`, then `-3`, and so on. The `date` inside the file is authoritative. The name must start with that date.

## Day file

`data/health/days/YYYY-MM-DD.json` is one JSON object. The filename date and the `date` field must match. Sleep is dated by the **wake-up morning**: a night that ends on the morning of 2026-10-31 belongs in `2026-10-31.json`.

| Field | Type | Meaning |
| --- | --- | --- |
| `date` | string | `YYYY-MM-DD` |
| `steps` | number or null | Step count |
| `calories_kcal` | number or null | Kilocalories for the day, as the watch reports them |
| `exercise_min` | number or null | Exercise minutes |
| `stress_avg` | number or null | Average stress score for the day |
| `resting_hr` | number or null | Resting heart rate, beats per minute |
| `hrv_avg_ms` | number or null | Average heart-rate variability, milliseconds |
| `sleep` | object or null | See below. Omit or `null` when unknown |
| `workouts` | array | Optional. Prefer separate workout files |

`sleep`:

| Field | Type | Meaning |
| --- | --- | --- |
| `total_min` | number or null | Whole recorded night, minutes, including awake |
| `deep_min` | number or null | Deep sleep, minutes |
| `light_min` | number or null | Light sleep, minutes |
| `rem_min` | number or null | REM, minutes |
| `awake_min` | number or null | Awake during the night, minutes |
| `avg_hr` | number or null | Average heart rate during sleep, bpm |
| `score` | number or null | Optional vendor sleep score. Omit when unknown |

Numbers are JSON numbers, never strings. Use `null`, not `""` or `"N/A"`.

```json
{
  "date": "2026-10-30",
  "steps": 6472,
  "calories_kcal": 285,
  "exercise_min": 6,
  "stress_avg": 33,
  "resting_hr": null,
  "hrv_avg_ms": null,
  "sleep": {
    "total_min": 517,
    "deep_min": 73,
    "light_min": 252,
    "rem_min": 99,
    "awake_min": 93,
    "avg_hr": 58
  }
}
```

A day you know was quiet, with no sleep record:

```json
{
  "date": "2026-10-31",
  "steps": 0,
  "calories_kcal": null,
  "exercise_min": 0,
  "stress_avg": null,
  "resting_hr": 46,
  "hrv_avg_ms": 42,
  "sleep": null
}
```

## Workout file

One JSON object per session:

| Field | Type | Meaning |
| --- | --- | --- |
| `date` | string | `YYYY-MM-DD` of the session |
| `sport` | string or null | Snake-case sport id, e.g. `pool_swim`, `strength`, `run` |
| `duration_s` | number or null | Duration in seconds |
| `distance_m` | number or null | Distance in meters. `null` when the sport has none |
| `avg_hr` | number or null | Average heart rate, bpm |
| `calories_kcal` | number or null | Kilocalories for the session |

```json
{
  "date": "2026-10-21",
  "sport": "pool_swim",
  "duration_s": 2965,
  "distance_m": 825,
  "avg_hr": 118,
  "calories_kcal": 360
}
```

A workout may instead be embedded in that day's file under `workouts`. Embedded `date` may be omitted (it defaults to the day). If present, it must match the day. Do not write the same session in both places; identical records are kept once.

```json
"workouts": [
  {
    "sport": "run",
    "duration_s": 1800,
    "distance_m": 5000,
    "avg_hr": 142,
    "calories_kcal": 320
  }
]
```

## Rules the build enforces

- UTF-8 JSON. A leading BOM is stripped.
- Unknown keys are ignored. Do not use them to sneak in private fields.
- Keys whose names look like locations, routes, samples, series, or menstrual data fail the build.
- Arrays longer than 24 items fail the build (that shape is a time series, not a workout list).
- `steps` and the other metrics must be finite numbers or `null`.
- Days do not need to be contiguous. Skip a date by not writing a file.
