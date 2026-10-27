import { Journal } from 'app/components/journal'

export const metadata = {
  title: 'Journal',
  description: 'Short notes on what I am up to.',
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Journal</h1>
      <Journal />
    </section>
  )
}
