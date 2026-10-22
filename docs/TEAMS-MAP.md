# Participating institution map

The public page is `/teams/`. Its curated roster includes student teams, pod lead
institutions, subject matter experts, and project leadership. Demonstration missions do not populate
this roster. Institutions can appear before a full biography is supplied.

To add an institution, edit `data/teams.json`. Each entry needs a unique ID,
institution name, city, state or region, and numeric campus coordinates:

```json
[
  {
    "id": "example-college",
    "institution": "Example College",
    "city": "Example City",
    "state": "Example State",
    "kind": "team",
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
API key is needed. Nearby markers are grouped at the current zoom so every
location remains selectable; the numbered marker opens a popup with each
institution's details. Zooming in separates them. Directory buttons open an
individual institution directly.

`kind` controls both the marker and role label: `team` (green dot, default), `pod`
(gold star), `sme` (blue diamond), or `leadership` (purple square). Optional `role`
can name the specific leadership role, such as Principal Investigator or
Co-investigator. Optional `person` supplies a display name;
optional `profileId` links to an existing leadership biography and is checked
during the build. Do not add email addresses to the roster or published content.
Keep approximate campus/research center coordinates and source URLs with the
record. Names and institutions can be published without creating a placeholder
biography. Only supplied biographies are imported to the leadership page.

Montana State's principal investigator location uses the approved gold-ring
ASCEND logo badge at `/assets/teams/ascend-pi-badge.svg`, with a matching legend
and directory icon. Its map button is 60 pixels wide; nearby-marker grouping
accounts for that larger size. The major co-investigator retains a purple square.

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
