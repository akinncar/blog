# Blog

Personal blog built with Next.js 16 (canary) and React 19.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **MDX**: next-mdx-remote v6
- **Package Manager**: pnpm

## Structure

- `app/blog/` - Blog posts (MDX files in `app/blog/posts/`)
- `app/notes/` - Notes (MDX files in `app/notes/notes/`)
- `app/bookmarks/` - Bookmarks (hardcoded array in `app/components/links.tsx`)
- `app/components/` - Shared components

## Commands

- `pnpm dev` - Start dev server
- `pnpm build` - Production build

## Notes

- Next.js 16 requires `params` to be awaited in dynamic routes (`await params`)
- Bookmarks are stored as a `links` array in `app/components/links.tsx`
