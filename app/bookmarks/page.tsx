// import { BlogPosts } from 'app/components/posts'

import { Links } from "app/components/links"

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Bookmarks</h1>
      <Links />
    </section>
  )
}
