'use client'

import { useState, useRef, useEffect, useId } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { globalSearch, SearchResult, SearchType } from '@/actions/search'
import styles from './SearchBar.module.css'
import { useT } from '@/i18n/client'

const TYPE_META: Record<SearchType, { icon: string; label: string }> = {
    project: { icon: 'fa-lightbulb', label: 'Project' },
    event: { icon: 'fa-calendar', label: 'Event' },
    lab: { icon: 'fa-screwdriver-wrench', label: 'Equipment' },
    news: { icon: 'fa-newspaper', label: 'News' },
    research: { icon: 'fa-scroll', label: 'Research' },
    forum: { icon: 'fa-comments', label: 'Forum' },
}

export default function SearchBar() {
    const router = useRouter()
    const t = useT()
    const listId = useId()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [active, setActive] = useState(-1)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const latest = useRef(0)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Debounced search; only the newest request may update the results.
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([])
            setIsOpen(false)
            return
        }

        const id = ++latest.current
        const timer = setTimeout(async () => {
            setLoading(true)
            const found = await globalSearch(query).catch(() => [])
            if (id !== latest.current) return
            setResults(found)
            setActive(-1)
            setLoading(false)
            setIsOpen(true)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const close = () => {
        setIsOpen(false)
        setActive(-1)
    }

    const choose = (result: SearchResult) => {
        close()
        setQuery('')
        router.push(result.href)
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            close()
            return
        }
        if (!isOpen || results.length === 0) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive(i => (i + 1) % results.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive(i => (i <= 0 ? results.length - 1 : i - 1))
        } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault()
            choose(results[active])
        }
    }

    const showEmpty = isOpen && query.trim().length >= 2 && results.length === 0 && !loading

    return (
        <div className={styles.searchWrapper} ref={wrapperRef}>
            <div className={styles.searchBox}>
                <i className={`fa fa-search ${styles.searchIcon}`} aria-hidden="true"></i>
                <input
                    type="search"
                    role="combobox"
                    aria-label={t('Search the portal')}
                    aria-expanded={isOpen && results.length > 0}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                    placeholder={t('Search projects, events, news...')}
                    value={query}
                    maxLength={100}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    onKeyDown={onKeyDown}
                    className={styles.searchInput}
                />
                {loading && <i className={`fa fa-spinner fa-spin ${styles.loadingIcon}`} aria-hidden="true"></i>}
            </div>

            {isOpen && results.length > 0 && (
                <ul className={styles.dropdown} id={listId} role="listbox" aria-label={t('Search results')}>
                    {results.map((result, index) => {
                        const meta = TYPE_META[result.type]
                        return (
                            <li key={`${result.type}-${result.id}`} role="presentation">
                                <Link
                                    href={result.href}
                                    id={`${listId}-${index}`}
                                    role="option"
                                    aria-selected={index === active}
                                    className={`${styles.resultItem} ${index === active ? styles.resultActive : ''}`}
                                    onClick={close}
                                    onMouseEnter={() => setActive(index)}
                                >
                                    <span className={styles.resultIcon} aria-hidden="true">
                                        <i className={`fa ${meta.icon}`}></i>
                                    </span>
                                    <span className={styles.resultContent}>
                                        <span className={styles.resultTitle}>{result.title}</span>
                                        <span className={styles.resultMeta}>
                                            <span className={styles.resultType}>{t(meta.label)}</span>
                                            {result.category && <span className={styles.resultCategory}>{t(result.category)}</span>}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            )}

            {showEmpty && (
                <div className={styles.dropdown} role="status">
                    <div className={styles.noResults}>
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <span>{t('No results found for “{q}”', { q: query.trim() })}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
