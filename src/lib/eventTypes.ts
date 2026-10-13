export const EVENT_TYPES = {
    CLUB: {
        label: 'Scientific Club',
        description: 'Workshops, competitions and exhibitions run by the AFAQ Scientific Club.',
        color: '#938029',
        bg: '#f7f3e1',
        icon: 'fa-flask-vial',
    },
    STUDENT_ACTIVITY: {
        label: 'Student Activities',
        description: 'College-wide student activities, fairs and community events.',
        color: '#2563eb',
        bg: '#e8efff',
        icon: 'fa-people-group',
    },
    EXTERNAL: {
        label: 'Omani Universities & Colleges',
        description: 'Scientific events hosted by universities and colleges across Oman.',
        color: '#059669',
        bg: '#e3f6ee',
        icon: 'fa-building-columns',
    },
    CONFERENCE: {
        label: 'Conferences',
        description: 'Academic and industry conferences open to club members.',
        color: '#9333ea',
        bg: '#f3e8ff',
        icon: 'fa-microphone-lines',
    },
} as const

export type EventType = keyof typeof EVENT_TYPES

export const EVENT_TYPE_KEYS = Object.keys(EVENT_TYPES) as EventType[]

export function eventTypeOf(value: unknown): EventType {
    return EVENT_TYPE_KEYS.includes(value as EventType) ? (value as EventType) : 'CLUB'
}
