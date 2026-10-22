import {readFileSync} from 'node:fs';

export default function () {
  const teams = JSON.parse(readFileSync(new URL('../../data/teams.json', import.meta.url), 'utf8'));
  if (!Array.isArray(teams)) throw new Error('data/teams.json must contain an array of institutions.');
  const ids = new Set();
  for (const team of teams) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(team.id || '') || ids.has(team.id)) {
      throw new Error('Each team needs a unique, lowercase, hyphen-separated id.');
    }
    ids.add(team.id);
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
