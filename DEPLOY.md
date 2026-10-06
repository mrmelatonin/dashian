# Static deployment

Run the production build from this directory:

```sh
npm install
npm run build
```

The deployable files are in `docs/`. Run the build to refresh that folder, which contains `index.html` and `assets/`. The Vite build uses relative asset paths and needs no Node.js process or server-side application after upload.

The page needs internet access for alerts.in.ua report relays and Open-Meteo weather data. Verify urgent alert information on the official alerts.in.ua map.
