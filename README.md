# ASCEND Learning Library

A public educational resource library for student teams at two-year community
colleges and four-year universities, their faculty mentors, and university pod
leads. The library is a working
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
starts the live-reloading development server using `_preview/`, including local
large-file downloads. Stop it with Ctrl+C. Production builds use `_site/`.

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
- About ASCEND, Science & Research Questions, and Teams & Project Structure
  pages connect the learning resources to the project’s purpose.
- All nine FAA Part 107 reference-topic pages, with Airspace fully prototyped.
- 24 resource records, including two supplied books, five Part 107 slide decks,
  a trainer build guide, grouped aircraft design files, and future placeholders.
- Eight browser-readable PDF copies plus original DOCX/PPTX files.
- Trainer and fixed-wing research UAS project pages with STL, DXF, and Fusion files.
- Web-first resource pages with optional contributor, source, and review metadata.
- Resource browsing by collection, subject, platform, activity, type, and audience.
- Site-wide static full-text search, including metadata filters.
- Responsive layouts, skip link, keyboard menu, visible focus, reduced-motion
  support, caption/transcript fields, and video loading only on request.
- A real 404 page, local assets, deployment headers, and GitHub build checks.

Supplied educational files are now connected. Videos, worksheets, and quizzes
without supplied material remain marked Planned. Originals are preserved;
importing them does not assert a new content license or regulatory review.
See [the import inventory](docs/IMPORTED-MATERIALS.md) for all 50 originals,
eight reading copies, and the remaining public-storage setup.

## Project structure

```text
content/
  _data/topics.json          Navigation, sections, and subsection lists
  _data/site.json            Library name and description
  _data/materials.json       File inventory, checksums, and centralized URLs
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
  downloads/imported/       Distribution files within the Pages asset limit
  _headers                  Optional Cloudflare response headers
  robots.txt                Prototype indexing restriction
scripts/check-site.mjs       Checks built pages and internal links
tests/                     Playwright browser checks
docs/                      Editing, architecture, and deployment instructions
.eleventy.js                Build configuration and content collections
.node-version               Deployment Node version
package-lock.json           Reproducible dependencies; commit this file
ASCEND-Materials/           Local intake originals; ignored by Git
artifacts/                  Local PDF conversion outputs; ignored by Git
_preview/                   Generated local preview including large files
_site/                      Generated deployment output; do not edit or commit
```

## Edit content without editing HTML

Start with [the contributor-to-curator workflow](docs/CONTENT-WORKFLOW.md), then
[the editing guide](docs/EDITING.md). Contributors can send ordinary files;
Markdown is our publishing format. Copy an existing Markdown file,
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

Complete remaining placeholder content, configure the large-file URLs, verify
accessibility of actual documents and videos,
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
