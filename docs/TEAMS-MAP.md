# Participating institution map

The public page is `/teams/`. It starts with an empty directory; leadership
affiliations and demonstration missions do not populate this roster.

To add an institution, edit `data/teams.json`. Each entry needs a unique ID,
institution name, city, state or region, and numeric campus coordinates:

```json
[
  {
    "id": "example-college",
    "institution": "Example College",
    "city": "Example City",
    "state": "Example State",
    "latitude": 40.0,
    "longitude": -105.0
  }
]
```

This is a format example only, not a participating institution. Use a public
campus location. Latitude comes first in the roster; U.S. longitudes are negative.
Keep IDs stable. The build validates required fields, unique IDs, and coordinate
ranges, then sorts institutions alphabetically. The same records supply both the
directory and map, including institution-name popups. No browser geocoding or map
API key is needed. Zoom in to distinguish nearby campus markers.

Run `npm test` and `npx playwright test tests/teams-map.spec.js` before publishing
through the existing GitHub/Cloudflare workflow. Rebuilding updates the page,
search index, map markers, and directory together. The directory also works
without JavaScript or WebGL.

The map uses the project's existing MapLibre dependency and locally hosted data:

- Natural Earth land boundaries from the existing world-atlas build.
- U.S. state boundaries from [us-atlas 3.0.1](https://github.com/topojson/us-atlas),
  converted from `states-10m.json` into `public/assets/teams/us-states.geojson`.
  These are the U.S. Census Bureau's 2017 cartographic boundaries, distributed
  under the accompanying `us-atlas-LICENSE.txt`.

The map has no external tile service. It shows campus locations rather than
flight trajectories or live team member locations.
