'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './calendar.module.css'
import { EVENT_TYPES, EVENT_TYPE_KEYS, EventType, eventTypeOf } from '@/lib/eventTypes'
import { useLang, useT } from '@/i18n/client'
import { localeOf } from '@/i18n/core'

export interface CalendarEventItem {
    id: string
    title: string
    description: string
    category: string
    eventType: string
    startDate: string
    endDate: string | null
    location: string | null
    registrationCount: number
}

// Month and weekday names come from Intl so they follow the visitor's language.
function calendarNames(locale: string) {
    const months = Array.from({ length: 12 }, (_, m) => new Date(2026, m, 1).toLocaleDateString(locale, { month: 'long' }))
    const monthsShort = Array.from({ length: 12 }, (_, m) => new Date(2026, m, 1).toLocaleDateString(locale, { month: 'short' }))
    // 4 January 2026 was a Sunday.
    const weekdays = Array.from({ length: 7 }, (_, d) => new Date(2026, 0, 4 + d).toLocaleDateString(locale, { weekday: 'short' }))
    return { months, monthsShort, weekdays }
}

// Dates are stored as local wall-clock strings ('YYYY-MM-DD HH:MM:SS'), so work
// with the date part directly instead of going through time zones.
const dayKey = (value: string) => String(value).slice(0, 10)
const timeOf = (value: string) => String(value).slice(11, 16)
const keyFor = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

function eachDay(start: string, end: string | null) {
    const days: string[] = []
    const [y, m, d] = dayKey(start).split('-').map(Number)
    const last = end && dayKey(end) > dayKey(start) ? dayKey(end) : dayKey(start)
    const cursor = new Date(y, m - 1, d)
    for (let i = 0; i < 60; i++) {
        const key = keyFor(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())
        days.push(key)
        if (key >= last) break
        cursor.setDate(cursor.getDate() + 1)
    }
    return days
}

function formatRange(e: CalendarEventItem, monthsShort: string[]) {
    const fmt = (v: string) => {
        const [y, m, d] = dayKey(v).split('-').map(Number)
        return `${d} ${monthsShort[m - 1]} ${y}`
    }
    const start = fmt(e.startDate)
    const end = e.endDate && dayKey(e.endDate) !== dayKey(e.startDate) ? fmt(e.endDate) : null
    const time = timeOf(e.startDate)
    return end ? `${start} – ${end}` : `${start}${time && time !== '00:00' ? ` · ${time}` : ''}`
}

