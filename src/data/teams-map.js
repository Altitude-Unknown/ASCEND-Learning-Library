import * as maplibregl from 'maplibre-gl';

maplibregl.setWorkerUrl('/assets/data/dist/maplibre-gl-worker.mjs');
const container = document.querySelector('#teams-map');
const status = document.querySelector('#teams-map-status');
const reset = document.querySelector('#teams-map-reset');
const roles = {team: 'Student team', pod: 'Pod lead', sme: 'Subject matter expert', leadership: 'Project leadership'};
const symbols = {team: '●', pod: '★', sme: '◆', leadership: '■'};
const teams = [...document.querySelectorAll('#teams-directory [data-team-id]')].map(item => ({
  item,
  name: item.querySelector('.team-institution').textContent,
  location: item.querySelector('.team-location').textContent,
  kind: item.dataset.kind || 'team',
  role: item.querySelector('.team-role')?.textContent.replace(/[★◆●■]/g, '').trim() || roles[item.dataset.kind || 'team'],
  person: item.querySelector('.team-person')?.textContent,
  profile: item.querySelector('.team-profile-link'),
  coordinates: [Number(item.dataset.longitude), Number(item.dataset.latitude)],
  button: item.querySelector('.team-map-link'),
}));
let map;
let activePopup;
const clusterMarkers = new Map();

function unavailable() {
  container.hidden = true;
  reset.hidden = true;
  teams.forEach(team => { team.button.hidden = true; });
  status.textContent = 'The interactive map is unavailable. You can still browse all network institutions in the list below.';
  container.dataset.mapReady = 'false';
}

function showAll() {
  activePopup?.remove();
  const bounds = new maplibregl.LngLatBounds();
  if (teams.length) teams.forEach(team => bounds.extend(team.coordinates));
  else bounds.extend([-125, 24]).extend([-66, 50]);
  map.fitBounds(bounds, {padding: 55, maxZoom: teams.length === 1 ? 6 : 5, duration: 0});
}

function institutionContent(team) {
  const content = document.createElement('div');
  content.className = 'team-cluster-entry';
  const heading = document.createElement('h3');
  heading.textContent = team.name;
  const role = document.createElement('p');
  role.className = 'team-popup-role';
  role.textContent = team.role;
  const location = document.createElement('p');
  location.textContent = team.location;
  content.append(heading, role, location);
  if (team.person) {
    const person = document.createElement('p');
    person.textContent = team.person;
    content.append(person);
  }
  if (team.profile) content.append(team.profile.cloneNode(true));
  return content;
}

function openPopup(records, coordinates, origin) {
  activePopup?.remove();
  const content = document.createElement('div');
  records.forEach(team => content.append(institutionContent(team)));
  const popup = new maplibregl.Popup({offset: 22, maxWidth: '280px', focusAfterOpen: true})
    .setLngLat(coordinates).setDOMContent(content);
  popup.on('close', () => origin.setAttribute('aria-expanded', 'false'));
  popup.addTo(map);
  const element = popup.getElement();
  element.id = `team-popup-${records.map(team => team.item.dataset.teamId).join('-')}`;
  origin.setAttribute('aria-controls', element.id);
  origin.setAttribute('aria-expanded', 'true');
  element.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      popup.remove();
      origin.focus();
      event.stopPropagation();
    }
  });
  element.querySelector('.maplibregl-popup-close-button').addEventListener('click', () => origin.focus());
  activePopup = popup;
}

