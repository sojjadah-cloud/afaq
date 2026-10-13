import { query } from './db'
import { RowDataPacket } from './types'

// Projects belong to an academic department, or to the Scientific Club itself
// (stored as projects.departmentId = NULL). Sections are addressed by department
// code in URLs, e.g. /projects/development/se.

export const CLUB_SLUG = 'club'

const SECTION_META: Record<string, { nameAr: string; icon: string }> = {
    FD: { nameAr: 'قسم الدراسات التأسيسية', icon: 'fa-book-open-reader' },
    SE: { nameAr: 'قسم هندسة النظم', icon: 'fa-microchip' },
    AE: { nameAr: 'قسم هندسة الطيران', icon: 'fa-plane' },
    ME: { nameAr: 'قسم الهندسة البحرية', icon: 'fa-ship' },
    CE: { nameAr: 'قسم الهندسة المدنية', icon: 'fa-helmet-safety' },
    GE: { nameAr: 'قسم هندسة الجيوماتكس', icon: 'fa-map-location-dot' },
}
const SECTION_ORDER = ['FD', 'SE', 'AE', 'ME', 'CE', 'GE']

export interface ProjectSection {
    slug: string
    departmentId: string | null
    name: string
    nameAr: string
    icon: string
}

export async function getProjectSections(): Promise<ProjectSection[]> {
    const departments = await query<RowDataPacket[]>('SELECT id, name, code FROM departments')
    const sections: ProjectSection[] = departments
        .map(d => ({
            slug: String(d.code).toLowerCase(),
            departmentId: d.id as string,
            name: String(d.name).replace(/ Department$/, ''),
            nameAr: SECTION_META[d.code]?.nameAr || '',
            icon: SECTION_META[d.code]?.icon || 'fa-building-columns',
            order: SECTION_ORDER.indexOf(d.code) === -1 ? 99 : SECTION_ORDER.indexOf(d.code),
        }))
        .sort((a, b) => a.order - b.order)
        .map(({ order, ...s }) => s)

    sections.push({ slug: CLUB_SLUG, departmentId: null, name: 'Scientific Club', nameAr: 'قسم النادي العلمي', icon: 'fa-flask-vial' })
    return sections
}

export async function getProjectSection(slug: string): Promise<ProjectSection | undefined> {
    return (await getProjectSections()).find(s => s.slug === slug.toLowerCase())
}
