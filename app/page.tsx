import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Hello 👋
      </h1>
      <p className="mb-4">
        {`I'm Akinn, a software engineer, music producer/dj, investor, youtuber, coffe lover, and a bunch of other things.`}
      </p>
      <p className="mb-4">
        {`Let me tell you about myself`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
