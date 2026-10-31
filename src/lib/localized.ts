import type { Lang } from '@/i18n/core'

// Content is stored in English in its normal column (title, description, ...) and
// in Arabic in a matching <column>Ar column. Display queries select both, using
// the same naming for aliases (userName / userNameAr), and pass the rows through
// localize(): in Arabic each value is replaced by its Arabic version when one exists,
// so pages render a single language without per-field code. Edit forms should use
// the raw rows instead, so both versions stay editable.
export function localize<T extends object>(rows: T[], lang: Lang): T[] {
    if (lang !== 'ar') return rows
    return rows.map(row => localizeRow(row, lang))
}

export function localizeRow<T extends object>(row: T, lang: Lang): T {
    if (lang !== 'ar' || !row) return row
    const out: Record<string, unknown> = { ...(row as Record<string, unknown>) }
    for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
        if (key.length > 2 && key.endsWith('Ar') && typeof value === 'string' && value.trim()) {
            out[key.slice(0, -2)] = value
        }
    }
    return out as T
}
