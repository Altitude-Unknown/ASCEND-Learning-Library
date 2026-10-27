# Part 107 learning path

`/part107/` is the course landing page for individual learners, clubs/teams,
and instructor-led courses. It uses the supplied course introduction and
connects five units in this order:

1. Regulations — textbook Chapter 1
2. Airspace — Chapter 2
3. Weather — Chapter 3
4. Loading & Performance — Chapter 5
5. Operations — Chapter 4

The textbook retains its original chapter numbering. The course order follows
the owner's requested sequence. Each unit uses Watch/Review → Read/Clarify →
Apply/Explain → Check/Revisit and provides previous/next navigation.

Edit scope, outcomes and linked resource IDs in
`content/_data/part107Course.json`. Landing-page introduction, study guidance,
and readiness guidance live in `content/_includes/components/part107-course.njk`.
Unit `courseOrder` front matter must match the JSON unit number; `order`
controls sidebar sorting. Existing resource and lesson URLs remain stable.

The five unit pages present materials as numbered study steps: a lesson video
on the left and its presentation on the right, followed by the textbook, then
activities, then the existing quiz. On small screens, the lesson video stacks
above the slides. Supplemental videos remain fully visible within
the video step; additional activities and references remain in the activity
step. Resource cards are not removed.

`lessonVideo` identifies the primary instructional video independently of
supplemental videos in `watch` and each page’s `resourceIds`. Weather has
`lessonVideo: null`: show a coming-soon placeholder next to its slides.
Its short weather-report and METAR demonstrations remain supplemental. Set
`lessonVideo` to the new resource ID when the overview lesson is supplied.

Practice deep links accept a bank name (`?bank=Regulations`) and optionally
`&count=all`. Only known bank names and the supported count are used; visiting
a link selects the quiz setup without starting it. `?bank=mixed` selects the
existing 50-question mixed exam (10 questions per bank).

The owner's 90% recommendation is a preparation target, not an FAA passing
requirement or guarantee. The page distinguishes ASCEND's 50-question practice
format from the FAA's 60-question UAG format and links the FAA testing matrix
and certification steps. No login, enrollment, grading records, progress
storage, or certificate issuance is introduced.

Validation: `npm test`; `npx playwright test tests/part107-course.spec.js`.
The browser checks exercise the full unit sequence, matching full-bank and
mixed-exam selection, accessibility and overflow at 1440/768/390/320 pixels,
and navigation without JavaScript.


The five complete web chapters live at `/part107/textbook/<unit-slug>/`. Run `python3 scripts/import-part107-textbook.py` to regenerate them from the supplied Word book. The importer verifies source text coverage, all 16 tables, and all 18 chapter figures; curated descriptions and weather-report transcripts are in `editorial/part107-figures.json`. Original PDF and Word downloads remain available. The source wording is retained, rather than updated or independently reviewed for regulatory accuracy.
