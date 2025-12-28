
export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export function stripMarkdown(markdown: string): string {
    if (!markdown) return ''

    // Remove images: ![alt](url) -> '' (empty string to hide them) or use alt text? User said "fix images from viewing" essentially implying hiding. 
    // And snippet had ![...](...) text ... 
    // Let's remove images completely for preview.
    let text = markdown.replace(/!\[.*?\]\(.*?\)/g, '')

    // Remove bold/italic: **text** -> text, *text* -> text
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2')
    text = text.replace(/(\*|_)(.*?)\1/g, '$2')

    // Remove links: [text](url) -> text
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')

    // Remove headers: # Header -> Header
    text = text.replace(/^#+\s+/gm, '')

    // Remove blockquotes: > text -> text
    text = text.replace(/^>\s+/gm, '')

    // Remove code blocks: ```code``` -> code (or just remove?)
    // Converting code blocks to plain text might be messy if large. Let's just strip backticks.
    text = text.replace(/`/g, '')

    // Collapse whitespace
    text = text.replace(/\s+/g, ' ').trim()

    // Truncate by words
    const words = text.split(/\s+/)
    if (words.length > 20) {
        return words.slice(0, 20).join(' ') + '...'
    }
    return text
}

export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}