// Group markers whose touch targets would overlap at the current zoom. The
// grouped popup still shows each institution, including coincident locations.
function groupNearbyLocations() {
  const groups = teams.map(team => [team]);
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      if (groups[i].some(a => groups[j].some(b => map.project(a.coordinates).dist(map.project(b.coordinates)) < 52))) {
        groups[i].push(...groups[j]);
        groups.splice(j, 1);
        // Recheck all groups after a merge to include transitive neighbors.
        j = i;
      }
    }
  }
  const retained = new Set();
  teams.forEach(team => { team.dot.hidden = false; });
  for (const group of groups) {
    if (group.length < 2) continue;
    group.forEach(team => { team.dot.hidden = true; });
    const key = group.map(team => team.item.dataset.teamId).sort().join('--');
    retained.add(key);
    if (clusterMarkers.has(key)) continue;
    const coordinates = [0, 1].map(axis => group.reduce((sum, team) => sum + team.coordinates[axis], 0) / group.length);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'team-map-dot team-map-cluster';
    button.textContent = String(group.length);
    button.setAttribute('aria-label', `Show ${group.length} nearby network locations: ${group.map(team => team.name).join(', ')}`);
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', event => {
      event.stopPropagation();
      openPopup(group, coordinates, button);
    });
    const marker = new maplibregl.Marker({element: button}).setLngLat(coordinates).addTo(map);
    clusterMarkers.set(key, marker);
  }
  for (const [key, marker] of clusterMarkers) {
    if (!retained.has(key)) {
      marker.remove();
      clusterMarkers.delete(key);
    }
  }
}

try {
  container.hidden = false;
  map = new maplibregl.Map({
    container,
    center: [-98, 39], zoom: 2, minZoom: 1, maxZoom: 12,
    renderWorldCopies: false, scrollZoom: false, dragRotate: false,
    pitchWithRotate: false, touchPitch: false,
    style: {
      version: 8,
      sources: {
        land: {type: 'geojson', data: '/assets/data/dist/land.geojson', attribution: 'Natural Earth'},
        states: {type: 'geojson', data: '/assets/teams/us-states.geojson', attribution: 'U.S. Census Bureau · us-atlas'},
      },
      layers: [
        {id: 'water', type: 'background', paint: {'background-color': '#e3eef1'}},
        {id: 'land', type: 'fill', source: 'land', paint: {'fill-color': '#f5f4eb', 'fill-outline-color': '#b0c3bd'}},
        {id: 'states', type: 'fill', source: 'states', paint: {'fill-color': '#e7efe9'}},
        {id: 'state-borders', type: 'line', source: 'states', paint: {'line-color': '#8ba79b', 'line-width': 1}},
      ],
    },
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({showCompass: false}));
  map.getCanvas().setAttribute('aria-label', 'ASCEND network locations. Use arrow keys to pan and plus or minus to zoom. The institution list provides the same information.');
  map.on('error', unavailable);
  map.on('load', () => {
    if (container.hidden) return;
    teams.forEach(team => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `team-map-dot team-map-${team.kind}`;
      const symbol = document.createElement('span');
      symbol.className = `team-symbol team-symbol-${team.kind}`;
      symbol.textContent = symbols[team.kind];
      symbol.setAttribute('aria-hidden', 'true');
      dot.append(symbol);
      dot.setAttribute('aria-label', `Show ${team.role.toLowerCase()}: ${team.name}`);
      dot.setAttribute('aria-expanded', 'false');
      dot.title = team.name;
      team.dot = dot;
      new maplibregl.Marker({element: dot}).setLngLat(team.coordinates).addTo(map);
      dot.addEventListener('click', event => {
        event.stopPropagation();
        openPopup([team], team.coordinates, dot);
      });
      team.button.hidden = false;
      team.button.addEventListener('click', () => {
        container.scrollIntoView({block: 'center'});
        map.jumpTo({center: team.coordinates, zoom: Math.max(map.getZoom(), 7)});
        openPopup([team], team.coordinates, team.button);
      });
    });
    reset.hidden = false;
    reset.addEventListener('click', showAll);
    map.on('zoomend', groupNearbyLocations);
    map.on('resize', groupNearbyLocations);
    showAll();
    groupNearbyLocations();
    status.textContent = teams.length
      ? `${teams.length} ASCEND network location${teams.length === 1 ? '' : 's'} on the map.`
      : 'The map is ready. Team locations will appear as institutions join ASCEND.';
    container.dataset.mapReady = 'true';
  });
} catch {
  unavailable();
}
