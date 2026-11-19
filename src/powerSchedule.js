// Power outage schedule for one preconfigured DTEK queue (Kyiv city).
//
// Sources, tried in order:
// 1. outage-data-ua: a community mirror of the DTEK Kyiv site data on GitHub (CORS-enabled, refreshed several times an hour).
//    Hourly states per group ("GPV27.1"): yes | no | first | second | maybe | mfirst | msecond.
// 2. YASNO public API (DTEK's supplier) through the Jina relay, because it sends no CORS headers.
//    Slots in minutes from local midnight with types NotPlanned | Definite (| Possible).
// Both are normalized to { today, tomorrow } where each day is { date, status, segments: [{ start, end, state }] },
// minutes 0–1440 Kyiv time, state 'on' | 'off' | 'maybe'.

export const POWER_QUEUE = '27.1'

const GITHUB_URL = 'https://raw.githubusercontent.com/Baskerville42/outage-data-ua/main/data/kyiv.json'
const YASNO_URL = 'https://app.yasno.ua/api/blackout-service/public/shutdowns/regions/25/dsos/902/planned-outages'

export const POWER_SOURCES = [
  { name: 'outage-data-ua', load: loadGithub },
  { name: 'YASNO', load: loadYasno },
]

export function kyivDate(date = new Date(), offsetDays = 0) {
  const shifted = new Date(date.getTime() + offsetDays * 86_400_000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit' }).format(shifted)
}

export function kyivMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date)
  const get = (type) => Number(parts.find((part) => part.type === type).value)
  return get('hour') * 60 + get('minute')
}

export function formatMinutes(minutes) {
  const value = minutes % 1440
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}

function mergeSegments(segments) {
  return segments.reduce((merged, segment) => {
    const last = merged.at(-1)
    if (last && last.state === segment.state && last.end === segment.start) last.end = segment.end
    else merged.push({ ...segment })
    return merged
  }, [])
}

const HALF_HOURS = {
  yes: ['on', 'on'],
  no: ['off', 'off'],
  first: ['off', 'on'],
  second: ['on', 'off'],
  maybe: ['maybe', 'maybe'],
  mfirst: ['maybe', 'on'],
  msecond: ['on', 'maybe'],
}

function githubDay(hours) {
  if (!hours) return null
  const segments = []
  for (let hour = 1; hour <= 24; hour++) {
    const halves = HALF_HOURS[hours[hour]]
    if (!halves) return null
    halves.forEach((state, half) => {
      const start = (hour - 1) * 60 + half * 30
      segments.push({ start, end: start + 30, state })
    })
  }
  const merged = mergeSegments(segments)
  return { status: merged.every((segment) => segment.state === 'on') ? 'NoShutdowns' : 'ScheduleApplies', segments: merged }
}

async function loadGithub(signal) {
  const response = await fetch(GITHUB_URL, { signal, cache: 'no-store' })
  if (!response.ok) throw new Error(`outage-data-ua returned ${response.status}.`)
  const data = await response.json()
  const days = {}
  for (const [timestamp, groups] of Object.entries(data.fact?.data ?? {})) {
    const day = githubDay(groups[`GPV${POWER_QUEUE}`])
    if (day) days[kyivDate(new Date(Number(timestamp) * 1000))] = day
  }
  const today = kyivDate()
  const tomorrow = kyivDate(new Date(), 1)
  if (!days[today]) throw new Error('outage-data-ua has no schedule for today.')
  return {
    today: { date: today, ...days[today] },
    tomorrow: days[tomorrow] ? { date: tomorrow, ...days[tomorrow] } : { date: tomorrow, status: 'WaitingForSchedule', segments: [] },
    updatedAt: data.lastUpdated ? new Date(data.lastUpdated) : null,
  }
}

const YASNO_STATES = { NotPlanned: 'on', Definite: 'off' }

function yasnoDay(day) {
  const segments = mergeSegments((day?.slots ?? []).map((slot) => ({ start: slot.start, end: slot.end, state: YASNO_STATES[slot.type] ?? 'maybe' })))
  const status = day?.status ?? 'WaitingForSchedule'
  return {
    date: (day?.date ?? '').slice(0, 10),
    status,
    segments: status === 'NoShutdowns' && segments.length === 0 ? [{ start: 0, end: 1440, state: 'on' }] : segments,
  }
}

async function loadYasno(signal) {
  // Jina wraps the body in a text preamble ("Title:", "Markdown Content:"); the JSON starts at the first brace.
  const response = await fetch(`https://r.jina.ai/${YASNO_URL}`, { signal })
  if (!response.ok) throw new Error(`YASNO relay returned ${response.status}.`)
  const body = await response.text()
  const data = JSON.parse(body.slice(body.indexOf('{')))
  const queue = data[POWER_QUEUE]
  if (!queue) throw new Error(`YASNO has no queue ${POWER_QUEUE}.`)
  const today = yasnoDay(queue.today)
  if (today.date !== kyivDate()) throw new Error('YASNO schedule is not for today.')
  return { today, tomorrow: yasnoDay(queue.tomorrow), updatedAt: queue.updatedOn ? new Date(queue.updatedOn) : null }
}

// Current state and the minute it changes, looking into tomorrow when the current segment runs to midnight.
export function currentPowerState(schedule, nowMinutes) {
  const segment = schedule.today.segments.find((item) => item.start <= nowMinutes && nowMinutes < item.end)
  if (!segment) return null
  let until = segment.end
  if (until === 1440) {
    const next = schedule.tomorrow.segments[0]
    if (next?.state === segment.state) until = 1440 + next.end
  }
  return { state: segment.state, until }
}
