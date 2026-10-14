'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setLanguage } from '@/actions/language'
import { useLang } from '@/i18n/client'

// Shows the other language's name in that language, so it is recognisable to
// someone who cannot read the current one.
export default function LanguageSwitch({ className }: { className?: string }) {
    const lang = useLang()
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const next = lang === 'ar' ? 'en' : 'ar'

    return (
        <button
            type="button"
            className={className}
            lang={next}
            disabled={pending}
            aria-label={next === 'ar' ? 'التبديل إلى العربية' : 'Switch to English'}
            onClick={() => startTransition(async () => {
                await setLanguage(next)
                router.refresh()
            })}
        >
            <i className="fa-solid fa-language" aria-hidden="true"></i>
            <span>{next === 'ar' ? 'العربية' : 'English'}</span>
        </button>
    )
}
