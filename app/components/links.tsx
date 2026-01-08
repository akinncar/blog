import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'

const links = [
  { date: new Date('2025-12-04'), url: 'https://randsinrepose.com/archives/bored-people-quit/', title: 'Bored People Quit' },
  { date: new Date('2025-12-24'), url: 'https://paulgraham.com/angelinvesting.html', title: 'How to Be an Angel Investor' },
  { date: new Date('2025-12-27'), url: 'https://paulgraham.com/selfindulgence.html', title: 'How to Lose Time and Money' },
  { date: new Date('2025-01-05'), url: 'https://techcrunch.com/2025/09/23/tim-chen-has-quietly-become-of-one-the-most-sought-after-solo-investors/', title: 'Tim Chen has quietly become of one the most sought-after solo investors' },
  { date: new Date('2025-01-08'), url: 'https://simonwillison.net/2025/Dec/18/code-proven-to-work/', title: 'Your job is to deliver code you have proven to work' }
]

export function Links() {
  return (
    <div>
      {links
        .reverse()
        .map((link) => (
          <Link
            key={link.url}
            className="flex flex-col space-y-1 mb-4"
            href={link.url}
          >
            <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
              <p className="text-neutral-600 dark:text-neutral-400 w-[160px] tabular-nums">
                {formatDate(link.date.toString(), false)}
              </p>
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight ">
                {link.title}
              </p>
            </div>
          </Link>
        ))}
    </div>
  )
}
