# Architecture decision — first milestone

## Recommendation

Use Eleventy for build-time generation, Markdown for educational content,
Nunjucks for reusable page design, and Pagefind for static full-text search.
Cloudflare Pages serves the generated files from a GitHub-connected build.

| Approach | Fit | Tradeoff |
| --- | --- | --- |
| Eleventy | Selected: content-first, Markdown, reusable templates, plain static output | Small amount of template/build configuration |
| Astro | Good alternative for more interactive components | Component syntax and integrations are unnecessary for this milestone |
| Handwritten static HTML | Very small initial toolchain | Repeated navigation/layout and manual indexing become hard to maintain |

The choice was explained before implementation. It does not introduce a
runtime platform dependency: the output is portable, and the source content
remains Markdown with YAML metadata.

## Content model

A resource is a Markdown record with a stable ID and permalink. Files, external
URLs, metadata, and relationships live on that record. A module references IDs;
its resources render automatically. Replacing a PPTX or moving it to object
storage does not change the module or resource landing URL.

Required resource fields: `id`, `title`, `description`, `topic`, `kind`.
Availability defaults to Planned. Other metadata is optional; see EDITING.md.

The secondary topic landings deliberately use clearly labeled planned
subsections. They are navigable outlines, not fabricated complete curricula.
The FAA section is the fully prototyped learning path in this milestone.

## Search and scaling

Pagefind indexes generated HTML after Eleventy builds. It emits a static search
bundle; queries happen in the visitor's browser, with no database or search
server. Navigation/footer are excluded from the index. Topic, Type, and Format
are indexed filters. PDFs and remote documents are not automatically indexed:
write a useful description/transcript on their landing pages.

The small resource browser has client-side filters across the initial records.
For a much larger collection, paginate topic listings and use Pagefind's index
for cross-library discovery instead of putting thousands of cards in one DOM.
CDN delivery separates visitor traffic from the build process; validate actual
hosting limits and load patterns when the collection expands. No claims of
load-test capacity have been made for the prototype.

## Browser and hosting dependencies

Core content and links are server-rendered static HTML. Small optional JavaScript
handles filters, menu convenience, search, and privacy-conscious video embeds.
No fonts, analytics, videos, or images are fetched from a third party on initial
load. YouTube is contacted only after the visitor chooses Load video.

Dependencies used by visitors are local CSS/JS plus Pagefind's generated bundle
on the search page. Playwright and axe are development checks, not site runtime.
There are no Pages Functions, Workers, service workers, or host-only routing
requirements. Cloudflare's `_headers` file is optional on other hosts.

## References checked during implementation

- [Eleventy documentation](https://www.11ty.dev/docs/)
- [Astro static routing](https://docs.astro.build/en/reference/routing-reference/)
- [Pagefind static search](https://pagefind.app/)
- [Cloudflare Eleventy deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-an-eleventy-site/)
