// Shared by server and client code. The English text is the key; the Arabic
// dictionary maps it to its translation and anything missing falls back to
// English, so untranslated text never breaks a page.
import ar from './ar'

export type Lang = 'en' | 'ar'
export const LANG_COOKIE = 'afaq_lang'
export const DEFAULT_LANG: Lang = 'en'

export type Vars = Record<string, string | number>
export type TFunction = (text: string, vars?: Vars) => string

export function isLang(value: unknown): value is Lang {
    return value === 'en' || value === 'ar'
}

export function dirOf(lang: Lang) {
    return lang === 'ar' ? 'rtl' : 'ltr'
}

// Dates keep Latin digits in Arabic, as used across the college's documents.
export function localeOf(lang: Lang) {
    return lang === 'ar' ? 'ar-OM-u-nu-latn' : 'en-GB'
}

// Set NEXT_PUBLIC_I18N_DEBUG=1 at build time to log texts with no Arabic translation.
const DEBUG = process.env.NEXT_PUBLIC_I18N_DEBUG === '1'
const reported = new Set<string>()

export function translate(lang: Lang, text: string, vars?: Vars): string {
    if (DEBUG && lang === 'ar' && text && !(text in ar) && !reported.has(text) && /[A-Za-z]/.test(text)) {
        reported.add(text)
        console.warn(`[i18n] missing: ${JSON.stringify(text)}`)
    }
    const template = lang === 'ar' ? ar[text] ?? text : text
    if (!vars) return template
    return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
}

export function makeT(lang: Lang): TFunction {
    return (text, vars) => translate(lang, text, vars)
}

// Formats a stored 'YYYY-MM-DD[ HH:MM...]' value without shifting time zones.
export function formatDay(lang: Lang, value: unknown, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
    const text = String(value || '')
    const [y, m, d] = text.slice(0, 10).split('-').map(Number)
    if (!y || !m || !d) return text
    return new Date(y, m - 1, d).toLocaleDateString(localeOf(lang), options)
}
