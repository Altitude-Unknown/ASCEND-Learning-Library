# GitHub and Cloudflare Pages deployment

No remote repository, account, custom domain, or live site has been created.
The project is prepared for a dedicated repository with this folder at its root.

## Create and connect the repository

1. Create a GitHub repository for ASCEND Learning Library in the appropriate
   project/organization account. Use the visibility required by the project.
2. Add that repository as this project's Git remote and push `main`. Commit
   source, documentation, `.node-version`, and `package-lock.json`; do not commit
   `node_modules/`, `_site/`, test artifacts, secrets, or large binary collections.
3. In Cloudflare **Workers & Pages**, create a **Pages** application using Git
   integration and select the repository. Do not create a Workers application
   or choose Direct Upload for this Git-driven workflow.
4. Set production branch `main`, framework Eleventy, build command
   **`npm run build`**, output **`_site`**, and root directory empty/repository
   root. The custom build command is important: it also runs Pagefind.
5. Use the current Pages build image with **Node 22**. `.node-version` selects
   it; `NODE_VERSION=22` can also be set in the project settings.
6. Deploy and verify the assigned Pages URL. Add a custom domain later through
   Pages' domain settings; no domain is assumed by the code.

Pushes trigger Cloudflare builds and atomic deployments. Branches/pull requests
can have separate preview URLs. Build errors leave the previous successful
production deployment in place. Configure branch protection in GitHub so the
included build/test workflow passes before a merge. Cloudflare does not
necessarily wait for an independent GitHub Actions check when a commit is
pushed directly to the production branch.

## What the build does

`npm ci`/the Pages dependency install restores the committed lockfile.
`npm run build` generates HTML and copies `public/`, then Pagefind produces its
index under `_site/pagefind/`. Cloudflare serves that directory as static files.
No runtime API key, database, functions, Node server, or deployment token is
needed in the repository. The Git integration authenticates through the user's
Cloudflare/GitHub accounts.

Use `npm run build`, not Eleventy's default preset command alone; otherwise
site-wide search will not be generated. The local fast dev command does not
continuously rebuild the search index.

## Assets, limits, and privacy

Use `public/downloads/` for small files. The documented Pages per-file limit is
25 MiB as checked for this milestone. Large CAD bundles, videos, firmware, and
frequently replaced datasets should use object storage such as R2. Add their
public URLs to resource metadata; no storage credentials belong in the browser.
Check current platform limits when the collection grows.

`public/_headers` adds basic response protections on Cloudflare.
`404.html` is generated from the 404 template (output `_site/404.html`).
The prototype's `robots.txt` disallows crawler indexing. This does not hide or
secure a public preview; use hosting access controls if the preview is private.
Remove the indexing restriction after content and public acknowledgment review.

## Move to another host

Build locally or in CI, then upload `_site/` to any host supporting static files
and directory index pages. Use the host's native settings to reproduce optional
headers and redirects. Search, CSS, and scripts are relative to the domain root;
this milestone assumes a root deployment, not a subdirectory. To deploy below a
path prefix, update URL generation and Pagefind paths and rerun browser checks.

## References

- [Deploy Eleventy on Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-eleventy-site/)
- [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Build image and Node selection](https://developers.cloudflare.com/pages/configuration/build-image/)
- [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Serving pages and custom 404](https://developers.cloudflare.com/pages/configuration/serving-pages/)
