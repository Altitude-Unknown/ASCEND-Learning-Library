# Contributing, curating, and publishing ASCEND resources

ASCEND is a public resource library, science primer, engineering handbook, and
field guide. It is not an LMS or a required training sequence. Resources can be
used independently. Faculty may incorporate them into their own courses outside
this website. No accounts, enrollment, grades, tracking, certificates, dashboards,
or assessment infrastructure are part of this workflow.

## What stays

Eleventy, Markdown, Nunjucks layouts, the visual design, existing navigation,
permanent resource URLs, Pagefind search, and the shared file catalog remain.
The existing project-purpose, science, and team-structure pages are reused as
web resources. Books, slides, CAD files, and downloads retain their landing pages.

## What changed

Resource pages present their Markdown explanation before supporting files.
`delivery: web` is a complete resource even without a downloadable file. The
Part 107 pages are independent reference topics; their historic filenames,
URLs, and internal collection name remain unchanged. The existing practice-app
is now integrated at `/part107/practice-tests/` at the owner's request. This
optional Part 107 tool grades a session in browser memory only; no grades,
accounts, or learner records are stored. It does not add assessment features
to other resources. See `docs/PRACTICE-TEST-REVIEW.md` for question curation.

Resource metadata supports optional provenance and review information. A shared
taxonomy adds subjects, platforms, activities, and more resource types without
replacing the eight established navigation areas. Those areas organize broad
collections; the finer labels let a resource cross disciplinary boundaries.

## The contributor's job

Send material in a useful existing format: Word, slides, PDF, Google Docs/Slides,
video, photographs, diagrams, spreadsheets, CSV, code, GitHub links, CAD/STL files,
procedures, or links to existing scientific resources. Contributors can include
leadership, pod leads, faculty, students, experts, institutions, NASA collaborators,
and project partners. They do not need Markdown, Git, or knowledge of this site.

Where known, include the contributor's name/institution, original source,
permission or license, version/date, and any limits on public sharing. These are
curation inputs; they are not automatically copied onto a public page.

## The curator's workflow

1. **Receive and retain the source.** Use `editorial/intake/` or another private
   working location. This folder is ignored by Git and is outside the website's
   input directory. The earlier `ASCEND-Materials/` folder remains the intake for
   the already imported files. Keep a separate backup of originals.
2. **Review and select.** The project owner decides what to publish, the intended
   audience, what needs technical review, and what may be attributed publicly.
   Do not automatically publish every incoming file. The proposal remains
   background-only and must not become a downloadable resource.
3. **Adapt for the web.** Work in `editorial/drafts/`, also ignored by Git and
   outside the build. Use Markdown for the normalized publishing copy. Preserve
   the explanation, procedure, useful figures, and source attribution; link to
   existing explanations rather than repeating them. Keep an original download
   when useful, but explanatory material should primarily be readable online.
4. **Review the draft.** Check technical meaning, accessibility, links, licensing,
   and contributor credit. Record a reviewer and date only after an actual
   review. A file import or PDF conversion is not a scientific review.
5. **Publish the approved resource.** Copy the approved Markdown into
   `content/resources/`, using the template in `editorial/templates/web-resource.md`.
   Give it a stable ID and permalink, suitable metadata, and related resource
   IDs. Files in `content/` are public build inputs; do not put confidential or
   unfinished material there. `status: Planned` is a *public placeholder*, not a
   private draft flag.
6. **Build and check.** Run `npm test`, `npm run test:browser`, then review
   `npm run preview`. Commit and push when ready for publication. Once hosting
   is connected, Cloudflare will build the approved content from GitHub.

There is no contributor portal, CMS, automated approval engine, or new learning
system. These are editorial working folders and the existing static build.

## Resource metadata

Keep `id`, `title`, `description`, `topic`, `kind`, `status`, and `permalink`.
Use `delivery: web`, `download`, `video`, or `external`. Existing records are
compatible with the same template. Supporting `assetIds`, `downloadUrl`,
`externalUrl`, `youtubeId`, `related`, images, author, license, and version remain.

Optional fields:

| Field | Shape and purpose |
| --- | --- |
| `subjects` | List of subject labels from `resourceTaxonomy.json` |
| `platforms` | List of relevant platforms; omit when not platform-specific |
| `activities` | List of relevant activities |
| `origin` | `original`, `contributed`, `adapted`, or `external` |
| `contributors` | List of `{name, institution}`; institution is optional |
| `institution` | Institution responsible for the resource, if applicable |
| `originalSource` | List of `{title, url}`; URL optional |
| `adaptedFrom` | List of public source credits `{title, url}`; URL optional |
| `externalSource` | List of externally maintained sources `{title, url}` |
| `reviewer` | Name of an actual reviewer; no invented or automatic attribution |
| `lastReviewed` | Quoted date, for example `'2026-09-24'`, only after review |
| `copyright` | Verified copyright statement, if supplied |
| `license` | Confirmed reuse terms; no assumed default |
| `version` | Resource version, when known |
| `updated` | Page-update date; distinct from scientific review |

All of these optional fields may be omitted. Public source credits must not
contain private filenames, internal notes, unpublished documents, or restricted
links. Keep that detailed provenance in the curator's private working records.
Contributed materials are not automatically labeled original ASCEND content;
adaptation does not erase the contributor's authorship or copyright.

Subject/platform/activity/type options are centralized in
`content/_data/resourceTaxonomy.json`. Add new labels there, then apply them in
resource frontmatter. Main navigation still comes from `topics.json`.

## The first science introduction

`editorial/drafts/science-introduction-outline.md` reserves the planned topics
without generating their scientific content. Reuse `/about/`, `/science/`, and
`/project/` for the purpose, questions, and organization already described.
As reviewed science content arrives, create independent primers or references
with the resource template. Do not require readers to follow a sequence.

## Optional self-checks

An occasional question can use ordinary HTML inside Markdown:

```html
<details>
  <summary>Check your understanding: [question]</summary>
  <p>[Reviewed explanation]</p>
</details>
```

This is optional explanatory content, not a quiz engine. It needs no JavaScript,
login, score, storage, grading, analytics event, or completion tracking. Do not
add a self-check until its question and explanation have been reviewed.

## Downloads and external services

Continue using the shared asset manifest and stable landing pages. Supporting
PDFs, datasets, worksheets, CAD, and ZIP files can be local or hosted in R2.
Software/firmware may link to GitHub repositories or releases; videos can use
the existing YouTube support. Externally maintained content should identify its
source and link out rather than imply ASCEND maintains it. See
[the import guide](IMPORTED-MATERIALS.md) for the existing file workflow.
