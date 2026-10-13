import Link from 'next/link'
import styles from './page.module.css'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import JoinClub from './JoinClub'

export const dynamic = 'force-dynamic'

const TRACKS = [
    { key: 'Cybersecurity', label: 'Cybersecurity', icon: 'fa-shield-halved' },
    { key: 'IoT', label: 'Internet of Things', icon: 'fa-wifi' },
    { key: 'AI', label: 'Artificial Intelligence', icon: 'fa-brain' },
    { key: 'Robotics', label: 'Robotics', icon: 'fa-robot' },
    { key: 'Sustainability', label: 'Sustainability', icon: 'fa-leaf' },
    { key: 'Smart Logistics', label: 'Smart Logistics', icon: 'fa-truck-fast' },
]

const PORTAL_LINKS = [
    { href: '/projects', icon: 'fa-lightbulb', title: 'Innovation Projects', desc: 'From first idea to finished prototype' },
    { href: '/research', icon: 'fa-flask', title: 'Research Hub', desc: 'Publications, theses and ongoing work' },
    { href: '/equipment', icon: 'fa-gears', title: 'Labs & Equipment', desc: 'Browse and book club facilities' },
    { href: '/events', icon: 'fa-calendar-days', title: 'Events', desc: 'Workshops, competitions and seminars' },
    { href: '/forums', icon: 'fa-comments', title: 'Forums', desc: 'Ask, share and collaborate' },
    { href: '/news', icon: 'fa-newspaper', title: 'News & Achievements', desc: 'Club milestones and announcements' },
]

const STATUS_LABELS: Record<string, string> = {
    START: 'Start',
    DEVELOPMENT: 'In Development',
    COMPLETED: 'Completed',
}

async function count(sql: string): Promise<number> {
    try {
        const rows = await query<RowDataPacket[]>(sql)
        return Number(rows[0]?.count) || 0
    } catch {
        return 0
    }
}

