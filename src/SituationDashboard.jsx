import { useEffect, useState } from 'react'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  ExternalLink,
  MapPin,
  Moon,
  RefreshCw,
  ShieldAlert,
  Sun,
  Wind,
} from 'lucide-react'
import ukraineMap from '@svg-maps/ukraine'
import { COPY, REGION_NAMES_UK } from './locales'
import './SituationDashboard.css'

const ALERT_REPORT_URL = 'https://api.alerts.in.ua/v3/alerts/active.md'
const ALERT_RELAYS = [
  { name: 'Jina AI', url: `https://r.jina.ai/${ALERT_REPORT_URL}` },
  { name: 'AllOrigins', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(ALERT_REPORT_URL)}` },
]
const REPORT_REGION_IDS = {
  'Cherkaska oblast': 'cherkasy',
  'Chernihivska oblast': 'chernihiv',
  'Chernivetska oblast': 'chernivtsi',
  'Avtonomna Respublika Krym': 'crimea',
  'Dnipropetrovska oblast': 'dnipropetrovsk',
  'Donetska oblast': 'donetsk',
  'Ivano-Frankivska oblast': 'ivano-frankivsk',
  'Kharkivska oblast': 'kharkiv',
  'Khersonska oblast': 'kherson',
  'Khmelnytska oblast': 'khmelnytskyi',
  'Kirovohradska oblast': 'kirovohrad',
  'Kyivska oblast': 'kyiv',
  'm. Kyiv': 'kyiv-city',
  'Luhanska oblast': 'luhansk',
  'Lvivska oblast': 'lviv',
  'Mykolaivska oblast': 'mykolaiv',
  'Odeska oblast': 'odessa',
  'Poltavska oblast': 'poltava',
  'Rivnenska oblast': 'rivne',
  'Sumska oblast': 'sumy',
  'Ternopilska oblast': 'ternopil',
  'Vinnytska oblast': 'vinnytsia',
  'Volynska oblast': 'volyn',
  'Zakarpatska oblast': 'zakarpattia',
  'Zaporizka oblast': 'zaporizhia',
  'Zhytomyrska oblast': 'zhytomyr',
}

const REGIONS = [
  { id: 'kyiv-city', name: 'Kyiv city', label: 'Kyiv city', latitude: 50.4501, longitude: 30.5234 },
  { id: 'cherkasy', name: 'Cherkasy', label: 'Cherkasy oblast', latitude: 49.4444, longitude: 32.0598 },
  { id: 'chernihiv', name: 'Chernihiv', label: 'Chernihiv oblast', latitude: 51.4982, longitude: 31.2893 },
  { id: 'chernivtsi', name: 'Chernivtsi', label: 'Chernivtsi oblast', latitude: 48.2915, longitude: 25.9403 },
  { id: 'crimea', name: 'Crimea', label: 'Crimea', latitude: 44.9521, longitude: 34.1024 },
  { id: 'dnipropetrovsk', name: 'Dnipro', label: 'Dnipropetrovsk oblast', latitude: 48.4647, longitude: 35.0462 },
  { id: 'donetsk', name: 'Donetsk', label: 'Donetsk oblast', latitude: 48.0159, longitude: 37.8029 },
  { id: 'ivano-frankivsk', name: 'Ivano-Frankivsk', label: 'Ivano-Frankivsk oblast', latitude: 48.9226, longitude: 24.7111 },
  { id: 'kharkiv', name: 'Kharkiv', label: 'Kharkiv oblast', latitude: 49.9935, longitude: 36.2304 },
  { id: 'kherson', name: 'Kherson', label: 'Kherson oblast', latitude: 46.6354, longitude: 32.6169 },
  { id: 'khmelnytskyi', name: 'Khmelnytskyi', label: 'Khmelnytskyi oblast', latitude: 49.4229, longitude: 26.9871 },
  { id: 'kirovohrad', name: 'Kropyvnytskyi', label: 'Kirovohrad oblast', latitude: 48.5079, longitude: 32.2623 },
  { id: 'kyiv', name: 'Kyiv oblast', label: 'Kyiv oblast', latitude: 49.798, longitude: 30.116 },
  { id: 'luhansk', name: 'Luhansk', label: 'Luhansk oblast', latitude: 48.574, longitude: 39.307 },
  { id: 'lviv', name: 'Lviv', label: 'Lviv oblast', latitude: 49.8397, longitude: 24.0297 },
  { id: 'mykolaiv', name: 'Mykolaiv', label: 'Mykolaiv oblast', latitude: 46.975, longitude: 31.9946 },
  { id: 'odessa', name: 'Odesa', label: 'Odesa oblast', latitude: 46.4825, longitude: 30.7233 },
  { id: 'poltava', name: 'Poltava', label: 'Poltava oblast', latitude: 49.5883, longitude: 34.5514 },
  { id: 'rivne', name: 'Rivne', label: 'Rivne oblast', latitude: 50.6199, longitude: 26.2516 },
  { id: 'sumy', name: 'Sumy', label: 'Sumy oblast', latitude: 50.9077, longitude: 34.7981 },
  { id: 'ternopil', name: 'Ternopil', label: 'Ternopil oblast', latitude: 49.5535, longitude: 25.5948 },
  { id: 'vinnytsia', name: 'Vinnytsia', label: 'Vinnytsia oblast', latitude: 49.2331, longitude: 28.4682 },
  { id: 'volyn', name: 'Lutsk', label: 'Volyn oblast', latitude: 50.7472, longitude: 25.3254 },
  { id: 'zakarpattia', name: 'Uzhhorod', label: 'Zakarpattia oblast', latitude: 48.6208, longitude: 22.2879 },
  { id: 'zaporizhia', name: 'Zaporizhzhia', label: 'Zaporizhia oblast', latitude: 47.8388, longitude: 35.1396 },
  { id: 'zhytomyr', name: 'Zhytomyr', label: 'Zhytomyr oblast', latitude: 50.2547, longitude: 28.6587 },
]

const WEATHER = [
  { codes: [0], key: 'clear', Icon: Sun },
  { codes: [1, 2], key: 'partlyCloudy', Icon: CloudSun },
  { codes: [3], key: 'overcast', Icon: Cloud },
  { codes: [45, 48], key: 'fog', Icon: CloudFog },
  { codes: [51, 53, 55, 56, 57], key: 'drizzle', Icon: CloudDrizzle },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], key: 'rain', Icon: CloudRain },
  { codes: [71, 73, 75, 77, 85, 86], key: 'snow', Icon: CloudSnow },
  { codes: [95, 96, 99], key: 'thunderstorm', Icon: CloudLightning },
]

function weatherForCode(code, locale) {
  const condition = WEATHER.find((item) => item.codes.includes(code)) ?? WEATHER[2]
  return { ...condition, label: COPY[locale].weatherCodes[condition.key] }
}

function formatForecastDay(date, locale) {
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}

function formatKyivTime(date, locale) {
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kyiv',
  }).format(date)
}

function parseAlertReport(markdown) {
  const section = markdown.match(/## 3\. CURRENT WARNING STATUS\s*([\s\S]*?)(?=\n## 4\.)/)?.[1]
  const reportTime = markdown.match(/\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})\b/)?.[1]

  if (!section || !reportTime) throw new Error('The alert report format could not be read.')

  const statuses = {}
  for (const block of section.split(/\n\s*\n/)) {
    const heading = block.match(/^\*\*([^*]+)\*\*/)?.[1]
    if (!heading || heading === 'Nominal alerts in occupied territory') continue

    const regionId = REPORT_REGION_IDS[heading.split(' (')[0]]
    if (!regionId) continue

    const levels = [...block.matchAll(/\b(red|yellow)\s*\((?:missile|drone)/gi)].map((match) => match[1].toLowerCase())
    const level = levels.includes('red') || levels.length === 0 ? 'red' : 'yellow'
    const areas = Number(block.match(/(\d+)\s+areas?\s+affected/i)?.[1] ?? 1)
    statuses[regionId] = { level, areas }
  }

  return {
    statuses,
    reportTime: new Date(reportTime),
    warningSummary: markdown.match(/WARNING STATE\s+([^\n]+)/)?.[1]?.trim() ?? '',
    summary: markdown.match(/WARNING STATE\s+ACTIVE\s+[—-]\s+(\d+)\s+areas?\s+in\s+(\d+)\s+oblasts?\s*\((\d+)\s+red,\s*(\d+)\s+yellow\)/i)?.slice(1).map(Number),
  }
}

function formatAreaCount(count, locale) {
  if (locale === 'en') return `${count} ${count === 1 ? 'area' : 'areas'}`
  const lastTwo = count % 100
  const last = count % 10
  const noun = lastTwo >= 11 && lastTwo <= 14 ? 'районів' : last === 1 ? 'район' : last >= 2 && last <= 4 ? 'райони' : 'районів'
  return `${count} ${noun}`
}

export default function SituationDashboard() {
  const [regionId, setRegionId] = useState('kyiv-city')
  const [theme, setTheme] = useState(() => window.localStorage.getItem('fieldnote-theme') ?? 'dark')
  const [locale, setLocale] = useState(() => window.localStorage.getItem('fieldnote-locale') ?? 'en')
  const [forecast, setForecast] = useState({ regionId: '', data: null, error: '', updatedAt: null })
  const [alertFeed, setAlertFeed] = useState({ report: null, error: '', status: 'loading', isStale: false })
  const [refreshKey, setRefreshKey] = useState(0)
  const region = REGIONS.find((item) => item.id === regionId) ?? REGIONS[0]
  const text = COPY[locale]
  const regionName = locale === 'uk' ? REGION_NAMES_UK[region.id] : region.name
  const isLoading = forecast.regionId !== regionId
  const weather = forecast.regionId === regionId ? forecast.data : null
  const weatherError = forecast.regionId === regionId ? forecast.error : ''
  const updatedAt = forecast.regionId === regionId ? forecast.updatedAt : null

  useEffect(() => {
    const controller = new AbortController()
    const selectedRegion = REGIONS.find((item) => item.id === regionId) ?? REGIONS[0]
    const query = new URLSearchParams({
      latitude: String(selectedRegion.latitude),
      longitude: String(selectedRegion.longitude),
      current: 'temperature_2m,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'Europe/Kyiv',
      forecast_days: '4',
    })

    fetch(`https://api.open-meteo.com/v1/forecast?${query}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Forecast service is unavailable.')
        return response.json()
      })
      .then((data) => {
        setForecast({ regionId, data, error: '', updatedAt: new Date() })
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setForecast({ regionId, data: null, error: true, updatedAt: null })
        }
      })

    return () => controller.abort()
  }, [regionId, refreshKey])

  useEffect(() => {
    let isActive = true
    let controller

    const loadReport = async () => {
      controller?.abort()
      controller = new AbortController()
      let relayError

      for (const relay of ALERT_RELAYS) {
        try {
          const timeoutSignal = AbortSignal.timeout(12_000)
          const signal = AbortSignal.any([controller.signal, timeoutSignal])
          const response = await fetch(relay.url, { signal })
          if (!response.ok) throw new Error(`${relay.name} relay returned ${response.status}.`)
          const report = parseAlertReport(await response.text())
          const isStale = Date.now() - report.reportTime.getTime() > 5 * 60 * 1000
          if (isActive) setAlertFeed({ report: { ...report, relay: relay.name }, error: '', status: 'ready', isStale })
          return
        } catch (error) {
          if (controller.signal.aborted) return
          relayError = error
        }
      }

      if (isActive) {
        setAlertFeed((previous) => ({
          ...previous,
          error: true,
          status: previous.report ? 'ready' : 'error',
          isStale: previous.report ? Date.now() - previous.report.reportTime.getTime() > 5 * 60 * 1000 : false,
        }))
      }
      console.warn('All alert report relays failed.', relayError)
    }

    void loadReport()
    return () => {
      isActive = false
      controller?.abort()
    }
  }, [refreshKey])

  useEffect(() => {
    const interval = window.setInterval(() => setRefreshKey((key) => key + 1), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const currentCondition = weather ? weatherForCode(weather.current.weather_code, locale) : null
  const CurrentIcon = currentCondition?.Icon ?? CloudSun
  const forecastDays = weather?.daily.time.map((date, index) => ({
    date,
    high: Math.round(weather.daily.temperature_2m_max[index]),
    low: Math.round(weather.daily.temperature_2m_min[index]),
    rain: weather.daily.precipitation_probability_max[index],
    ...weatherForCode(weather.daily.weather_code[index], locale),
  })) ?? []
  const activeStatuses = alertFeed.report?.statuses ?? {}
  const selectedAlert = activeStatuses[regionId]
  const isReportStale = alertFeed.isStale
  const hasCurrentReport = alertFeed.report && !isReportStale
  const statusTone = hasCurrentReport ? selectedAlert?.level ?? 'green' : 'neutral'
  const statusLabel = !hasCurrentReport
    ? isReportStale ? text.statusStale : alertFeed.status === 'error' ? text.statusUnavailable : text.statusLoading
    : selectedAlert
      ? selectedAlert.level === 'red' ? text.redAlert : text.yellowAlert
      : text.noAlert
  const statusDetail = !hasCurrentReport
    ? isReportStale ? `${text.lastUpdate} ${formatKyivTime(alertFeed.report.reportTime, locale)} ${text.kyiv}` : text.liveStatusUnavailable
    : selectedAlert
      ? `${formatAreaCount(selectedAlert.areas, locale)} · ${formatKyivTime(alertFeed.report.reportTime, locale)} ${text.kyiv}`
      : `${text.clear} · ${formatKyivTime(alertFeed.report.reportTime, locale)} ${text.kyiv}`
  useEffect(() => {
    window.localStorage.setItem('fieldnote-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('fieldnote-locale', locale)
    document.documentElement.lang = locale
    document.title = COPY[locale].documentTitle
  }, [locale])

  return (
    <div className="app-shell" data-theme={theme}>
      <header className="topbar">
        <a className="brand" href="#overview" aria-label={text.fieldnoteHome}>
          <span className="brand-mark"><span /></span>
          <span className="brand-name">FIELDNOTE<span>/UA</span></span>
        </a>
        <div className="topbar-center"><span className="topbar-dot" /> {text.topbarCenter}</div>
        <div className="topbar-actions">
          <button className="locale-toggle" type="button" onClick={() => setLocale((current) => current === 'en' ? 'uk' : 'en')} aria-label={text.switchLanguage} title={text.switchLanguage}>
            {text.language}
          </button>
          <button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? text.switchToLight : text.switchToDark} title={theme === 'dark' ? text.switchToLight : text.switchToDark}>
            {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
          <a className="source-link" href="https://alerts.in.ua/" target="_blank" rel="noreferrer">
            {text.officialAlertMap} <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main id="overview" className="dashboard">
        <div className="dashboard-grid">
          <section className="map-panel" aria-labelledby="map-title">
            <div className="panel-heading map-heading">
              <div>
                <p className="eyebrow">{text.nationalView} <span className="section-index">01</span></p>
                <h2 id="map-title">{text.mapTitle}</h2>
              </div>
              <button className="icon-link" type="button" onClick={() => setRefreshKey((key) => key + 1)} aria-label={text.refreshAll} title={text.refreshAll}>
                <RefreshCw size={16} aria-hidden="true" />
              </button>
            </div>
            <div className={`alert-map-wrap${isReportStale ? ' is-stale' : ''}`}>
              {alertFeed.report ? (
                <svg className="alert-map" viewBox={ukraineMap.viewBox} role="img" aria-labelledby="ukraine-map-title ukraine-map-description">
                  <title id="ukraine-map-title">{text.mapAriaTitle}</title>
                  <desc id="ukraine-map-description">{text.mapAriaDescription}</desc>
                  {ukraineMap.locations.map((location) => {
                    const status = hasCurrentReport ? activeStatuses[location.id] : null
                    const selectable = REGIONS.some((item) => item.id === location.id)
                    const locationName = locale === 'uk' ? REGION_NAMES_UK[location.id] ?? location.name : location.name
                    const statusLabel = status
                      ? `${status.level === 'red' ? text.redLegend : text.yellowLegend} · ${formatAreaCount(status.areas, locale)}`
                      : text.clearLegend
                    return (
                      <path
                        key={location.id}
                        d={location.path}
                        className={`oblast-shape${status ? ` is-${status.level}` : ''}${location.id === regionId ? ' is-selected' : ''}${selectable ? ' is-selectable' : ''}`}
                        role={selectable ? 'button' : 'img'}
                        tabIndex={selectable ? 0 : -1}
                        aria-label={`${locationName}: ${statusLabel}`}
                        onClick={selectable ? () => setRegionId(location.id) : undefined}
                        onKeyDown={selectable ? (event) => { if (event.key === 'Enter' || event.key === ' ') setRegionId(location.id) } : undefined}
                      >
                        <title>{locationName} · {statusLabel}</title>
                      </path>
                    )
                  })}
                </svg>
              ) : (
                <div className="map-message" role="status">
                  {alertFeed.status === 'loading' ? <><RefreshCw size={19} className="spin" aria-hidden="true" /> {text.loadingAlerts}</> : <>{text.alertUnavailable} <a href="https://alerts.in.ua/" target="_blank" rel="noreferrer">{text.openMap} <ExternalLink size={13} aria-hidden="true" /></a></>}
                </div>
              )}
              {alertFeed.report?.warningSummary && <div className="map-summary">{locale === 'uk' && alertFeed.report.summary ? `${formatAreaCount(alertFeed.report.summary[0], locale)} у ${alertFeed.report.summary[1]} областях · ${alertFeed.report.summary[2]} ${text.redCount} / ${alertFeed.report.summary[3]} ${text.yellowCount}` : alertFeed.report.warningSummary}</div>}
            </div>
            <div className="map-caption">
              <div className="map-legend" aria-label="Alert map legend">
                <span><i className="legend-swatch is-red" /> {text.redLegend}</span>
                <span><i className="legend-swatch is-yellow" /> {text.yellowLegend}</span>
                <span><i className="legend-swatch is-clear" /> {text.clearLegend}</span>
              </div>
              <a className="map-attribution" href="https://mapsvg.com/maps/ukraine" target="_blank" rel="noreferrer">{text.mapAttribution}</a>
            </div>
          </section>

          <aside className="side-column">
            <section className="region-panel" aria-labelledby="region-title">
              <div className="panel-heading region-heading">
                <div>
                  <p className="eyebrow">{text.localConditions} <span className="section-index">02</span></p>
                  <h2 id="region-title">{regionName}</h2>
                </div>
                <MapPin size={18} strokeWidth={1.8} aria-hidden="true" />
              </div>

              <div className={`alarm-status is-${statusTone}`} role="status" aria-live="polite" aria-atomic="true">
                <div className="status-icon"><ShieldAlert size={27} strokeWidth={1.8} aria-hidden="true" /></div>
                <div className="status-copy">
                  <strong>{statusLabel}</strong>
                  <span className="status-detail">{statusDetail}</span>
                </div>
              </div>
              <p className="source-caveat">{text.reportSource}: <a href={ALERT_REPORT_URL} target="_blank" rel="noreferrer">alerts.in.ua</a> · {alertFeed.report?.relay ?? 'relay'}</p>
              {alertFeed.error && alertFeed.report && <p className="feed-warning" role="status">{text.relayWarning}</p>}
            </section>

            <section className="weather-panel" aria-labelledby="weather-title">
              <div className="panel-heading weather-heading">
                <div>
                  <p className="eyebrow">{text.threeDayOutlook} <span className="section-index">03</span></p>
                  <h2 id="weather-title">{text.weather} <span>· {regionName}</span></h2>
                </div>
                <Wind size={18} strokeWidth={1.8} aria-hidden="true" />
              </div>

              {isLoading && <div className="weather-message"><RefreshCw size={16} className="spin" aria-hidden="true" /> {text.loadingForecast}</div>}
              {!isLoading && weatherError && <div className="weather-message weather-error" role="status">{text.forecastUnavailable}</div>}

              {!isLoading && !weatherError && weather && (
                <>
                  <div className="current-weather">
                    <div className="current-icon"><CurrentIcon size={29} strokeWidth={1.6} aria-hidden="true" /></div>
                    <div className="current-reading">
                      <span>{text.now}</span>
                      <strong>{Math.round(weather.current.temperature_2m)}<sup>°</sup></strong>
                    </div>
                    <div className="current-condition">
                      <strong>{currentCondition.label}</strong>
                      <span><Wind size={13} aria-hidden="true" /> {Math.round(weather.current.wind_speed_10m)} {locale === 'uk' ? 'км/год' : 'km/h'}</span>
                    </div>
                  </div>
                  <div className="forecast-list">
                    {forecastDays.map((day, index) => {
                      const DayIcon = day.Icon
                      return (
                        <div className="forecast-row" key={day.date}>
                          <div className="forecast-day-group">
                            <span className="forecast-day">{index === 0 ? text.today : formatForecastDay(day.date, locale)}</span>
                            {index === 0 && <span className="forecast-date">{formatForecastDay(day.date, locale)}</span>}
                            <span className="forecast-rain">{day.rain ?? 0}%</span>
                          </div>
                          <DayIcon size={34} strokeWidth={1.7} className="forecast-icon" aria-hidden="true" />
                          <span className="forecast-condition">{day.label}</span>
                          <span className="forecast-range"><b><small>{text.high}</small>{day.high}°</b><span><small>{text.low}</small>{day.low}°</span></span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="weather-footnote">
                    <span>{text.precipitationChance}</span>
                    <span className="updated-at">{updatedAt ? `${text.forecastUpdated} ${formatKyivTime(updatedAt, locale)} ${text.kyiv}` : '—'}</span>
                  </div>
                </>
              )}
              <div className="weather-source">{locale === 'uk' ? 'Прогноз:' : 'Forecast by'} <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo <ExternalLink size={11} aria-hidden="true" /></a><a href="https://alerts.in.ua/" target="_blank" rel="noreferrer">{text.officialAlertMap} <ExternalLink size={11} aria-hidden="true" /></a></div>
            </section>
          </aside>
        </div>

      </main>
    </div>
  )
}
