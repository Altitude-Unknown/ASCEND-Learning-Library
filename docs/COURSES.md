# Building a course

Every ASCEND course follows the FAA Part 107 format: numbered units in order,
and each unit page runs Watch → Read → Apply → Check. The pages are built from
shared templates, so a new course needs data and content, not new layouts.

## Shared pieces

| File | Purpose |
| --- | --- |
| `content/_data/courses.js` | One entry per course: title, URL, labels, sidebar collection, check style, and its units |
| `content/_includes/layouts/module.njk` | Unit page: header, outcomes, study steps, check step, previous/next |
| `content/_includes/components/unit-materials.njk` | Steps 1–3: lesson video (with a “Coming soon” card until it exists) and optional slides, reading, activities |
| `content/_includes/components/unit-check.njk` | Step 4 for courses without a quiz: review questions with hidden answers, or a skills checksheet |
| `content/_includes/components/course-overview.njk` | Course overview: intro, study method, and unit sequence |
| `content/_includes/layouts/textbook-chapter.njk` | Web chapter. Part 107 uses one chapter per unit; a single-chapter course links units to sections |

Part 107 keeps its own overview (`part107-course.njk`) for its exam-readiness content and its practice-test quiz (`check: 'quiz'`).

## Adding a course

1. Add `content/_data/<course>Course.json` with its units. Each unit needs
   `number`, `title`, `slug`, `url`, `summary`, `outcomes`, `activities`, and
   `lessonVideo` (`null` until the video is published). For a single web chapter,
   give each unit `readings` (section titles and heading ids); add
   `reviewQuestions` (numbers into the course’s `reviewQuestions` map) or `skills`.
2. Register the course in `content/_data/courses.js`, and add its module
   collection in `.eleventy.js`.
3. Create `content/<course>/` with a directory data file (layout `module.njk`,
   the course’s tag and `courseId`), one Markdown page per unit, and an
   `index.njk` that includes `components/course-overview.njk`.
4. Publish activities as web resources (`delivery: web`) with described images,
   and keep the original files for download where they exist.
5. Add the course to its topic’s `courses` list in `content/_data/topics.json`.
6. Add a Playwright spec like `tests/learn-to-fly.spec.js`: unit order, links,
   phone width, and an axe scan of every page.

When a lesson video is published, add it as a video resource and set the unit’s
`lessonVideo` to its id; the “Coming soon” card is replaced automatically.

## Learning to Fly a UAS

Built from Chapter 3, Piloting Remote Aircraft, of the Remote and Autonomous
Aircraft Systems lab manual. The web chapter
(`content/learn-to-fly/textbook/piloting-remote-aircraft.njk`), the activities,
and the checkride rubrics were generated from the manual’s Word file and then
reviewed. Changes from the printed chapter:

- Small typing corrections, and simulator links point to the Software page.
- Image descriptions replace file-path alt text.
- Weight & Balance answer key, problem 1: baggage moment 3.04 (not 30.4), CG
  43.04 in (not 54.8 in). Answers also say whether each loading is within limits.
- The airplane simulator lab’s question 6 asks students to draw their transmitter,
  because the manual’s radio picture is missing.
- The Weight & Balance lab’s “follow the links below” sentence is omitted; the
  manual has no links there.
- Units 4 and 5 use practice plans built from the Maneuver Description Guide.

## Building a Fixed-Wing UAS

Built from Chapter 4, Building a Fixed Wing Aircraft, of the lab manual: the
ASCEND Trainer Airplane build guide. The chapter is newer than the standalone
*Trainer Build Instructions* resource; it adds the control-direction chart,
transmitter rates and expo, mixing, and propeller installation.

Units without a lab use a `build` step (a card linking to the instruction
sections) and `signoff` skills from the chapter’s skills checksheet, shown in
Step 3. Unit 6 also shows the full checksheet in Step 4.

The web chapter (`content/build-fixed-wing/textbook/building-a-fixed-wing-aircraft.njk`),
its 152 images (`public/assets/build-fixed-wing/`), and the control surface lab
were generated from the manual’s Word file. Every image has a written
description. Changes from the printed chapter:

- STL and tail DXF links point to the site’s trainer files, not Google Drive.
  The V-tail DXF has no site copy and still links to Google Drive.
- Terminology: RC transmitters and receivers operate at 2.4 GHz (the manual says 2.8 GHz).
- Spelling made consistent (empennage, ruddervator, propeller, axle, scrape),
  and “M3.5 drill bit” reads “3.5 mm drill bit”, matching the photo callout.
- Headings added for navigation: Leading edge and gluing the wing, Ailerons and
  hinges, Testing the controls, Transmitter settings, Installing the propeller.
- The chapter says the rear wing support stays temporary until the center of
  gravity is found, but it has no CG procedure, although the skills checksheet
  lists that skill. No procedure was added.

## Lab manual courses

Every chapter of the Remote and Autonomous Aircraft Systems lab manual becomes
its own course. Chapters 3 and 4 were converted by hand; later chapters are
imported with `scripts/import-lab-manual.py`, which reads the curator-only Word
file in `editorial/intake/books/` and the settings in `editorial/lab-manual.json`:

- **chapters:** where each chapter goes, sections left out of the reading (labs,
  review questions, and checksheets live on course pages), heading and table
  label overrides, and text corrections (`replace` for the chapter,
  `dataReplace` for review questions and skills).
- **figures:** one entry per source image: a described figure
  (`file`, `alt`, `caption`), an equation shown on its own line (`equation`,
  MathML or text), or a symbol inside a sentence (`inline`).

