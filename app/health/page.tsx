import { Dashboard } from './dashboard'
import { Headlines } from './headlines'
import { loadHealth } from './load'

export const metadata = {
  title: 'Health',
  description: 'Sleep, heart rate, steps, and workouts from a COROS PACE 4.',
}

export default function Page() {
  const { days, workouts } = loadHealth()
  const hasData = days.length > 0 || workouts.length > 0

  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">Health</h1>
      <p className="mb-8 text-neutral-600 dark:text-neutral-400">
        Sleep, heart rate, steps, and workouts from a COROS PACE 4, one day at a time.
        In the spirit of{' '}
        <a
          href="https://writings.stephenwolfram.com/2012/03/the-personal-analytics-of-my-life"
          className="underline decoration-neutral-400 underline-offset-2 dark:decoration-neutral-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stephen Wolfram&apos;s personal analytics
        </a>.
      </p>
      {hasData ? (
        <>
          <Headlines days={days} workouts={workouts} />
          <Dashboard days={days} workouts={workouts} />
        </>
      ) : (
        <p className="text-neutral-600 dark:text-neutral-400">No days recorded yet.</p>
      )}
      <p className="mt-12 text-sm text-neutral-500 dark:text-neutral-400">
        Daily totals from the watch. No routes and no raw samples.
      </p>
    </section>
  )
}
