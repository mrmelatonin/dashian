import { useEffect, useState } from 'react'
import { Plug, PlugZap, RefreshCw, Zap, ZapOff } from 'lucide-react'
import { POWER_QUEUE, POWER_SOURCES, currentPowerState, formatMinutes, kyivMinutes } from './powerSchedule'

const HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21, 24]
const STATE_ICONS = { on: Zap, off: ZapOff, maybe: PlugZap }

export default function PowerTimeline({ text, refreshKey, onSource }) {
  const [feed, setFeed] = useState({ schedule: null, status: 'loading' })

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const load = async () => {
      for (const source of POWER_SOURCES) {
        try {
          const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)])
          const schedule = await source.load(signal)
          if (isActive) {
            setFeed({ schedule, status: 'ready' })
            onSource(source.name)
          }
          return
        } catch (error) {
          if (controller.signal.aborted) return
          console.warn(`Power schedule source failed: ${source.name}.`, error)
        }
      }
      // Keep showing the last good schedule if a refresh fails.
      if (isActive) setFeed((previous) => ({ ...previous, status: previous.schedule ? 'ready' : 'error' }))
    }

    void load()
    return () => {
      isActive = false
      controller.abort()
    }
  }, [refreshKey, onSource])

  const now = kyivMinutes()
  const schedule = feed.schedule
  const today = schedule?.today
  const isEmergency = today?.status === 'EmergencyShutdowns'
  const hasTimeline = today && !isEmergency && today.segments.length > 0
  const current = hasTimeline ? currentPowerState(schedule, now) : null

  let headline
  let detail
  let tone = 'neutral'
  if (feed.status === 'loading') headline = text.powerLoading
  else if (!schedule) headline = text.powerUnavailable
  else if (isEmergency) { headline = text.powerEmergency; detail = text.powerEmergencyDetail; tone = 'off' }
  else if (!hasTimeline) { headline = text.powerWaiting }
  else if (current) {
    headline = text.powerStates[current.state]
    detail = `${text.powerUntil} ${formatMinutes(current.until)}`
    tone = current.state
  }
  const StateIcon = STATE_ICONS[tone] ?? Plug

  return (
    <section className="panel power-panel" aria-label={`${text.powerTitle} ${POWER_QUEUE}`}>
      <div className={`power-state is-${tone}`} role="status" aria-live="polite">
        {feed.status === 'loading' ? <RefreshCw className="power-state-icon spin" aria-hidden="true" /> : <StateIcon className="power-state-icon" aria-hidden="true" />}
        <div className="power-state-copy">
          <span className="power-queue">{text.powerQueue} {POWER_QUEUE}</span>
          <strong>{headline}</strong>
          {detail && <span className="power-detail">{detail}</span>}
        </div>
      </div>

      {hasTimeline && (
        <div className="power-timeline">
          <div className="power-bar" role="img" aria-label={today.segments.map((segment) => `${formatMinutes(segment.start)}–${formatMinutes(segment.end)} ${text.powerStates[segment.state]}`).join(', ')}>
            {today.segments.map((segment) => (
              <span
                key={segment.start}
                className={`power-segment is-${segment.state}${segment.start <= now && now < segment.end ? ' is-current' : ''}`}
                style={{ left: `${(segment.start / 1440) * 100}%`, width: `${((segment.end - segment.start) / 1440) * 100}%` }}
              />
            ))}
            <span className="power-now" style={{ left: `${(now / 1440) * 100}%` }} aria-hidden="true" />
          </div>
          <div className="power-hours" aria-hidden="true">
            {HOUR_LABELS.map((hour) => (
              <span key={hour} style={{ left: `${(hour / 24) * 100}%` }}>{String(hour).padStart(2, '0')}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
