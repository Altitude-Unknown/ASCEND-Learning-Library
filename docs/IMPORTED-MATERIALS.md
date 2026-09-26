# Imported ASCEND materials — September 2026

The intake folder is `ASCEND-Materials/` inside this repository. It is preserved
unchanged and ignored by Git. Back it up independently. The provided
`ASCEND_Logo_v2.jpg` is copied unchanged to `public/assets/ascend-logo.jpg`.

## What was incorporated

- 2 books: the FAA Remote Pilot Study Guide and Remote and Autonomous Aircraft Systems lab manual.
- 5 Part 107 PowerPoint decks, linked to their corresponding modules.
- 1 illustrated trainer build guide.
- 33 STL files, 6 DXF files, 2 F3Z assemblies, and 1 F3D design.
- 8 derived PDF reading copies, exported locally using Microsoft Word/PowerPoint.
- 2 aircraft project pages grouping the trainer and fixed-wing research UAS files.

All 50 originals have manifest records and resource-page links. There are
24 resource pages total, including the retained future-resource placeholders.
Existing Airspace resource URLs were preserved: the old example book page now
hosts the actual **complete** Part 107 study guide, clearly labeled as such.

The original `Servo_V-tail.stl` and `Servo-bracket-V-tail.stl` in the trainer's
64D TPU folder have the same SHA-256. Both names are preserved. The similarly
named DXF rudder files have different hashes and remain distinct.

## Reading PDFs

PDFs preserve page layout for browser reading. They do not turn the material
into responsive HTML chapters. Microsoft Word/PowerPoint export the originals
from temporary working copies; the originals are not saved or modified.
PyMuPDF 1.28.2 compresses raster illustrations above 220 DPI to 160 DPI with
JPEG quality 85, while retaining selectable text and vector elements. Some
image types may retain their source resolution.

The verification report is `PDF-VERIFICATION.json`. Every reading copy retained
the exported PDF's page count, extracted text on every page, and link count.
Representative diagram, chart, and photo pages were visually checked. This is
not a complete editorial, regulatory, print-fidelity, or PDF accessibility audit.
The source decks and guide explicitly represent different revision states; no
regulatory claims were silently rewritten during import.

## Local preview versus public deployment

`npm run preview` builds `_preview/`, enables local-only large-file links, and
serves http://localhost:8080. It works with the intake and reading-copy folders
on this machine. Local-only links are labeled on the resource pages.

`npm run build` produces `_site/`. That production output includes only the
small hosted files and configured public URLs. Large files without public URLs
show **Download being prepared**. The source/intake paths never become public
links in the production build. `_preview/` is ignored by Git and must not be
used as Cloudflare's deployment directory.

Cloudflare Pages permits assets up to 25 MiB; large files should use object
storage. The eight large files were uploaded to the `ascend-files` R2 bucket on
September 25, 2026, under `r2-upload/`. Their manifest URLs use the temporary
public development endpoint; a custom downloads domain remains to be configured.
[Cloudflare asset limits](https://developers.cloudflare.com/pages/platform/limits/)

### Large files hosted on R2

Set the actual HTTPS `publicUrl` on each matching record in
`content/_data/materials.json`. Both resource pages and local preview will use
that URL automatically. File IDs and resource-page permalinks stay unchanged.
Do not invent URLs or use expiring signed links for public educational files.

| File | Size | Asset ID |
| --- | ---: | --- |
| Remote Aircraft Textbook.docx | 255.9 MiB | `books-remote-aircraft-textbook` |
| National Airspace System-107.pptx | 56.7 MiB | `powerpoints-national-airspace-system-107` |
| Plane v3.f3z | 142.2 MiB | `rc-airplanes-fixed-wing-research-uas-plane-v3` |
| AU-Assembly.f3z | 64.2 MiB | `rc-airplanes-trainer-airplane-au-assembly` |
| AltitudeUnknown_Trainer_Build_Instructions.docx | 194.1 MiB | `rc-airplanes-trainer-airplane-altitudeunknown-trainer-build-instructions` |
| airspace.pdf | 29.6 MiB | `airspace-pdf` |
| regulations.pdf | 27.1 MiB | `regulations-pdf` |
| remote-aircraft-textbook.pdf | 36.9 MiB | `remote-aircraft-textbook-pdf` |

## Adding or replacing supplied files

1. Put originals in `ASCEND-Materials/` using the existing folders.
2. Run `python3 scripts/import-materials.py` from the repository root. It
   calculates sizes and SHA-256 values and makes byte-identical distribution
   copies of files small enough for Pages. It preserves configured public URLs.
3. Add the generated asset IDs to the appropriate resource's `assetIds` list.
   Create a new Markdown resource page if needed. The site does not guess how
   new source files belong in the curriculum.
4. To regenerate the existing eight PDF reading copies on macOS, use
   `python3 scripts/export-pdfs.py` with Word/PowerPoint installed. The script
   exports copies from temporary working files.
5. Run `scripts/prepare-reading-copies.py` in a Python environment containing
   `pymupdf==1.28.2`, then `python3 scripts/register-reading-copies.py`.
   Conversion tools are optional authoring dependencies; production builds and
   GitHub checks need only the checked-in static files and Node dependencies.
6. Run `npm test`, `npm run test:browser`, and review `npm run preview`.

The eight PDF source mappings are listed in `scripts/export-pdfs.py`. Extend
that list and the reading-copy registration map for additional documents.
Metadata defaults do not assert an author, version, or reuse license unless
supported by the supplied document. The manifest centralizes file delivery;
resource Markdown remains the place for learner-facing titles and descriptions.
