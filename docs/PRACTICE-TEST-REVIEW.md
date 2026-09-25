# Part 107 practice-test review and integration

Reviewed September 24, 2026. The project owner supplied the Whisky Alpha static
site, five CSV question banks, a figure map, and 18 JPG testing-supplement figures.
All 296 question records and their choices were read for editorial issues;
CSV answer weights were compared with JavaScript keys. This is a structural
and editorial review with targeted reference checks, not an FAA-approved
question bank or a comprehensive independent validation of every answer.

## Published set

266 questions are included: Airspace 46, Loading and Performance 44, Weather 63,
Regulations 63, Operations 50. Eight duplicate records and 22 unresolved items
are excluded from quiz selection. Supplied source-code numbers are not unique
(e.g. 1274 is used for unrelated questions); stable bank IDs identify records.

## Findings and repairs

- Airspace 1068: a prompt fragment was a fourth CSV option; the converted bank
  had three options but still used answer index 3. Corrected to index 2.
- Operations 1257: CSV marks the third answer with weight 1, but the generated
  JavaScript keyed the first answer. Corrected, clarified duration, and removed
  the duplicate from Operations. The Loading bank retains the question.
- Airspace 1092: Figure 71 existed but was absent from the mapping. Linked it.
- Operations 1224: linked both Figure 22 and Figure 31 instead of only Figure 22.
- Every explicit figure reference now uses its own figure number, independent
  of the four-digit source code. All 18 supplied figure files are preserved
  byte-for-byte; every required figure appears in both quiz and answer review.
- Corrected the Class C shelf radius, Fentress surface airspace, Georgetown
  equivalent-answer ambiguity, registration key/conditions, and inspection
  authority. Clarified other questions whose scopes were missing important
  conditions. Exact before/after records and reference URLs are in the audit.
- Corrected spelling and transcription errors, including `feel` → `feet`,
  `principle` → `principal`, `Wind Sheer` → `Wind shear`, `Gola` → `Gila`,
  `Tominson` → `Tomlinson`, repeated `is`, and `ten back` → `then back`.
- Removed unsupported J/K and number-key hints. Native radios support keyboard
  navigation. Grading freezes the answers being reviewed, focuses the results
  heading, and resets cleanly. Text escaping handles each special character.
- Corrected source CSVs use one 100-weight answer, normalized MC records, and
  stable IDs. Source CSVs contain four MS declarations with only one positive
  answer, and one malformed prompt stored as an option.

## Implementation and maintenance

- Public page: `/part107/practice-tests/`; permanent resource record remains
  `/resources/part107-app/`. Existing homepage and Part 107 links lead here.
- Static browser module and JSON live in `public/assets/practice/`. No iframe,
  third-party service, Windows executable, backend, or account is needed.
- Ten-question topic mode, all-in-topic mode, and balanced 50-question mixed
  mode sample without replacement. Answers use stable original choice indexes
  even when choices are shuffled. Scores/answers stay in memory and are never
  stored in cookies, local storage, or submitted to a server.
- `editorial/practice/review.json` records original/corrected questions, held
  items, duplicate decisions, CSV mismatches, and source-file SHA-256 hashes.
- `editorial/practice/*.csv` contains corrected, included questions for future
  authoring. These editorial files are versioned but not website build inputs.
- Intake under `Hosted-Website-Files/` is untouched and ignored by Git. To
  regenerate after an editorial decision, update `scripts/import-practice.py`
  and run `python3 scripts/import-practice.py`. Do not edit generated JSON/CSVs
  independently. Cloudflare uses committed output and needs neither intake
  originals nor Python.
- `npm test` checks every question key, figure reference, figure hash, mixed
  sampling, grading, and exclusions. Browser tests exercise shuffled grading,
  incomplete answers, figures in both states, reset, mobile accessibility,
  load failure/retry, and the no-JavaScript fallback.

## Review limits and accessibility

