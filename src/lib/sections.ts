import { query } from './db'
import { RowDataPacket } from './types'

// Projects belong to an academic department, or to the Scientific Club itself
// (stored as projects.departmentId = NULL). Sections are addressed by department
// code in URLs, e.g. /projects/development/se.

export const CLUB_SLUG = 'club'

const SECTION_ICONS: Record<string, string> = {
    FD: 'fa-book-open-reader',
    SE: 'fa-microchip',
    AE: 'fa-plane',
    ME: 'fa-ship',
    CE: 'fa-helmet-safety',
    GE: 'fa-map-location-dot',
}
const SECTION_ORDER = ['FD', 'SE', 'AE', 'ME', 'CE', 'GE']

export interface ProjectSection {
    slug: string
    departmentId: string | null
    name: string
    description: string
    icon: string
}

export async function getProjectSections(): Promise<ProjectSection[]> {
    const departments = await query<RowDataPacket[]>('SELECT id, name, code, description FROM departments')
    const sections: ProjectSection[] = departments
        .map(d => ({
            slug: String(d.code).toLowerCase(),
            departmentId: d.id as string,
            name: String(d.name).replace(/ Department$/, ''),
            description: String(d.description || ''),
            icon: SECTION_ICONS[d.code] || 'fa-building-columns',
            order: SECTION_ORDER.indexOf(d.code) === -1 ? 99 : SECTION_ORDER.indexOf(d.code),
        }))
        .sort((a, b) => a.order - b.order)
        .map(({ order, ...s }) => s)

    sections.push({
        slug: CLUB_SLUG,
        departmentId: null,
        name: 'Scientific Club',
        description: 'Club-wide projects run by the AFAQ Scientific Club',
        icon: 'fa-flask-vial',
    })
    return sections
}

export async function getProjectSection(slug: string): Promise<ProjectSection | undefined> {
    return (await getProjectSections()).find(s => s.slug === slug.toLowerCase())
}
