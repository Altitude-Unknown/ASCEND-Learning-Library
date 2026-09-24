# Editing the learning library

## The everyday workflow

1. Copy a similar `.md` file in `content/`.
2. Edit the YAML metadata between the `---` lines. Use spaces, not tabs.
3. Write the page body in Markdown. Begin body sections at `##`: the template
   already renders the page title as the single `#`/H1 heading.
4. Run `npm run preview`, review the page, then run `npm test`.
5. Commit and push after review. Once connected, Cloudflare rebuilds the site.

You can also edit Markdown directly in GitHub. A pull request is preferable to
editing the production branch: it provides a Cloudflare preview for review.

## Add a resource

Create `content/resources/your-resource.md`. This is a template: replace its
sample title/description before making it available. An unconnected record
remains Planned and does not display a working download button.

```yaml
---
id: your-resource
title: Your resource title
description: A short, useful description of what the learner will find.
topic: part107
kind: Worksheet
status: Planned
permalink: /resources/your-resource/
audience:
  - Students
  - Teachers
format: PDF
updated: '2026-09-23'
---

## About this resource

Describe its purpose here.

## How to use it

Write instructions in ordinary Markdown.
```

Keep `id` and `permalink` unchanged after publication. `status` is Planned or
Available. Topic IDs: `part107`, `uas`, `air-quality`, `ballooning`, `fabrication`,
`teachers`. Existing types: Activity, Book, CAD model, Instructor guide,
Presentation, Video, Web application, Worksheet. If adding another type, add
it to the type select in `components/browser.njk` too.

Optional metadata:

| Field | Use |
| --- | --- |
| `audience` | List: Students, Teachers, Mentors |
| `educationLevel` | Free text, such as a reviewed grade range |
| `estimatedTime` | Human-readable estimate; do not invent estimates |
| `format` | PDF, PPTX, DOCX, STL, DXF, STEP, ZIP, INO, CSV, etc. |
| `fileSize` | Human-readable value from the actual file |
| `version` | Resource version; quote numeric-looking versions |
| `updated` | Quoted ISO date for the resource record |
| `author` | Actual author or organization |
| `license` | Verified reuse terms; no default license is assumed |
| `downloadUrl` | Root-relative local file or public HTTPS object-storage URL |
| `externalUrl` | Public HTTPS link to a document, website, or application |
| `actionLabel` | Meaningful action such as Download student materials |
| `thumbnail` | Local or HTTPS image path |
| `thumbnailAlt` | Description of a meaningful image; empty only if decorative |
| `related` | List of other resource IDs |
| `keywords` | List of terms used by collection filters |
| `youtubeId` | Actual 11-character video ID; omit until known |
| `captionStatus` | Verified caption information, not an assumption |
| `transcript` | Link to an accessible transcript page or file |

A record can offer both `externalUrl` (view online) and `downloadUrl` (download);
both buttons appear when supplied.

Only supply fields you know. Metadata absent from a record is omitted or
labeled unspecified. Resource publication does not imply licensing permission.

## Attach a downloadable file

For small files, place the real document in `public/downloads/`. A file named
`worksheet-v1.pdf` would be linked as `/downloads/worksheet-v1.pdf` in that
record's `downloadUrl`. Set `status: Available` only when the file exists and
has been checked. Avoid spaces in filenames. Do not put files into `_site/`:
that folder is regenerated.

For larger files, use a public HTTPS URL from Cloudflare R2 or another object
store. Do not use temporary signed URLs for permanent public resources. Keep
large videos, CAD bundles, and versioned firmware archives out of Git. Check
permissions in a signed-out browser for Google Docs/Drive resources.

Cloudflare Pages currently limits individual assets to 25 MiB; see the linked
limits in DEPLOYMENT.md. Use external storage rather than pushing that limit.

## Add a video

Copy `content/resources/airspace-video.md`. Set `kind: Video`, a real
`youtubeId`, title, description, caption status, and transcript. Then set
Available. The Videos section includes it automatically. The reader must click
Load video before a YouTube privacy-enhanced iframe is inserted. The video
has an accessible title and a dedicated captions/transcript section.

Do not publish an inaccessible video and assume that a transcript placeholder
is sufficient. Review captions and provide the actual transcript.

## Add a learning module or ordinary page

A Part 107 module belongs in `content/part107/`. The folder automatically supplies
the module layout, topic, and collection membership. For example:

```yaml
---
title: Your module title
description: What this module covers.
permalink: /part107/your-module/
order: 10
objectives:
  - A reviewed learning objective.
resourceIds:
  - your-resource
---

## Introduction

Write your lesson here.
```

The learning-path navigation automatically includes it in numeric order. The
homepage currently describes the initial nine-module milestone; update that
copy and the module-count label when changing the path substantially.

For an ordinary page elsewhere, create a Markdown file with
`layout: layouts/article.njk`, `title`, `description`, and `permalink`.
Add a navigation link in the base layout or topics data if needed. Pages do not
appear in navigation simply because they exist, but Pagefind indexes them.

## Change navigation or connect practice tests

`content/_data/topics.json` defines the eight primary sections, descriptions,
icons, and subsection outlines. `layouts/base.njk` holds the compact primary
header links and footer. `content/_data/site.json` holds the site name and
summary. The practice-test resource record is `content/resources/part107-app.md`.
Connect its actual application URL and availability when ready. Topic quiz
buttons are deliberately disconnected in this milestone and should be connected
only once the actual topic-specific application route is known.

## Keep public addresses stable

Replace `downloadUrl`/`externalUrl`, not a landing page's `permalink`. If a public
page must move, add a redirect on the host and preserve its original URL in a
redirect inventory. No production domain or guessed redirects are baked into
this prototype. Choose a domain before adding canonical URLs and a sitemap.
