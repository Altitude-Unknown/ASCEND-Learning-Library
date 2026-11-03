import {readFileSync} from 'node:fs';

// Every course uses the same unit page and web-chapter layouts. Each entry
// describes one course; its units come from the course's own data file.
const read = file => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));
const part107 = read('./part107Course.json');
const learnToFly = read('./learnToFlyCourse.json');
const buildFixedWing = read('./buildFixedWingCourse.json');

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
    },
  buildFixedWing: {
    id: 'buildFixedWing',
    title: 'Building a Fixed-Wing UAS',
    shortTitle: 'Building a Fixed-Wing UAS',
    url: '/build-fixed-wing/',
    label: 'BUILDING A FIXED-WING UAS',
    sidebarLabel: 'BROWSE THE COURSE',
    sidebarCollection: 'buildFixedWingModules',
    overviewLabel: 'Course overview',
    check: 'review',
    final: {url: '/learn-to-fly/', title: 'Learning to Fly a UAS'},
    intro: [
      'This course takes you through building the ASCEND Trainer Airplane, a crash-tolerant foamboard, plywood, carbon-fiber, and 3D-printed trainer, from printing the parts to the preflight control check. It follows Chapter 4, Building a Fixed Wing Aircraft, of the Remote and Autonomous Aircraft Systems lab manual.',
      'Each unit builds one part of the airplane. Read the instructions, build that part, and have your instructor sign off the skills before you move on. When you finish, continue with Learning to Fly a UAS.'
    ],
    notice: {title: 'Work safely', text: 'Cut away from yourself with sharp knives, use breathing protection when drilling carbon fiber, and never install the propeller until you are outside and ready to fly.'},
    method: [
      {title: 'Watch & review', text: 'Begin with the unit’s video lesson. Videos are being recorded; until they are ready, start with the reading.'},
      {title: 'Read & clarify', text: 'Read the sections of Chapter 4 listed for the unit. Each unit links straight to its sections, with a description of every photo.'},
      {title: 'Build & sign off', text: 'Build that part of the airplane, or complete the lab, then demonstrate the unit’s skills to your instructor.'},
      {title: 'Check & revisit', text: 'Answer the review questions in your own words, then open each answer to compare. The last unit includes the full skills checksheet.'}
    ],
    chapterUrl: buildFixedWing.chapterUrl,
    chapterTitle: buildFixedWing.chapterTitle,
    reviewQuestions: buildFixedWing.reviewQuestions,
    units: buildFixedWing.units
  }
};
