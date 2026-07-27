import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Ideas',
  description: 'A list of my ideas.',
}

// Newest ideas first — always add new ideas at the top of this array.
const ideas: {
  title: string
  description: string
  url?: string
  image?: string
}[] = [
  {
    title: 'An e-ink crypto watcher',
    description:
      'You scan the QR at start, auth in your phone/pc, and start to add crypto to watch it in the graph. You see the list at "home", and can press to join and see each crypto full screen.',
    url: 'https://www.reddit.com/r/raspberry_pi/comments/mrne5p/my_eink_cryptowatcher/',
    image: '/ideas/eink-crypto-watcher.webp',
  },
]

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Ideas</h1>
      <div>
        {ideas.map((idea) => (
          <div key={idea.title} className="flex flex-col space-y-1 mb-8">
            <p className="text-neutral-900 dark:text-neutral-100 tracking-tight font-medium">
              {idea.title}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {idea.description}
            </p>
            {idea.url && (
              <Link
                href={idea.url}
                className="text-neutral-600 dark:text-neutral-400 underline break-all"
              >
                {idea.url}
              </Link>
            )}
            {idea.image && (
              <Image
                src={idea.image}
                alt={idea.title}
                width={640}
                height={315}
                className="rounded-lg mt-2"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
