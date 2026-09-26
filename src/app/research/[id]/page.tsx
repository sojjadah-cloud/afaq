import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

interface Research extends RowDataPacket {
    id: string
    title: string
    abstract: string
    authors: string
    category: string
    publicationDate: string | null
    url: string | null
    createdAt: string
}

export default async function ResearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const results = await query<Research[]>('SELECT * FROM research WHERE id = ?', [id])
    const research = results[0]

    if (!research) notFound()

    return (
        <main className={styles.main}>
            <Link href="/research" className={styles.backLink}>
                <i className="fa fa-arrow-left"></i> Back to Research
            </Link>

            <article className={styles.card}>
                <span className={styles.category}>{research.category}</span>
                <h1 className={styles.title}>{research.title}</h1>

                <div className={styles.metaRow}>
                    <span>
                        <i className="fa fa-users"></i> {research.authors}
                    </span>
                    {research.publicationDate && (
                        <span>
                            <i className="fa fa-calendar"></i>
                            {new Date(research.publicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    )}
                    {research.url && (
                        <a href={research.url} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                            <i className="fa fa-external-link"></i> View Source
                        </a>
                    )}
                </div>

                <div className={styles.divider}></div>

                <div className={styles.abstract}>
                    <h2>Abstract</h2>
                    <MarkdownRenderer content={research.abstract} />
                </div>
            </article>
        </main>
    )
}