function excerpt(text: string, max = 120) {
    const plain = String(text || '').split('\n')[0].replace(/[*_#`>\[\]]/g, '').trim()
    if (plain.length <= max) return plain
    return plain.slice(0, plain.lastIndexOf(' ', max)) + '…'
}

function formatDate(value: string | null, opts: Intl.DateTimeFormatOptions) {
    if (!value) return ''
    const d = new Date(String(value).replace(' ', 'T'))
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', opts)
}

export default async function HomePage() {
    const [members, projects, research, labs] = await Promise.all([
        count('SELECT COUNT(*) as count FROM users'),
        count("SELECT COUNT(*) as count FROM projects WHERE status IN ('START', 'DEVELOPMENT', 'COMPLETED')"),
        count('SELECT COUNT(*) as count FROM research'),
        count('SELECT COUNT(*) as count FROM labs'),
    ])

    const upcomingEvents = await query<RowDataPacket[]>(
        `SELECT id, title, category, startDate, location FROM events
         WHERE startDate >= DATETIME('now')
         ORDER BY startDate ASC LIMIT 3`
    )

    const latestNews = await query<RowDataPacket[]>(
        `SELECT id, title, summary, type, eventDate FROM club_news
         ORDER BY eventDate DESC, createdAt DESC LIMIT 3`
    )

    const featuredProjects = await query<RowDataPacket[]>(
        `SELECT id, title, description, category, status, progress FROM projects
         WHERE status IN ('DEVELOPMENT', 'COMPLETED')
         ORDER BY updatedAt DESC LIMIT 3`
    )

    const trackRows = await query<RowDataPacket[]>(
        `SELECT category, COUNT(*) as count FROM projects
         WHERE status IN ('START', 'DEVELOPMENT', 'COMPLETED')
         GROUP BY category`
    )
    const trackCounts = Object.fromEntries(trackRows.map(r => [r.category, Number(r.count)]))

    const departmentRows = await query<RowDataPacket[]>('SELECT name FROM departments ORDER BY name')
    const departments = departmentRows.map(d => String(d.name).replace(/ Department$/, ''))

    const stats = [
        { label: 'Members', value: members, icon: 'fa-users' },
        { label: 'Projects', value: projects, icon: 'fa-lightbulb' },
        { label: 'Research Outputs', value: research, icon: 'fa-book-open' },
        { label: 'Labs & Equipment', value: labs, icon: 'fa-microscope' },
    ]

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <span className={styles.heroEyebrow}>Military Technological College · Scientific Club</span>
                    <h1>AFAQ Innovation Portal</h1>
                    <p className={styles.visionStatement}>
                        &ldquo;A strategic start for AFAQ members to connect, collaborate, and transform ideas into innovation impact.&rdquo;
                    </p>
                    <div className={styles.heroActions}>
                        <Link href="/projects" className={styles.heroPrimary}>
                            <i className="fa-solid fa-rocket"></i> Explore Projects
                        </Link>
                        <Link href="/lab-booking" className={styles.heroSecondary}>
                            <i className="fa-solid fa-calendar-plus"></i> Book a Lab
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.statsStrip}>
                {stats.map(s => (
                    <div key={s.label} className={styles.statTile}>
                        <i className={`fa-solid ${s.icon}`}></i>
                        <div>
                            <div className={styles.statNumber}>{s.value}</div>
                            <div className={styles.statText}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </section>

            <section className={styles.block}>
                <div className={styles.blockHeader}>
                    <h2>Explore the Portal</h2>
                </div>
                <div className={styles.portalGrid}>
                    {PORTAL_LINKS.map(link => (
                        <Link key={link.href} href={link.href} className={styles.portalCard}>
                            <div className={styles.portalIcon}><i className={`fa-solid ${link.icon}`}></i></div>
                            <div>
                                <div className={styles.portalTitle}>{link.title}</div>
                                <div className={styles.portalDesc}>{link.desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className={`${styles.block} ${styles.twoCol}`}>
                <div className={styles.panel}>
                    <div className={styles.blockHeader}>
                        <h2>Upcoming Events</h2>
                        <Link href="/events" className={styles.seeAll}>All events <i className="fa-solid fa-arrow-right"></i></Link>
                    </div>
                    {upcomingEvents.length === 0 ? (
                        <p className={styles.emptyText}>No upcoming events scheduled.</p>
                    ) : (
                        <ul className={styles.eventList}>
                            {upcomingEvents.map(e => (
                                <li key={e.id}>
                                    <Link href={`/events/${e.id}`} className={styles.eventItem}>
                                        <div className={styles.dateBadge}>
                                            <span>{formatDate(e.startDate, { day: '2-digit' })}</span>
                                            <small>{formatDate(e.startDate, { month: 'short' })}</small>
                                        </div>
                                        <div className={styles.eventInfo}>
                                            <div className={styles.eventTitle}>{e.title}</div>
                                            <div className={styles.eventMeta}>
                                                <span className={styles.tag}>{e.category}</span>
                                                {e.location && <span><i className="fa-solid fa-location-dot"></i> {e.location}</span>}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className={styles.panel}>
                    <div className={styles.blockHeader}>
                        <h2>News &amp; Achievements</h2>
                        <Link href="/news" className={styles.seeAll}>All news <i className="fa-solid fa-arrow-right"></i></Link>
                    </div>
                    {latestNews.length === 0 ? (
                        <p className={styles.emptyText}>No news yet.</p>
                    ) : (
                        <ul className={styles.newsList}>
                            {latestNews.map(n => (
                                <li key={n.id}>
                                    <Link href={`/news/${n.type === 'ACHIEVEMENT' ? 'achievement' : 'news'}`} className={styles.newsItem}>
                                        <span className={`${styles.newsIcon} ${n.type === 'ACHIEVEMENT' ? styles.newsIconGold : ''}`}>
                                            <i className={`fa-solid ${n.type === 'ACHIEVEMENT' ? 'fa-trophy' : 'fa-newspaper'}`}></i>
                                        </span>
                                        <div>
                                            <div className={styles.newsTitle}>{n.title}</div>
                                            <div className={styles.newsDate}>{formatDate(n.eventDate, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section className={styles.block}>
                <div className={styles.blockHeader}>
                    <h2>Featured Projects</h2>
                    <Link href="/projects" className={styles.seeAll}>All projects <i className="fa-solid fa-arrow-right"></i></Link>
                </div>
                <div className={styles.projectGrid}>
                    {featuredProjects.map(p => (
                        <Link key={p.id} href={`/projects/${p.id}`} className={styles.projectCard}>
                            <div className={styles.projectTop}>
                                <span className={styles.tag}>{p.category}</span>
                                <span className={`${styles.statusPill} ${p.status === 'COMPLETED' ? styles.statusDone : ''}`}>
                                    {STATUS_LABELS[p.status] || p.status}
                                </span>
                            </div>
                            <h3>{p.title}</h3>
                            <p>{excerpt(p.description)}</p>
                            <div className={styles.progressRow}>
                                <div className={styles.progressBar}>
                                    <div style={{ width: `${Number(p.progress) || 0}%` }}></div>
                                </div>
                                <span>{Number(p.progress) || 0}%</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className={styles.block}>
                <div className={styles.blockHeader}>
                    <h2>Innovation Tracks</h2>
                </div>
                <div className={styles.trackGrid}>
                    {TRACKS.map(t => (
                        <div key={t.key} className={styles.trackCard}>
                            <i className={`fa-solid ${t.icon}`}></i>
                            <div className={styles.trackLabel}>{t.label}</div>
                            <div className={styles.trackCount}>{trackCounts[t.key] || 0} projects</div>
                        </div>
                    ))}
                </div>
            </section>

            <JoinClub departments={departments} />
        </main>
    )
}
