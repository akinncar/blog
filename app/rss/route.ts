import { getBlogPosts } from 'app/blog/utils'
import { getJournalEntries } from 'app/journal/utils'
import { baseUrl } from 'app/sitemap'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  let posts = [
    ...getBlogPosts().map((post) => ({
      title: post.metadata.title,
      url: `${baseUrl}/blog/${post.slug}`,
      summary: post.metadata.summary || '',
      publishedAt: post.metadata.publishedAt,
    })),
    ...getJournalEntries().map((entry) => ({
      title: entry.metadata.title,
      url: `${baseUrl}/journal/${entry.slug}`,
      summary: entry.metadata.summary || '',
      publishedAt: entry.metadata.publishedAt,
    })),
  ].sort((a, b) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1
    }
    return 1
  })

  const itemsXml = posts
    .map(
      (post) =>
        `<item>
          <title>${escapeXml(post.title)}</title>
          <link>${escapeXml(post.url)}</link>
          <description>${escapeXml(post.summary)}</description>
          <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        </item>`
    )
    .join('\n')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>Akinn Rosa</title>
        <link>${baseUrl}</link>
        <description>Akinn's personal blog</description>
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
