# Static deployment

Run the production build from this directory:

```sh
npm install
npm run build
```

The deployable files are in `dist/`. Copy the contents of `dist/` (including `index.html` and `assets/`) into the web server's public document root. The Vite build uses relative asset paths and needs no Node.js process or server-side application after upload.

The page needs internet access for alerts.in.ua report relays and Open-Meteo weather data. Verify urgent alert information on the official alerts.in.ua map.
