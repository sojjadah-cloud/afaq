export const STAGES = {
    start: {
        title: 'Start Projects',
        desc: 'New ideas and early-stage concepts waiting to take shape.',
        statuses: ['START', 'PENDING_APPROVAL'],
        color: '#C98A12',
        bg: '#fff7e8',
        icon: 'fa-rocket',
    },
    development: {
        title: 'In Development',
        desc: 'Active projects currently being built and tested in our labs.',
        statuses: ['DEVELOPMENT', 'PENDING_COMPLETION'],
        color: '#2F7CD3',
        bg: '#ebf5ff',
        icon: 'fa-diagram-project',
    },
    completed: {
        title: 'Completed Projects',
        desc: 'Finished innovations ready for deployment or exhibition.',
        statuses: ['COMPLETED'],
        color: '#2E9E5B',
        bg: '#eafff3',
        icon: 'fa-circle-check',
    },
} as const

export type StageKey = keyof typeof STAGES

export const STATUS_LABELS: Record<string, string> = {
    START: 'Start',
    PENDING_APPROVAL: 'Awaiting Approval',
    DEVELOPMENT: 'In Development',
    PENDING_COMPLETION: 'Awaiting Completion',
    COMPLETED: 'Completed',
}
