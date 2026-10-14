import type { TFunction } from './core'

// Notifications are stored as English text when they are created, before we
// know which language the recipient reads. Known phrasings are translated when
// they are shown; anything else is displayed as stored.

const SUPPORT_TYPES = ['Equipment training', 'Setup & configuration', 'Fault or repair', 'Supervision during use', 'Other']

const BOOKING_WORDS: Record<string, string> = {
    'approved': 'Booking approved: {item}',
    'not approved': 'Booking not approved: {item}',
    'cancelled by the club': 'Booking cancelled by the club: {item}',
}

export function notificationTitle(title: string, t: TFunction) {
    const booking = title.match(/^Booking (approved|not approved|cancelled by the club): (.+)$/)
    if (booking) return t(BOOKING_WORDS[booking[1]], { item: booking[2] })
    return t(title)
}

export function notificationMessage(message: string, t: TFunction) {
    const rules: [RegExp, (m: RegExpMatchArray) => string][] = [
        [/^Your request for (\S+) was (approved|not approved|cancelled by the club)\.$/, m => t(`Your request for {date} was ${m[2]}.`, { date: m[1] })],
        [/^Feedback was added to "([\s\S]+)"\.$/, m => t('Feedback was added to "{name}".', { name: m[1] })],
        [/^"([\s\S]+)" has a new progress update\.$/, m => t('"{name}" has a new progress update.', { name: m[1] })],
        [/^You were assigned to supervise "([\s\S]+)"\.$/, m => t('You were assigned to supervise "{name}".', { name: m[1] })],
        [/^(.+?) replied in your topic: "([\s\S]*)"$/, m => t('{name} replied in your topic: "{topic}"', { name: m[1], topic: m[2] })],
        [/^(.+?) replied in a thread you commented on: "([\s\S]*)"$/, m => t('{name} replied in a thread you commented on: "{topic}"', { name: m[1], topic: m[2] })],
        [/^(.+?) quoted your reply: "([\s\S]*)"$/, m => t('{name} quoted your reply: "{text}"', { name: m[1], text: m[2] })],
        [/^(.+?) needs (.+?) for (.+)\.$/, m => {
            const support = SUPPORT_TYPES.find(s => s.toLowerCase() === m[2]) || m[2]
            return t('{name} needs {support} for {item}.', { name: m[1], support: t(support), item: m[3] })
        }],
    ]
    for (const [pattern, render] of rules) {
        const match = message.match(pattern)
        if (match) return render(match)
    }
    return message
}
