'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { globalSearch } from '@/actions/search'
import styles from './SearchBar.module.css'

interface SearchResult {
    type: 'project' | 'research' | 'event' | 'lab'
    id: string
    title: string
    description: string
    category?: string
}

export default function SearchBar() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

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

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            const searchResults = await globalSearch(query)
            setResults(searchResults)
            setLoading(false)
            setIsOpen(true)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleResultClick = (result: SearchResult) => {
        setIsOpen(false)
        setQuery('')

        switch (result.type) {
            case 'project':
                router.push(`/projects/${result.id}`)
                break
            case 'research':
                router.push(`/research`)
                break
            case 'event':
                router.push(`/events/${result.id}`)
                break
            case 'lab':
                router.push(`/equipment`)
                break
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'project': return 'fa-lightbulb'
            case 'research': return 'fa-scroll'
            case 'event': return 'fa-calendar'
            case 'lab': return 'fa-flask'
            default: return 'fa-search'
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'project': return 'Project'
            case 'research': return 'Research'
            case 'event': return 'Event'
            case 'lab': return 'Lab/Equipment'
            default: return type
        }
    }

    return (
        <div className={styles.searchWrapper} ref={wrapperRef}>
            <div className={styles.searchBox}>
                <i className={`fa fa-search ${styles.searchIcon}`}></i>
                <input
                    type="text"
                    placeholder="Search projects, research, events..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    className={styles.searchInput}
                />
                {loading && <i className={`fa fa-spinner fa-spin ${styles.loadingIcon}`}></i>}
            </div>

            {isOpen && results.length > 0 && (
                <div className={styles.dropdown}>
                    {results.map((result, index) => (
                        <div
                            key={`${result.type}-${result.id}-${index}`}
                            className={styles.resultItem}
                            onClick={() => handleResultClick(result)}
                        >
                            <div className={styles.resultIcon}>
                                <i className={`fa ${getTypeIcon(result.type)}`}></i>
                            </div>
                            <div className={styles.resultContent}>
                                <div className={styles.resultTitle}>{result.title}</div>
                                <div className={styles.resultMeta}>
                                    <span className={styles.resultType}>{getTypeLabel(result.type)}</span>
                                    {result.category && (
                                        <span className={styles.resultCategory}>{result.category}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isOpen && query.length >= 2 && results.length === 0 && !loading && (
                <div className={styles.dropdown}>
                    <div className={styles.noResults}>
                        <i className="fa fa-search"></i>
                        <span>No results found for "{query}"</span>
                    </div>
                </div>
            )}
        </div>
    )
}