Run `python3 scripts/import-lab-manual.py 1 2 5 6 9` after the Word file changes. It
rewrites the web chapter, its images, and the course data file's
`reviewQuestions` and last-unit `skills`, keeps the hand-written units, and
fails if any source paragraph is missing or an image has no entry. Most answer
keys mark answers with “Answer:”; Chapter 6's key starts each answer with its
numbered question instead (`"answerStyle": "numbered"`).
`editorial/lab-manual-import.json` records what was imported. Units without a
lab use a `practice` card in Step 3. Add each new course to
`tests/lab-manual-courses.spec.js`.

### Electrical Basics (Chapter 1)

Corrections: the introduction's unfinished sentence “We call this push,” ends
“voltage.”; “If an electron has 4 electrons” reads “If an atom”; “Can but caused”
reads “Can be caused”; “valance” reads “valence”; the checksheet's “measure
check continuity” reads “check continuity”. The waveform diagrams' transparent
backgrounds are flattened to white so they show in dark mode.

### PID Controllers (Chapter 9)

All 13 images in the chapter are equations; they are written as MathML. Heading
levels are evened out (the Ki and Kd sections sit under “How PID Gain Values
affect the Plant”), the two “Summary Table” headings are replaced by table
captions, and the Kp tuning list's run-together “Back off slightly” step is its
own item. The manual's lab gives only a goal and materials; the web lab's
procedure follows the chapter's tuning steps.

### UAS Hardware and Electronics (Chapter 2)

Five units. Word rotates many transmitter photos on the page; the importer
applies that rotation. The three animated GIFs (PWM, brushless and brushed
motors) show a still frame with an “Open the animation” link, so nothing
plays by itself (WCAG 2.2.2). Picture-only layout tables become photo grids.
The Motor Thrust Lab Guide is imported to
`content/_includes/lab-manual/motor-thrust-guide.html` and included by the
motor thrust lab page with its question sheet. Review questions use the
answer key's wording, which corrects the chapter list (“max change voltage”,
“ROHS”).

Corrections: discharge example “1.5 x 100 = 100amps” reads 150 amps; the
servo section's “Juggy the RC airplane project at the end of this book” reads
“the ASCEND Trainer Airplane in Chapter 4”; “bottom right image” reads “second
photo”; the motor mount's “google share drive” reads “ask your instructor”;
the Spektrum photo credit's broken hobbies.com link is removed; and typing
fixes (like, progress, bottom, form, than, divide, lead, controls, charger,
correct, specks, needle nose, and others listed in `editorial/lab-manual.json`).

### Building a Multirotor UAS (Chapter 5)

Three units: How Multirotors Fly (practice), The Flight Controller Stack
(quadcopter assembly lab), and Setting Up Betaflight (Betaflight lab and the
full skills checksheet). The web chapter has 71 described images (68 distinct;
the motor-direction diagram repeats for each motor) and two lab pages.

- **Motor direction.** The chapter's procedure, and its answer key, use
  Betaflight's default directions (motors 1 and 4 clockwise, 2 and 3
  counterclockwise). The airframe diagram (labeled “reversed”) and the
  propeller photo both show the reversed, “props out” directions. Both images
  are kept and their captions say so. The propeller paragraph described “two
  different propeller blades, clockwise on the left”, which does not match the
  photo; it now says the propellers marked 5042R are the clockwise ones.
- **Cross-references.** Word's internal links become links to Chapter 2
  (setting up a new aircraft; reversing a servo) and to the ARM switch section.
- The two “!!!Safety Check!!!” paragraphs are notice boxes. The materials
  list's first item (“A computer with Betaflight Configurator installed”) is
  a list item; Word had it outside the list. “Setting up Modes” is a heading.
- Corrections: “BetaFlight” and “betaflight” read “Betaflight”; “toque” reads
  torque; “gimbles, not pitch changes” reads “gimbals, no pitch changes”;
  “flightcontroller”, “Chanel Map”, “SPektrum”, “is call”, “is is”, “Do
  calibrate”, “accelerometer help”, “want and easy”, “spot for”, “numbers
  starting”, and other typing fixes listed in `editorial/lab-manual.json`. The
  checksheet's “assure” reads “ensure”.
- The checksheet lists “assure that center of gravity is within limits”, but
  the chapter has no CG procedure (the same gap as Chapter 4). None was added.
- The download steps show Betaflight Configurator 10.10.0; the chapter already
  says version numbers will differ.

### Flight Controllers (Chapter 6)

Three units: What Flight Controllers Do (practice), Automation, Safety, and
Failsafes (practice), and Flight Modes and Mission Planning (mission planning
lab and the full skills checksheet). The web chapter has 6 described images;
the SpeedyBee F405 V4 photo is shared with Chapter 5 and keeps its entry there.
The final link goes to PID Controllers.

- The propeller-removal paragraph is a notice box. “The following activity”
  in the Mission Planner section links to the lab page.
- Headings are in sentence case; “FBWA — Fly By Wire A” reads “FBWA (Fly By
  Wire A)”. The checksheet's “way points” reads “waypoints”, and “auto take off
  and auto landings” reads “automatic takeoff and automatic landing”.
- The checksheet lists a mission that takes pictures at predefined waypoints,
  but the lab says no photographs are needed. That skill is on the checksheet
  only, not in the unit's sign-off.
- The Mission Planner screenshot is an old 1.3 build (2017); the chapter says
  the software changes often.

