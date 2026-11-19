# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from `dashboard/` (the git repo root; the parent `dashian/` folder only holds editor/agent config).

- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build into `docs/` (not `dist/`)
- `npm run lint` — Oxlint (config in `.oxlintrc.json`)
- `npm run preview` — serve the built `docs/` output

There is no test suite. Verify changes with `npm run lint` and `npm run build`, and by running the app.

## Project rules (from AGENTS.md)

- Landscape layouts only; portrait layouts are out of scope.
- Production builds go in `docs/` (committed, served as a static site; `vite.config.js` sets `base: './'` and `outDir: 'docs'`). Rebuild to refresh `docs/` after source changes that should ship.
- Preserve the alerts.in.ua map attribution and the Open-Meteo attribution.

## Target screen and text sizes

- Target device: Google Nexus 7 (2013) in landscape — 1920 × 1200 physical px at 2× density, so the layout must fit a **960 × 600 CSS px** viewport (check 960 × 540 too, for visible browser chrome) with no scrolling.
- The dashboard is read from a distance: distance-read text must be **≥ 16px**; attribution/source fine print may go down to **12px**; nothing smaller.
- All font sizes come from the `--fs-*` tokens at the top of `src/SituationDashboard.css`; theme colors are CSS variables on `.app-shell` and `.app-shell[data-theme='dark']`. Don't add raw `font-size` px values or per-theme color overrides.

## Architecture

A single-page React 19 + Vite app ("Fieldnote" Ukraine situation dashboard): live air-raid alert map plus per-region weather. No backend; everything is fetched from public APIs in the browser.

- `src/main.jsx` renders `SituationDashboard`.
- `src/SituationDashboard.jsx` holds nearly all logic: constants, the alert report parser, data fetching, and rendering. Styles live in `SituationDashboard.css`; `global.css` holds base styles.
- `src/locales.js` exports `COPY` (`en` / `uk` UI strings) and `REGION_NAMES_UK`. Every user-facing string needs both locales.
- Theme and locale persist in `localStorage` under `fieldnote-theme` / `fieldnote-locale`.
- A 60 s interval bumps `refreshKey`, which re-runs the alert and weather effects.

### Alert data flow

1. The markdown report `https://api.alerts.in.ua/v3/alerts/active.md` is fetched through CORS relays (`ALERT_RELAYS`: Jina `r.jina.ai`, then AllOrigins), each with a 12 s timeout. Direct browser fetch is blocked by CORS.
2. `parseAlertReport` reads section `## 3. CURRENT WARNING STATUS`. Each `**Oblast**` heading maps to a region id through `REPORT_REGION_IDS` (English and Ukrainian names). It extracts red/yellow severity, the area count, and per-area statuses. An oblast with no parsed areas is treated as a whole-oblast alert.
3. A report older than 5 minutes is marked stale, and the UI shows a neutral or stale status instead of green.
4. Take severity from the markdown report only. Do not infer red/yellow from the compact fields in `active.json`.

### Map rendering

- The detail layer combines raion paths from `alerts.in.ua/assets/regions/v2/districts.svg` (`g[data-uid][data-raion]`) and the Kyiv City paths (`path[data-city="м. Київ"]`) from `alerts.in.ua/assets/map.svg`. Both share the viewBox `0 0 4960.6 3507.9`.
- If that fetch or parse fails, the map falls back to `@svg-maps/ukraine` oblast polygons (`MAP_OBLAST_REGION_IDS`).
- Matching raions are colored individually. All raions in an oblast are colored only on a whole-oblast alert. Hromadas and non-Kyiv cities are out of scope.
- `AGENTS.md` records the investigation findings (UID ↔ `luid`/`lruid` mapping, feature counts). Read it before changing the parser or map.

### Power outage timeline

`src/powerSchedule.js` fetches and normalizes the DTEK Kyiv city schedule for one queue (`POWER_QUEUE`, currently `27.1`); `src/PowerTimeline.jsx` renders the row under the map (today 00–24, on/off/maybe segments, current-time tick, "until HH:MM").

- Primary source: `raw.githubusercontent.com/Baskerville42/outage-data-ua/main/data/kyiv.json`, a community mirror of the DTEK site data (CORS-enabled). Groups are keyed `GPV27.1`; hourly values `yes|no|first|second|maybe|mfirst|msecond`; day keys are Unix timestamps of Kyiv midnight.
- Fallback: YASNO public API `app.yasno.ua/api/blackout-service/public/shutdowns/regions/25/dsos/902/planned-outages` through `r.jina.ai` (no CORS headers). Slots are minutes from midnight, types `NotPlanned`/`Definite`; statuses `ScheduleApplies`, `WaitingForSchedule`, `NoShutdowns`, `EmergencyShutdowns`.
- DTEK's own site and `api.yasno.com.ua` sit behind Incapsula bot protection. alerts.energy needs a paid key that must stay server-side, so it is not used.

### Weather

Open-Meteo forecast for the selected region's coordinates (`REGIONS`), timezone `Europe/Kyiv`, 4 days. `WEATHER` maps WMO codes to lucide icons and locale keys.
