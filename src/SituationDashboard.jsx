import { useEffect, useState } from 'react'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  ExternalLink,
  MapPin,
  Moon,
  RefreshCw,
  ShieldAlert,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import ukraineMap from '@svg-maps/ukraine'
import { COPY, REGION_NAMES_UK } from './locales'
import PowerTimeline from './PowerTimeline'
import './SituationDashboard.css'

const ALERT_REPORT_URL = 'https://api.alerts.in.ua/v3/alerts/active.md'
const DISTRICT_MAP_URL = 'https://alerts.in.ua/assets/regions/v2/districts.svg?v=12'
const FULL_MAP_URL = 'https://alerts.in.ua/assets/map.svg'
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

const MAP_OBLAST_REGION_IDS = {
  'Автономна Республіка Крим': 'crimea',
  'Волинська область': 'volyn',
  'Вінницька область': 'vinnytsia',
  'Дніпропетровська область': 'dnipropetrovsk',
  'Донецька область': 'donetsk',
  'Житомирська область': 'zhytomyr',
  'Закарпатська область': 'zakarpattia',
  'Запорізька область': 'zaporizhia',
  'Івано-Франківська область': 'ivano-frankivsk',
  'Київ': 'kyiv-city',
  'Київська область': 'kyiv',
  'Кіровоградська область': 'kirovohrad',
  'Луганська область': 'luhansk',
  'Львівська область': 'lviv',
  'Миколаївська область': 'mykolaiv',
  'Одеська область': 'odessa',
  'Полтавська область': 'poltava',
  'Рівненська область': 'rivne',
  'Сумська область': 'sumy',
  'Тернопільська область': 'ternopil',
  'Харківська область': 'kharkiv',
  'Херсонська область': 'kherson',
  'Хмельницька область': 'khmelnytskyi',
  'Черкаська область': 'cherkasy',
  'Чернівецька область': 'chernivtsi',
  'Чернігівська область': 'chernihiv',
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

function normalizeAreaName(name) {
  return name
    .normalize('NFC')
    .trim()
    .replace(/^м\.\s*/i, '')
    .replace(/\s+район$/i, '')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('uk-UA')
}

function areaEntriesFromText(areaText, level, regionId, areaStatuses) {
  for (const match of areaText.matchAll(/([^,;:]+?)\s*\(([^()]+)\)/g)) {
    const name = match[1].trim()
    if (/^(red|yellow)$/i.test(name)) continue

    const nameUk = match[2].trim()
    const key = `${regionId}:${normalizeAreaName(nameUk)}`
    const previous = areaStatuses[key]
    if (!previous || level === 'red') {
      areaStatuses[key] = { level, name, nameUk }
    }
  }
}

function mapRegionId(location) {
  return MAP_OBLAST_REGION_IDS[location.oblast] ?? ''
}

function mapAreaStatus(location, report) {
  const regionId = mapRegionId(location)
  const areaStatus = report.areaStatuses[`${regionId}:${normalizeAreaName(location.name)}`]
  if (areaStatus) return areaStatus

  const oblastStatus = report.statuses[regionId]
  return oblastStatus?.wholeOblast ? oblastStatus : null
}

function parseAlertReport(markdown) {
  const section = markdown.match(/## 3\. CURRENT WARNING STATUS\s*([\s\S]*?)(?=\n## 4\.)/)?.[1]
  const reportTime = markdown.match(/\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})\b/)?.[1]

  if (!section || !reportTime) throw new Error('The alert report format could not be read.')

  const statuses = {}
  const areaStatuses = {}
  for (const entry of section.split(/(?=^\*\*[^*]+\*\*)/m)) {
    const block = entry.trim()
    const heading = block.match(/^\*\*([^*]+)\*\*/)?.[1]
    if (!heading || heading === 'Nominal alerts in occupied territory') continue

    const regionId = REPORT_REGION_IDS[heading.split(' (')[0]]
    if (!regionId) continue

    const levels = [...block.matchAll(/\b(red|yellow)\s*\((?:missile|drone)/gi)].map((match) => match[1].toLowerCase())
    const level = levels.includes('red') || levels.length === 0 ? 'red' : 'yellow'
    const areas = Number(block.match(/(\d+)\s+areas?\s+affected/i)?.[1] ?? 1)
    const areaText = (block.match(/\d+\s+areas?\s+affected:\s*([\s\S]*?)(?=\s+The most recent\b|$)/i)?.[1] ?? '')
      .replace(/\s*\[(?:red|yellow)\s*\([^\]]*\)\]\s*\.?\s*$/i, '')
    const blockAreaStatuses = {}
    const levelGroups = [...areaText.matchAll(/\b(red|yellow)\s*\([^)]*\)\s*:\s*([\s\S]*?)(?=;\s*(?:red|yellow)\s*\([^)]*\)\s*:|$)/gi)]
    if (levelGroups.length) {
      for (const group of levelGroups) {
        areaEntriesFromText(group[2], group[1].toLowerCase(), regionId, blockAreaStatuses)
      }
    } else if (areaText) {
      areaEntriesFromText(areaText, level, regionId, blockAreaStatuses)
    }
    Object.assign(areaStatuses, blockAreaStatuses)

    statuses[regionId] = { level, areas, wholeOblast: Object.keys(blockAreaStatuses).length === 0 }
  }

  return {
    statuses,
    areaStatuses,
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
  const [areaMap, setAreaMap] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [powerSource, setPowerSource] = useState('')
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
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
      timezone: 'Europe/Kyiv',
      forecast_days: '2',
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
    const controller = new AbortController()

    Promise.all([DISTRICT_MAP_URL, FULL_MAP_URL].map((url) => fetch(url, { signal: controller.signal })))
      .then((responses) => {
        if (responses.some((response) => !response.ok)) throw new Error('Map service is unavailable.')
        return Promise.all(responses.map((response) => response.text()))
      })
      .then(([districtText, fullMapText]) => {
        const parser = new DOMParser()
        const districts = parser.parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${districtText}</svg>`, 'image/svg+xml')
        const fullMap = parser.parseFromString(fullMapText, 'image/svg+xml')
        const viewBox = fullMap.documentElement.getAttribute('viewBox')
        const raions = [...districts.querySelectorAll('g[data-uid]')].flatMap((group) => {
          const areaName = group.getAttribute('data-raion')
          const uid = group.getAttribute('data-uid')
          return [...group.querySelectorAll('path')].map((path, index) => ({
            id: `raion-${uid}-${index}`,
            name: areaName,
            oblast: path.getAttribute('data-oblast'),
            path: path.getAttribute('d'),
            type: 'raion',
          }))
        })
        const kyivCity = [...fullMap.querySelectorAll('path[data-city="м. Київ"]')].map((path, index) => ({
          id: `kyiv-city-${index}`,
          name: 'м. Київ',
          oblast: 'Київ',
          path: path.getAttribute('d'),
          type: 'city',
        }))
        const locations = [...raions, ...kyivCity]

        if (!viewBox || raions.length === 0 || kyivCity.length === 0) {
          throw new Error('The detailed map geometry could not be read.')
        }
        setAreaMap({ viewBox, locations })
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('Detailed map geometry is unavailable; using the oblast map.', error)
        }
      })

    return () => controller.abort()
  }, [])

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
    wind: Math.round(weather.daily.wind_speed_10m_max[index]),
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
      <main id="overview" className="dashboard">
        <section className="panel map-panel" aria-label={text.mapTitle}>
          <div className={`alert-map-wrap${isReportStale ? ' is-stale' : ''}`}>
          {alertFeed.report ? (
            <svg className="alert-map" viewBox={areaMap?.viewBox ?? ukraineMap.viewBox} role="img" aria-labelledby="ukraine-map-title ukraine-map-description">
              <title id="ukraine-map-title">{text.mapAriaTitle}</title>
              <desc id="ukraine-map-description">{text.mapAriaDescription}</desc>
              {areaMap ? areaMap.locations.map((location) => {
                const parentRegionId = mapRegionId(location)
                const status = hasCurrentReport ? mapAreaStatus(location, alertFeed.report) : null
                const selectable = REGIONS.some((item) => item.id === parentRegionId)
                const locationName = (locale === 'uk' ? status?.nameUk : status?.name) ?? location.name
                const statusLabel = status
                  ? status.level === 'green' ? text.clearLegend : status.level === 'red' ? text.redLegend : text.yellowLegend
                  : text.clearLegend
                return (
                  <path
                    key={location.id}
                    d={location.path}
                    className={`oblast-shape${status && status.level !== 'green' ? ` is-${status.level}` : ''}${parentRegionId === regionId ? ' is-selected' : ''}${selectable ? ' is-selectable' : ''}`}
                    role={selectable ? 'button' : 'img'}
                    tabIndex={selectable ? 0 : -1}
                    aria-label={`${locationName}: ${statusLabel}`}
                    onClick={selectable ? () => setRegionId(parentRegionId) : undefined}
                    onKeyDown={selectable ? (event) => { if (event.key === 'Enter' || event.key === ' ') setRegionId(parentRegionId) } : undefined}
                  >
                    <title>{locationName} · {statusLabel}</title>
                  </path>
                )
              }) : ukraineMap.locations.map((location) => {
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
          </div>
        </section>

        <PowerTimeline text={text} refreshKey={refreshKey} onSource={setPowerSource} />

        <aside className="panel side-panel" aria-labelledby="region-title">
          <div className="side-header">
            <h2 id="region-title" className="region-title"><MapPin aria-hidden="true" /> {regionName}</h2>
            <div className="controls">
              <button className="control-button" type="button" onClick={() => setRefreshKey((key) => key + 1)} aria-label={text.refreshAll} title={text.refreshAll}>
                <RefreshCw aria-hidden="true" />
              </button>
              <button className="control-button locale-toggle" type="button" onClick={() => setLocale((current) => current === 'en' ? 'uk' : 'en')} aria-label={text.switchLanguage} title={text.switchLanguage}>
                {text.language}
              </button>
              <button className="control-button" type="button" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? text.switchToLight : text.switchToDark} title={theme === 'dark' ? text.switchToLight : text.switchToDark}>
                {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className={`alarm-status is-${statusTone}`} role="status" aria-live="polite" aria-atomic="true">
            <ShieldAlert className="status-icon" strokeWidth={1.8} aria-hidden="true" />
            <div className="status-copy">
              <strong>{statusLabel}</strong>
              <span className="status-detail">{statusDetail}</span>
            </div>
          </div>
          {alertFeed.error && alertFeed.report && <p className="feed-warning" role="status">{text.relayWarning}</p>}

          {isLoading && <div className="weather-message"><RefreshCw size={20} className="spin" aria-hidden="true" /> {text.loadingForecast}</div>}
          {!isLoading && weatherError && <div className="weather-message weather-error" role="status">{text.forecastUnavailable}</div>}
          {!isLoading && !weatherError && weather && (
            <div className="day-cards" aria-label={text.weather}>
              {forecastDays.slice(0, 2).map((day, index) => {
                const isToday = index === 0
                const DayIcon = isToday ? CurrentIcon : day.Icon
                const conditionKey = isToday ? currentCondition.key : day.key
                const condition = isToday ? currentCondition.label : day.label
                const mainTemp = isToday ? Math.round(weather.current.temperature_2m) : day.high
                const wind = isToday ? Math.round(weather.current.wind_speed_10m) : day.wind
                return (
                  <article className={`day-card${isToday ? ' is-today' : ''}`} key={day.date}>
                    <header className="day-card-head">
                      <span className="day-card-name">{isToday ? text.today : text.tomorrow}</span>
                      <span className="day-card-date">{formatForecastDay(day.date, locale)}</span>
                    </header>
                    <div className="day-card-main">
                      <DayIcon strokeWidth={1.6} className={`day-card-icon wx-${conditionKey}`} aria-hidden="true" />
                      <strong className="day-card-temp">{mainTemp}°</strong>
                      <span className="day-card-condition">{condition}</span>
                    </div>
                    <dl className="day-card-stats">
                      <div title={`${text.high} / ${text.low}`}>
                        <dt><span className="sr-only">{text.high} / {text.low}</span><Thermometer aria-hidden="true" /></dt>
                        <dd>{day.high}°<span className="range-sep">/</span>{day.low}°</dd>
                      </div>
                      <div title={text.rain}>
                        <dt><span className="sr-only">{text.rain}</span><Droplets aria-hidden="true" /></dt>
                        <dd>{day.rain ?? 0}%</dd>
                      </div>
                      <div title={text.wind}>
                        <dt><span className="sr-only">{text.wind}</span><Wind aria-hidden="true" /></dt>
                        <dd>{wind} <span className="unit">{text.windUnit}</span></dd>
                      </div>
                    </dl>
                  </article>
                )
              })}
            </div>
          )}
        </aside>
      </main>

      <footer className="fine-print">
        <span>
          {text.reportSource}: <a href="https://alerts.in.ua/" target="_blank" rel="noreferrer">alerts.in.ua</a> {text.via} {alertFeed.report?.relay ?? 'relay'}
          {' · '}{text.mapAttribution}
          {' · '}{text.forecastBy} <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
          {powerSource && <>{' · '}{text.powerTitle}: {powerSource}</>}
        </span>
        <span>{updatedAt ? `${text.forecastUpdated} ${formatKyivTime(updatedAt, locale)} ${text.kyiv}` : ''}</span>
      </footer>
    </div>
  )
}
