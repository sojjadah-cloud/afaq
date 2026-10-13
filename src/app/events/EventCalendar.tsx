'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './calendar.module.css'
import { EVENT_TYPES, EVENT_TYPE_KEYS, EventType, eventTypeOf } from '@/lib/eventTypes'

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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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

function formatRange(e: CalendarEventItem) {
    const fmt = (v: string) => {
        const [y, m, d] = dayKey(v).split('-').map(Number)
        return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`
    }
    const start = fmt(e.startDate)
    const end = e.endDate && dayKey(e.endDate) !== dayKey(e.startDate) ? fmt(e.endDate) : null
    const time = timeOf(e.startDate)
    return end ? `${start} – ${end}` : `${start}${time && time !== '00:00' ? ` · ${time}` : ''}`
}

export default function EventCalendar({ events, today }: { events: CalendarEventItem[]; today: string }) {
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

    const upcomingCounts = EVENT_TYPE_KEYS.reduce((acc, t) => {
        acc[t] = events.filter(e => eventTypeOf(e.eventType) === t && dayKey(e.endDate || e.startDate) >= today).length
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
    const toggleType = (t: EventType) =>
        setHidden(h => (h.includes(t) ? h.filter(x => x !== t) : [...h, t]))

    return (
        <div className={styles.wrapper}>
            <section className={styles.legend} aria-label="Event types">
                {EVENT_TYPE_KEYS.map(t => {
                    const meta = EVENT_TYPES[t]
                    const off = hidden.includes(t)
                    return (
                        <button
                            key={t}
                            type="button"
                            className={`${styles.legendItem} ${off ? styles.legendOff : ''}`}
                            style={{ borderColor: off ? undefined : meta.color }}
                            onClick={() => toggleType(t)}
                            aria-pressed={!off}
                            title={off ? `Show ${meta.label}` : `Hide ${meta.label}`}
                        >
                            <span className={styles.legendIcon} style={{ color: meta.color, background: meta.bg }}>
                                <i className={`fa-solid ${meta.icon}`}></i>
                            </span>
                            <span className={styles.legendText}>
                                <strong>{meta.label}</strong>
                                <small>{meta.description}</small>
                            </span>
                            <span className={styles.legendCount} style={{ color: meta.color }}>
                                {upcomingCounts[t]}
                                <small>upcoming</small>
                            </span>
                        </button>
                    )
                })}
            </section>

            <section className={styles.calendar}>
                <div className={styles.toolbar}>
                    <button type="button" className={styles.navBtn} onClick={() => shiftMonth(-1)} aria-label="Previous month">
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <h3>{MONTHS[month]} {year}</h3>
                    <button type="button" className={styles.navBtn} onClick={() => shiftMonth(1)} aria-label="Next month">
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                    <button type="button" className={styles.todayBtn} onClick={goToday}>Today</button>
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
                                aria-label={`${day} ${MONTHS[month]}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}`}
                            >
                                <span className={styles.dayNumber}>{day}</span>
                                <span className={styles.chips}>
                                    {dayEvents.slice(0, 2).map(e => {
                                        const meta = EVENT_TYPES[eventTypeOf(e.eventType)]
                                        return (
                                            <span key={e.id} className={styles.chip} style={{ background: meta.bg, color: meta.color, borderLeftColor: meta.color }}>
                                                {e.title}
                                            </span>
                                        )
                                    })}
                                    {dayEvents.length > 2 && <span className={styles.more}>+{dayEvents.length - 2} more</span>}
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
                            ? `Events on ${Number(selectedDay.slice(8))} ${MONTHS[Number(selectedDay.slice(5, 7)) - 1]}`
                            : `Events in ${MONTHS[month]} ${year}`}
                    </h3>
                    {selectedDay && (
                        <button type="button" className={styles.clearBtn} onClick={() => setSelectedDay(null)}>
                            Show whole month
                        </button>
                    )}
                </div>

                {agenda.length === 0 ? (
                    <p className={styles.emptyAgenda}>No events {selectedDay ? 'on this day' : 'this month'}.</p>
                ) : (
                    <div className={styles.agendaList}>
                        {agenda.map(e => {
                            const meta = EVENT_TYPES[eventTypeOf(e.eventType)]
                            const [, m, d] = dayKey(e.startDate).split('-').map(Number)
                            const isPast = dayKey(e.endDate || e.startDate) < today
                            return (
                                <Link key={e.id} href={`/events/${e.id}`} className={`${styles.agendaItem} ${isPast ? styles.agendaPast : ''}`} style={{ borderLeftColor: meta.color }}>
                                    <div className={styles.agendaDate} style={{ background: meta.color }}>
                                        <span>{d}</span>
                                        <small>{MONTHS[m - 1].slice(0, 3)}</small>
                                    </div>
                                    <div className={styles.agendaBody}>
                                        <div className={styles.agendaTags}>
                                            <span className={styles.typeBadge} style={{ color: meta.color, background: meta.bg }}>
                                                <i className={`fa-solid ${meta.icon}`}></i> {meta.label}
                                            </span>
                                            <span className={styles.categoryBadge}>{e.category}</span>
                                            {isPast && <span className={styles.categoryBadge}>Past</span>}
                                        </div>
                                        <h4>{e.title}</h4>
                                        <div className={styles.agendaMeta}>
                                            <span><i className="fa-regular fa-clock"></i> {formatRange(e)}</span>
                                            {e.location && <span><i className="fa-solid fa-location-dot"></i> {e.location}</span>}
                                            <span><i className="fa-solid fa-users"></i> {e.registrationCount} registered</span>
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
