import {readFileSync} from 'node:fs';

export default function () {
  const teams = JSON.parse(readFileSync(new URL('../../data/teams.json', import.meta.url), 'utf8'));
  if (!Array.isArray(teams)) throw new Error('data/teams.json must contain an array of institutions.');
  const ids = new Set();
  const leadership = JSON.parse(readFileSync(new URL('./leadership.json', import.meta.url), 'utf8'));
  const roles = {team: 'Student team', pod: 'Pod lead', sme: 'Subject matter expert', leadership: 'Project leadership'};
  for (const team of teams) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(team.id || '') || ids.has(team.id)) {
      throw new Error('Each team needs a unique, lowercase, hyphen-separated id.');
    }
    ids.add(team.id);
    team.kind ??= 'team';
    if (!Object.hasOwn(roles, team.kind)) throw new Error(`Team ${team.id} has an unknown map role.`);
    if (team.role != null && (typeof team.role !== 'string' || !team.role.trim())) {
      throw new Error(`Team ${team.id} needs a nonempty role when supplied.`);
    }
    team.role = team.role || roles[team.kind];
    if (team.person != null && (typeof team.person !== 'string' || !team.person.trim())) {
      throw new Error(`Team ${team.id} needs a nonempty person name when supplied.`);
    }
    if (team.profileId && !leadership.some(person => person.id === team.profileId)) {
      throw new Error(`Team ${team.id} refers to a missing leadership profile.`);
    }
    for (const field of ['institution', 'city', 'state']) {
      if (typeof team[field] !== 'string' || !team[field].trim()) {
        throw new Error(`Team ${team.id} needs a ${field}.`);
      }
    }
    if (!Number.isFinite(team.latitude) || Math.abs(team.latitude) > 85 ||
        !Number.isFinite(team.longitude) || Math.abs(team.longitude) > 180) {
      throw new Error(`Team ${team.id} needs numeric campus coordinates (latitude −85 to 85; longitude −180 to 180).`);
    }
  }
  return teams.sort((a, b) => a.institution.localeCompare(b.institution));
}
