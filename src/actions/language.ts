'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { LANG_COOKIE, isLang } from '@/i18n/core'

export async function setLanguage(lang: string) {
    if (!isLang(lang)) return { error: 'Unsupported language' }
    ;(await cookies()).set(LANG_COOKIE, lang, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    })
    revalidatePath('/', 'layout')
    return { success: true }
}
