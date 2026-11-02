import {readFileSync} from 'node:fs';

// Every course uses the same unit page and web-chapter layouts. Each entry
// describes one course; its units come from the course's own data file.
const read = file => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));
const part107 = read('./part107Course.json');
const learnToFly = read('./learnToFlyCourse.json');

export default {
  part107: {
    id: 'part107',
    title: 'FAA Part 107',
    shortTitle: 'Part 107',
    url: '/part107/',
    label: 'FAA PART 107',
    sidebarLabel: 'BROWSE PART 107',
    sidebarCollection: 'modules',
    overviewLabel: 'Part 107 overview',
    check: 'quiz',
    final: {url: '/part107/practice-tests/?bank=mixed', title: 'Comprehensive practice exam'},
    units: part107.units
  },
  learnToFly: {
    id: 'learnToFly',
    title: 'Learning to Fly a UAS',
    shortTitle: 'Learning to Fly',
    url: '/learn-to-fly/',
    label: 'LEARNING TO FLY A UAS',
    sidebarLabel: 'BROWSE THE COURSE',
    sidebarCollection: 'learnToFlyModules',
    overviewLabel: 'Course overview',
    check: 'review',
    final: {url: '/learn-to-fly/', title: 'Course overview'},
    intro: [
      'This course teaches you to fly remote aircraft, airplanes and multirotors, from your first simulator flights to your first solo. It follows Chapter 3, Piloting Remote Aircraft, of the Remote and Autonomous Aircraft Systems lab manual.',
      'It is really hard to learn to fly from a book alone. Each unit gives you the background to read, then practice to do: in a simulator first, then outdoors with an instructor.'
    ],
    notice: {title: 'Fly with an instructor', text: 'Outdoor flights in this course are flown with an instructor, ideally on a buddy box. Follow the FAA rules that apply to your flights; the FAA Part 107 course explains them.'},
    method: [
      {title: 'Watch & review', text: 'Begin with the unit’s video lesson. Videos are being recorded; until they are ready, start with the reading.'},
      {title: 'Read & clarify', text: 'Read the sections of Chapter 3 listed for the unit. Each unit links straight to its sections.'},
      {title: 'Apply & practice', text: 'Complete the lab or practice plan: in a simulator first, then in the field with your instructor.'},
      {title: 'Check & revisit', text: 'Answer the review questions in your own words, then open each answer to compare. The last unit uses the checkride rubrics and skills checksheet.'}
    ],
    chapterUrl: learnToFly.chapterUrl,
    chapterTitle: learnToFly.chapterTitle,
    reviewQuestions: learnToFly.reviewQuestions,
    units: learnToFly.units
  }
};