The historical chart examples are not operational navigation data. Figure
numbers/file existence were checked throughout; selected chart and report
content was visually inspected to resolve identified issues, not independently
recomputed for every chart question. Full-sized originals open in another tab;
METAR/TAF text transcripts reproduce the supplied figures without decoding
answers. Sectional charts still require visual interpretation and are not fully
accessible nonvisually. No claim of complete WCAG conformance is made.
The supplied TAF figure has inconsistent date groups; the ambiguous interval
question is held, and the source image is preserved rather than silently edited.

Targeted primary references checked:

- [Current Part 107](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-107)
- [FAA registration guidance](https://www.faa.gov/uas/getting_started/register_drone)
- [FAA operations over people](https://www.faa.gov/uas/commercial_operators/operations_over_people)
- [FAA waiver guidance](https://www.faa.gov/uas/commercial_operators/part_107_waivers)
- [FAA AIM airspace](https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap3_section_2.html)
- [FAA Remote Pilot Study Guide](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/remote_pilot_study_guide.pdf)
- [FAA Flight Service](https://www.faa.gov/about/office_org/headquarters_offices/ato/service_units/systemops/fs)

## Questions held for author or subject-matter review

These originals remain in the audit; none appears in a scored quiz.

| Bank ID / reference | Reason |
|---|---|
| airspace_0018 / 1276 | TFR question lacks the actual restriction and effective times; generic ATC permission is not a sufficient answer. |
| airspace_0021 / 1340 | Holton Head is not the charted airport name; location and operating altitude are ambiguous. Requires author clarification. |
| airspace_0026 / 1084 | Near Anderson Airport does not specify a location or altitude sufficient to determine authorization. |
| loading_0030 / 1256 | Incomplete fatigue-recognition wording; the keyed phrase does not supply a clear answer. |
| loading_0035 / 1261 | Malformed medication question (will almost affect); several choices can impair performance. |
| loading_0036 / 1262 | Manned-flight altitude explanation does not establish the cause of dehydration for a ground-based remote pilot. |
| weather_0005 / 1139 | Thermal-current key selects the Lake Drummond area; the intended land-surface comparison needs clarification. |
| weather_0038 / 1162 | Question ranks thunderstorm hazards without a defined scenario; lightning key needs subject-matter review. |
| weather_0041 / 1287 | Squall altitude question is underspecified and its at-any-altitude key needs subject-matter review. |
| weather_0063 / 1183 | Supplied Figure 15 mixes date groups; forecast date and interval need clarification before grading this question. |
| regulations_0010 / 1280 | All civil operations is overbroad: Part 107 has exclusions. Needs a specific operation. |
| regulations_0012 / 1011 | Generic manned-aircraft ATC clearance wording needs a precise Part 107 authorization scenario. |
| regulations_0027 / 1026 | Maximum penalty claim omits other consequences and conflates administrative and criminal sanctions. |
| regulations_0040 / 1038 | Only primary-power lithium batteries is overly restrictive; equipment batteries and hazardous-material rules need a scoped question. |
| regulations_0042 / 1274 | Obsolete sunrise-only launch limit; current night operations are possible subject to requirements. |
| regulations_0051 / 1306 | Automatic immediate certificate revocation claim is not a reliably stated enforcement rule. |
| regulations_0058 / 1056 | Concert question omits aircraft category and the hazard posed by dropped objects; cannot grade a blanket prohibition. |
| regulations_0059 / 1058 | Delivery question conflates VLOS, moving vehicles, waivers, and air-carrier operations; requires a defined scenario. |
| regulations_0067 / 1352 | Night-lighting question has no clearly supported safe answer among the supplied options. |
| regulations_0074 / 1355 | Responsibility for markings/declaration wording conflates applicant and operating responsibilities. |
| operations_0009 / 1218 | Radio example suggests requesting Part 107 airspace authorization by tower radio; needs a clearly scoped communications exercise. |
| operations_0011 / 1233 | Best interference mitigation depends on equipment and site; spectral-analyzer answer needs an operational context. |
