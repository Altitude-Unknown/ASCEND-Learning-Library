import * as maplibregl from 'maplibre-gl';

maplibregl.setWorkerUrl('/assets/data/dist/maplibre-gl-worker.mjs');
const container = document.querySelector('#teams-map');
const status = document.querySelector('#teams-map-status');
const reset = document.querySelector('#teams-map-reset');
const teams = [...document.querySelectorAll('#teams-directory [data-team-id]')].map(item => ({
  item,
  name: item.querySelector('.team-institution').textContent,
  location: item.querySelector('.team-location').textContent,
  coordinates: [Number(item.dataset.longitude), Number(item.dataset.latitude)],
  button: item.querySelector('.team-map-link'),
}));
let map;
let activePopup;

function unavailable() {
  container.hidden = true;
  reset.hidden = true;
  teams.forEach(team => { team.button.hidden = true; });
  status.textContent = 'The interactive map is unavailable. You can still browse all participating institutions in the list below.';
  container.dataset.mapReady = 'false';
}

function showAll() {
  activePopup?.remove();
  const bounds = new maplibregl.LngLatBounds();
  if (teams.length) {
    teams.forEach(team => bounds.extend(team.coordinates));
  } else {
    bounds.extend([-125, 24]).extend([-66, 50]);
  }
  map.fitBounds(bounds, {padding: 55, maxZoom: teams.length === 1 ? 6 : 5, duration: 0});
}

try {
  container.hidden = false;
  map = new maplibregl.Map({
    container,
    center: [-98, 39],
    zoom: 2,
    minZoom: 1,
    maxZoom: 12,
    renderWorldCopies: false,
    scrollZoom: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
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
  map.getCanvas().setAttribute('aria-label', 'Team locations. Use arrow keys to pan and plus or minus to zoom. The institution list provides the same information.');
  map.on('error', unavailable);
  map.on('load', () => {
    // Do not re-enable controls if a basemap resource failed during loading.
    if (container.hidden) return;
    teams.forEach(team => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'team-map-dot';
      dot.setAttribute('aria-label', `Show institution: ${team.name}`);
      dot.setAttribute('aria-expanded', 'false');
      dot.title = team.name;
      new maplibregl.Marker({element: dot}).setLngLat(team.coordinates).addTo(map);

      function open(origin) {
        activePopup?.remove();
        const content = document.createElement('div');
        const heading = document.createElement('h3');
        heading.textContent = team.name;
        const location = document.createElement('p');
        location.textContent = team.location;
        content.append(heading, location);
        const popup = new maplibregl.Popup({offset: 16, maxWidth: '280px', focusAfterOpen: true})
          .setLngLat(team.coordinates).setDOMContent(content);
        popup.on('close', () => {
          dot.setAttribute('aria-expanded', 'false');
        });
        map.jumpTo({center: team.coordinates});
        popup.addTo(map);
        const popupElement = popup.getElement();
        popupElement.id = `team-popup-${team.item.dataset.teamId}`;
        dot.setAttribute('aria-controls', popupElement.id);
        dot.setAttribute('aria-expanded', 'true');
        popupElement.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            popup.remove();
            origin.focus();
            event.stopPropagation();
          }
        });
        popupElement.querySelector('.maplibregl-popup-close-button').addEventListener('click', () => origin.focus());
        activePopup = popup;
      }
      dot.addEventListener('click', event => {
        event.stopPropagation();
        open(dot);
      });
      team.button.hidden = false;
      team.button.addEventListener('click', () => {
        container.scrollIntoView({block: 'center'});
        open(team.button);
      });
    });
    reset.hidden = false;
    reset.addEventListener('click', showAll);
    showAll();
    status.textContent = teams.length
      ? `${teams.length} participating institution${teams.length === 1 ? '' : 's'} on the map.`
      : 'The map is ready. Team locations will appear as institutions join ASCEND.';
    container.dataset.mapReady = 'true';
  });
} catch {
  unavailable();
}
