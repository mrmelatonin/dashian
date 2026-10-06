# Project Guidance

- Consider landscape layouts only; portrait layouts are out of scope.
- Place all final production builds in the `docs/` folder; do not use `dist/`.

## Area-Level Alert Map Findings

- The current map uses `@svg-maps/ukraine`, which contains oblast polygons only. `parseAlertReport` currently collapses each markdown oblast block to one status and affected-area count.
- The actionable area names and red/yellow levels are in section 3 of `https://api.alerts.in.ua/v3/alerts/active.md`. Area lists can include raions, hromadas, and cities; this project only needs raions and Kyiv City.
- Official raion geometry is served at `https://alerts.in.ua/assets/regions/v2/districts.svg?v=12`. It has 136 groups with `data-uid` and `data-raion`; each group has raion paths. The UID matches the active-alert API's raion `luid`/child `lruid` identifiers (for example, UID 47 is Nikopolskyi raion).
- Kyiv City is not a raion feature. Its separate path is in `https://alerts.in.ua/assets/map.svg`, marked `data-oblast="Київ"`, `data-raion="Київ"`, and `data-city="м. Київ"`; its SVG viewBox matches the district layer (`0 0 4960.6 3507.9`).
- `https://api.alerts.in.ua/v3/alerts/active.json` exposes compact alert records with `t` location types (`o`, `r`, `c`, `h`), `luid`, `lruid`, and `lhuid`. A browser fetch from the local app origin is blocked by CORS; the Jina relay returned the JSON successfully. Do not infer red/yellow from the undocumented compact level fields; take severity from the markdown report.
- The `alerts.in.ua` SVG assets were browser-fetchable cross-origin during investigation. Preserve source attribution and provide a fallback if remote geometry cannot load.