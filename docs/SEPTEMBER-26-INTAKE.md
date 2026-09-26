# September 26 resource intake

Imported 14 supplied originals: eight Part 107 Word documents and six YELLOWSTONE files. Original intake folders remain unchanged and ignored by Git; byte-identical copies also live in ASCEND-Materials for repeatable imports.

The existing Airspace Student Worksheet placeholder now contains the supplied Regulations and Airspace activity. Eleven additional resource pages bring the library to 40 resources. Part 107 modules link the relevant activities; ballooning and UAS payload sections link YELLOWSTONE. Downloads and search discover these resources automatically.

All originals fit the Pages asset limit, including the 16.3 MiB Fusion archive. No new R2 upload is required. PDF reading copies supplement nine DOCX files and one PPTX; the XLSX, F3Z, SCH, and BRD remain native downloads.

## Review scope and findings

- Office ZIP archives and embedded relationships were checked. No missing internal image or relationship targets were found.
- Visual review of Regulations and Airspace found only tower markers 1–3, although the prompt asks for four towers. This mismatch is noted on its resource page.
- The DFW document contains a single chart image and no extractable body text. Its reading copy is not a complete nonvisual alternative.
- Loading and Performance switches between 1 lb and 1.5 lb in its first prompt and gives battery mass rather than total aircraft weight. The resource page asks the mentor to clarify assumptions.
- Weather uses historical METAR examples and misspells Los Angeles. The resource page distinguishes supplied examples from live weather.
- Operations uses the supplied fictional N19GWJ identifier and an underspecified runway-direction question.
- The injury scenario does not fully characterize injury severity; no answer key was supplied.
- Field Applications uses “today at noon”; mentors should set an exercise date.
- DroneZone account steps, fees, and eligibility require current FAA verification. No legal answer key or current regulatory accuracy claim was added.
- YELLOWSTONE guide, spreadsheet, code examples, and design sources were imported as supplied. This is not a circuit validation, firmware review, or manufacturing-readiness assessment.
- External links within originals were preserved, not exhaustively validated. The guide's parts and design documents are now available together as related resources.

## Reproduction

New reading-copy mappings are in scripts/additional-reading-copies.json. The existing Office export script includes them. prepare-reading-copies.py accepts optional PDF stems to regenerate only selected reading copies while retaining the earlier verification records. register-reading-copies.py recognizes all mapped resources.

The source documents were not silently edited. Learner-facing notes capture the limitations discovered during this intake.

PDF verification preserved page count, per-page extracted text, and link count for all ten additions. Representative DFW chart, tower worksheet, PCB guide, and I/O-map pages were rendered and visually inspected. The PCB guide has 41 pages.
