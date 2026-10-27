import Link from 'next/link'
import { formatDate, getJournalEntries } from 'app/journal/utils'

export function Journal() {
  let entries = getJournalEntries()

  return (
    <div>
      {entries
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((entry) => (
          <Link
            key={entry.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/journal/${entry.slug}`}
          >
            <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
              <p className="text-neutral-600 dark:text-neutral-400 w-[160px] shrink-0 whitespace-nowrap tabular-nums">
                {formatDate(entry.metadata.publishedAt, false)}
              </p>
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight flex-1">
                {entry.metadata.title}
              </p>
            </div>
          </Link>
        ))}
    </div>
  )
}
