import { getBlogPosts } from 'app/blog/utils'
import { getJournalEntries } from 'app/journal/utils'

export const baseUrl = 'https://www.akinn.dev'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let journal = getJournalEntries().map((entry) => ({
    url: `${baseUrl}/journal/${entry.slug}`,
    lastModified: entry.metadata.publishedAt,
  }))

  let routes = ['', '/blog', '/journal', '/health'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs, ...journal]
}
