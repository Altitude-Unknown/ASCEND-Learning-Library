# ASCEND Learning Library

A public educational resource library, not an LMS. Milestone 1 is a working
prototype built with **Eleventy, Markdown, Nunjucks templates, and Pagefind**.
The output is ordinary static HTML/CSS/JavaScript: no database, server runtime,
accounts, tracking, CMS, or client-side application framework.

## Preview locally

Use Node.js 22 or newer (Node 22 is selected for deployment).

```sh
npm ci
npm run preview
```

Open **http://localhost:8080**. `preview` first builds the search index, then
starts the live-reloading development server. Stop it with Ctrl+C.

- `npm run dev`: fast live editing; run `npm run build` to refresh search after content changes.
- `npm run build`: produce the complete static website in `_site/`.
- `npm test`: build, index search, and check internal links/anchors/headings.
- `npx playwright install chromium`, then `npm run test:browser`: real browser,
  responsive, keyboard, search, and automated accessibility checks.

Do not open `_site/index.html` as a `file://` URL: root-relative routes and the
search engine need a local HTTP server. For a static preview without watch mode,
run `python3 -m http.server 8080 --directory _site` after building.

## What is included

- Homepage, global navigation and footer, eight major section landing pages.
- All nine FAA Part 107 module pages, with Airspace fully prototyped.
- Nine placeholder resource records: book, PPTX presentation, PDF worksheet,
  instructor document, YouTube video, STL model, web app, sensor activity,
  balloon tracking worksheet.
- Resource browsing with topic/type/audience filters and shareable query URLs.
- Site-wide static full-text search, including metadata filters.
- Responsive layouts, skip link, keyboard menu, visible focus, reduced-motion
  support, caption/transcript fields, and video loading only on request.
- A real 404 page, local assets, deployment headers, and GitHub build checks.

No real educational documents, quizzes, videos, licenses, author identities,
NASA insignia, or live external resource URLs have been invented. Example
objectives and records are labeled. Only replace a Planned record with Available
when its real material is ready. This is not an FAA-approved training course.

## Project structure

```text
content/
  _data/topics.json          Navigation, sections, and subsection lists
  _data/site.json            Library name and description
  _includes/layouts/        Page, module, section, and resource templates
  _includes/components/     Cards, browsing tools, practice CTA, icons
  index.njk                 Homepage composition
  sections.njk              Generates the eight topic landing pages
  library.njk               Filterable resource library
  search.njk                Full-text search page
  part107/*.md              Editable Part 107 lessons
  resources/*.md            Central resource records and permanent pages
public/
  assets/                   Shared styles, progressive enhancement, favicon
  downloads/                Small locally hosted files (empty in prototype)
  _headers                  Optional Cloudflare response headers
  robots.txt                Prototype indexing restriction
scripts/check-site.mjs       Checks built pages and internal links
tests/                     Playwright browser checks
docs/                      Editing, architecture, and deployment instructions
.eleventy.js                Build configuration and content collections
.node-version               Deployment Node version
package-lock.json           Reproducible dependencies; commit this file
_site/                      Generated output; do not edit or commit
```

## Edit content without editing HTML

Start with [the editing guide](docs/EDITING.md). Copy an existing Markdown file,
edit the short metadata block at the top, then write normal Markdown below it.
The site supplies the header, navigation, layout, metadata, and resource cards.

The `permalink` and resource `id` are stable identifiers. Change a file URL in
**one resource record**, not in every lesson. Lessons refer to resource IDs;
resource cards link to the permanent landing page.

## Publish when ready

See [deployment instructions](docs/DEPLOYMENT.md). In a dedicated GitHub repo,
connect Cloudflare Pages to the repository and use:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output | `_site` |
| Root directory | Repository root |
| Node | `22` (also `.node-version`) |

A push triggers the Cloudflare build and deployment. No token belongs in this
repository. This prototype has not created a GitHub remote, Cloudflare project,
or public deployment. Hosting/account setup is a separate step.

## Before public launch

Replace prototype content, verify accessibility of actual documents and videos,
set a project accessibility/contact channel, confirm the required award
acknowledgment and content licenses, and review the actual Part 107 content.
Then set `prototype: false` in `content/_data/site.json` and change `public/robots.txt` to allow indexing.
The robots file is not access control; a preview URL can still be visited.

Automated accessibility checks support the WCAG 2.2 AA design goal but do not
prove conformance. Include manual keyboard, screen-reader, zoom/reflow, touch,
Windows/browser, and downloadable-document checks before launch.

The prototype's source and sample records do not establish a redistribution
license for future educational materials. Select a repository license and
per-resource content licenses with the project owner before distribution.

## Maintenance

Keep the lockfile in Git. Run the build and browser checks after dependency or
layout updates. Review external URLs and learning content regularly, especially
regulatory material. Search updates with each production build. Large files
belong in object storage, not an ever-growing Git history. An export of `_site/`
can run on another static host without Eleventy, Node, or Cloudflare services.
