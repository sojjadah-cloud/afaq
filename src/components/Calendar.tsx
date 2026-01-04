'use client'

import { useState } from 'react'
import styles from './Calendar.module.css'

interface CalendarEvent {
    id: string
    title: string
    date: Date
    type: 'event' | 'booking' | 'deadline'
    color?: string
}

interface CalendarProps {
    events?: CalendarEvent[]
    onDateClick?: (date: Date) => void
}

export default function Calendar({ events = [], onDateClick }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const isToday = (day: number) => {
        const today = new Date()
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
    }

    const getEventsForDay = (day: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.date)
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear()
        })
    }

    const handleDayClick = (day: number) => {
        if (onDateClick) {
            onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
        }
    }

    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)

    const days = []

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className={styles.emptyCell}></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = getEventsForDay(day)
        days.push(
            <div
                key={day}
                className={`${styles.dayCell} ${isToday(day) ? styles.today : ''} ${dayEvents.length > 0 ? styles.hasEvents : ''}`}
                onClick={() => handleDayClick(day)}
            >
                <span className={styles.dayNumber}>{day}</span>
                {dayEvents.length > 0 && (
                    <div className={styles.eventDots}>
                        {dayEvents.slice(0, 3).map((event, i) => (
                            <span
                                key={i}
                                className={styles.eventDot}
                                style={{ background: event.color || '#3b82f6' }}
                                title={event.title}
                            ></span>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={styles.calendar}>
            <div className={styles.header}>
                <button onClick={handlePrevMonth} className={styles.navBtn}>
                    <i className="fa fa-chevron-left"></i>
                </button>
                <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button onClick={handleNextMonth} className={styles.navBtn}>
                    <i className="fa fa-chevron-right"></i>
                </button>
            </div>

            <div className={styles.weekdays}>
                {daysOfWeek.map(day => (
                    <div key={day} className={styles.weekday}>{day}</div>
                ))}
            </div>

            <div className={styles.daysGrid}>
                {days}
            </div>
        </div>
    )
}
