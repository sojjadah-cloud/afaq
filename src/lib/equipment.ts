import { query } from './db'
import { RowDataPacket } from './types'
import type { TechnicianResource } from '@/components/TechnicianRequest'
import type { BookingMode } from '@/app/lab-booking/booking-form'

const UNITS: Record<string, [string, string]> = {
    clubWorkshops: ['space', 'spaces'],
    externalWorkshops: ['workshop', 'workshops'],
    labs: ['lab', 'labs'],
    toolBorrowing: ['item', 'items'],
}

export function unitFor(categoryKey: string, count: number) {
    const [one, many] = UNITS[categoryKey] || ['resource', 'resources']
    return `${count} ${count === 1 ? one : many}`
}

export function bookingModeFor(categoryKey: string): BookingMode {
    if (categoryKey === 'toolBorrowing') return 'borrow'
    if (categoryKey === 'externalWorkshops') return 'access'
    return 'book'
}

export const ACTION_LABELS: Record<BookingMode, string> = {
    book: 'Book',
    borrow: 'Request to borrow',
    access: 'Request access',
}

export async function getTechnicianResources(): Promise<TechnicianResource[]> {
    const rows = await query<RowDataPacket[]>(
        `SELECT l.id, l.name, c.label as category FROM labs l
         JOIN lab_categories c ON c.id = l.categoryId
         WHERE l.isBookable = 1
         ORDER BY c.sortOrder, l.name`
    )
    return rows.map(r => ({ id: r.id, name: r.name, category: r.category }))
}
