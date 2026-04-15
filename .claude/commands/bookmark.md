Add a new bookmark to the bookmarks page.

The user will provide a URL and title as: $ARGUMENTS

Parse the arguments to extract the URL and title. The format is flexible — the user may provide them as:
- `<url> <title>`
- `<title> <url>`
- `"<title>" <url>`

Steps:
1. Read `app/components/links.tsx`
2. Add a new entry to the `links` array with today's date, the provided URL, and the provided title
3. Append the new entry at the end of the array (before the closing bracket `]`)
4. Use the same format as existing entries: `{ date: new Date('YYYY-MM-DD'), url: '<url>', title: '<title>' }`
