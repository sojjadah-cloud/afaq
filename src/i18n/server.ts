import { cookies } from 'next/headers'
import { DEFAULT_LANG, LANG_COOKIE, Lang, isLang, makeT } from './core'

export async function getLang(): Promise<Lang> {
    const value = (await cookies()).get(LANG_COOKIE)?.value
    return isLang(value) ? value : DEFAULT_LANG
}

export async function getT() {
    const lang = await getLang()
    return { lang, t: makeT(lang) }
}
