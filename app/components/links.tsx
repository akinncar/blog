import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { title } from 'process'

const links = [
  { date: new Date('2025-12-27'), url: 'https://paulgraham.com/angelinvesting.html', title: 'How to Be an Angel Investor' },
  { date: new Date('2025-12-27'), url: 'https://paulgraham.com/selfindulgence.html', title: 'How to Lose Time and Money ' }
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
