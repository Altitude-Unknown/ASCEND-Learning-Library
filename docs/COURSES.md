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
