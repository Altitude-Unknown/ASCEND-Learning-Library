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

Weather currently links the existing short weather-report and METAR
demonstrations. Do not claim a full Weather overview video exists until one
has been supplied and added to the catalog.

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
