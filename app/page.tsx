import Link from 'next/link'

const routes = [
  // Hidden until the first post is ready — uncomment to re-enable
  // '/blog',
  '/bookmarks',
  '/notes',
  '/ideas'
]

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Hello 👋
      </h1>
      <p className="mb-8">
        {`I'm Akinn, a software engineer, music producer/dj, investor, youtuber, coffe lover, and a bunch of other things.`}
      </p>
      {/* <p className="mb-4">
        {`Let me tell you about myself`}
      </p> */}
      <h2 className="mb-8 text-2xl font-semibold tracking-tighter">Links</h2>
      <div className="my-8">
        {routes.map(route => 
          <Link key={route} className="pb-4 flex underline" href={route}>{route}</Link>
        )}
        {/* <BlogPosts /> */}
      </div>
    </section>
  )
}
