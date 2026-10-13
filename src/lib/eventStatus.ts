// Event dates are stored as Oman wall-clock text ('YYYY-MM-DD HH:MM:SS.mmm'),
// so they compare correctly as strings against nowInOman().

export type EventStatus = 'OPEN' | 'CLOSED' | 'FULL' | 'ONGOING' | 'FINISHED'

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
    OPEN: 'Registration open',
    CLOSED: 'Registration closed',
    FULL: 'Fully booked',
    ONGOING: 'Happening now',
    FINISHED: 'Finished',
}

export function minute(value: unknown) {
    return value ? String(value).replace('T', ' ').slice(0, 16) : ''
}

export function eventStatus(
    event: { startDate?: unknown; endDate?: unknown; registrationDeadline?: unknown; capacity?: unknown },
    registered: number,
    now: string
): EventStatus {
    const start = minute(event.startDate)
    // Without an end time, an event runs until the end of its start day.
    const end = minute(event.endDate) || (start ? `${start.slice(0, 10)} 23:59` : '')
    if (end && now > end && now >= start) return 'FINISHED'
    if (start && now >= start) return 'ONGOING'
    const deadline = minute(event.registrationDeadline)
    if (deadline && now > deadline) return 'CLOSED'
    const capacity = Number(event.capacity) || 0
    if (capacity > 0 && registered >= capacity) return 'FULL'
    return 'OPEN'
}