export default function EventCalendar({ events, today }: { events: CalendarEventItem[]; today: string }) {
    const t = useT()
    const lang = useLang()
    const { months: MONTHS, monthsShort, weekdays: WEEKDAYS } = useMemo(() => calendarNames(localeOf(lang)), [lang])
    const [ty, tm] = today.split('-').map(Number)
    const [year, setYear] = useState(ty)
    const [month, setMonth] = useState(tm - 1)
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [hidden, setHidden] = useState<EventType[]>([])

    const visible = useMemo(() => events.filter(e => !hidden.includes(eventTypeOf(e.eventType))), [events, hidden])

    const byDay = useMemo(() => {
        const map = new Map<string, CalendarEventItem[]>()
        for (const e of visible) {
            for (const day of eachDay(e.startDate, e.endDate)) {
                if (!map.has(day)) map.set(day, [])
                map.get(day)!.push(e)
            }
        }
        return map
    }, [visible])

    const monthPrefix = keyFor(year, month, 1).slice(0, 7)
    const monthEvents = visible
        .filter(e => eachDay(e.startDate, e.endDate).some(d => d.startsWith(monthPrefix)))
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
    const agenda = selectedDay ? byDay.get(selectedDay) || [] : monthEvents

    const upcomingCounts = EVENT_TYPE_KEYS.reduce((acc, type) => {
        acc[type] = events.filter(e => eventTypeOf(e.eventType) === type && dayKey(e.endDate || e.startDate) >= today).length
        return acc
    }, {} as Record<EventType, number>)

    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    while (cells.length % 7 !== 0) cells.push(null)

    const shiftMonth = (delta: number) => {
        const d = new Date(year, month + delta, 1)
        setYear(d.getFullYear())
        setMonth(d.getMonth())
        setSelectedDay(null)
    }
    const goToday = () => {
        setYear(ty)
        setMonth(tm - 1)
        setSelectedDay(null)
    }
    const toggleType = (type: EventType) =>
        setHidden(h => (h.includes(type) ? h.filter(x => x !== type) : [...h, type]))

    return (
        <div className={styles.wrapper}>
            <section className={styles.legend} aria-label={t('Event types')}>
                {EVENT_TYPE_KEYS.map(type => {
                    const meta = EVENT_TYPES[type]
                    const off = hidden.includes(type)
                    return (
                        <button
                            key={type}
                            type="button"
                            className={`${styles.legendItem} ${off ? styles.legendOff : ''}`}
                            style={{ borderColor: off ? undefined : meta.color }}
                            onClick={() => toggleType(type)}
                            aria-pressed={!off}
                            title={off ? t('Show {name}', { name: t(meta.label) }) : t('Hide {name}', { name: t(meta.label) })}
                        >
                            <span className={styles.legendIcon} style={{ color: meta.color, background: meta.bg }} aria-hidden="true">
                                <i className={`fa-solid ${meta.icon}`}></i>
                            </span>
                            <span className={styles.legendText}>
                                <strong>{t(meta.label)}</strong>
                                <small>{t(meta.description)}</small>
                            </span>
                            <span className={styles.legendCount} style={{ color: meta.color }}>
                                {upcomingCounts[type]}
                                <small>{t('upcoming')}</small>
                            </span>
                        </button>
                    )
                })}
            </section>

            <section className={styles.calendar}>
                <div className={styles.toolbar}>
                    <button type="button" className={styles.navBtn} onClick={() => shiftMonth(-1)} aria-label={t('Previous month')}>
                        <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
                    </button>
                    <h3>{MONTHS[month]} {year}</h3>
                    <button type="button" className={styles.navBtn} onClick={() => shiftMonth(1)} aria-label={t('Next month')}>
                        <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                    </button>
                    <button type="button" className={styles.todayBtn} onClick={goToday}>{t('Today')}</button>
                </div>

                <div className={styles.grid}>
                    {WEEKDAYS.map(d => <div key={d} className={styles.weekday}>{d}</div>)}
                    {cells.map((day, i) => {
                        if (day === null) return <div key={`e${i}`} className={styles.emptyCell}></div>
                        const key = keyFor(year, month, day)
                        const dayEvents = byDay.get(key) || []
                        const classes = [
                            styles.dayCell,
                            key === today ? styles.today : '',
                            key === selectedDay ? styles.selected : '',
                            dayEvents.length ? styles.hasEvents : '',
                            key < today ? styles.past : '',
                        ].join(' ')
                        return (
                            <button
                                key={key}
                                type="button"
                                className={classes}
                                onClick={() => setSelectedDay(key === selectedDay ? null : key)}
                                aria-label={`${day} ${MONTHS[month]}${dayEvents.length ? `, ${t('{n} events', { n: dayEvents.length })}` : ''}`}
                                aria-pressed={key === selectedDay}
                            >
                                <span className={styles.dayNumber}>{day}</span>
                                <span className={styles.chips}>
                                    {dayEvents.slice(0, 2).map(e => {
                                        const meta = EVENT_TYPES[eventTypeOf(e.eventType)]
                                        return (
                                            <span key={e.id} className={styles.chip} style={{ background: meta.bg, color: meta.color, borderInlineStartColor: meta.color }}>
                                                {e.title}
                                            </span>
                                        )
                                    })}
                                    {dayEvents.length > 2 && <span className={styles.more}>{t('+{n} more', { n: dayEvents.length - 2 })}</span>}
                                </span>
                                <span className={styles.dots}>
                                    {dayEvents.slice(0, 3).map(e => (
                                        <span key={e.id} style={{ background: EVENT_TYPES[eventTypeOf(e.eventType)].color }}></span>
                                    ))}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </section>

            <section className={styles.agenda}>
                <div className={styles.agendaHeader}>
                    <h3>
                        {selectedDay
                            ? t('Events on {date}', { date: `${Number(selectedDay.slice(8))} ${MONTHS[Number(selectedDay.slice(5, 7)) - 1]}` })
                            : t('Events in {month}', { month: `${MONTHS[month]} ${year}` })}
                    </h3>
                    {selectedDay && (
                        <button type="button" className={styles.clearBtn} onClick={() => setSelectedDay(null)}>
                            {t('Show whole month')}
                        </button>
                    )}
                </div>

                {agenda.length === 0 ? (
                    <p className={styles.emptyAgenda}>{selectedDay ? t('No events on this day.') : t('No events this month.')}</p>
                ) : (
                    <div className={styles.agendaList}>
                        {agenda.map(e => {
                            const meta = EVENT_TYPES[eventTypeOf(e.eventType)]
                            const [, m, d] = dayKey(e.startDate).split('-').map(Number)
                            const isPast = dayKey(e.endDate || e.startDate) < today
                            return (
                                <Link key={e.id} href={`/events/${e.id}`} className={`${styles.agendaItem} ${isPast ? styles.agendaPast : ''}`} style={{ borderInlineStartColor: meta.color }}>
                                    <div className={styles.agendaDate} style={{ background: meta.color }}>
                                        <span>{d}</span>
                                        <small>{monthsShort[m - 1]}</small>
                                    </div>
                                    <div className={styles.agendaBody}>
                                        <div className={styles.agendaTags}>
                                            <span className={styles.typeBadge} style={{ color: meta.color, background: meta.bg }}>
                                                <i className={`fa-solid ${meta.icon}`} aria-hidden="true"></i> {t(meta.label)}
                                            </span>
                                            <span className={styles.categoryBadge}>{t(e.category)}</span>
                                            {isPast && <span className={styles.categoryBadge}>{t('Past')}</span>}
                                        </div>
                                        <h4>{e.title}</h4>
                                        <div className={styles.agendaMeta}>
                                            <span><i className="fa-regular fa-clock" aria-hidden="true"></i> {formatRange(e, monthsShort)}</span>
                                            {e.location && <span><i className="fa-solid fa-location-dot" aria-hidden="true"></i> {e.location}</span>}
                                            <span><i className="fa-solid fa-users" aria-hidden="true"></i> {t('{n} registered', { n: e.registrationCount })}</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
