'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { DEFAULT_LANG, Lang, TFunction, formatDay, makeT } from './core'

const LangContext = createContext<Lang>(DEFAULT_LANG)

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
    return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}

export function useLang(): Lang {
    return useContext(LangContext)
}

export function useT(): TFunction {
    const lang = useLang()
    return useMemo(() => makeT(lang), [lang])
}

export function useFormatDay() {
    const lang = useLang()
    return (value: unknown, options?: Intl.DateTimeFormatOptions) => formatDay(lang, value, options)
}
