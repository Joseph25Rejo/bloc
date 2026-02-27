import type { LeadStatus } from '../lib/types';

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string; pulse?: boolean }> = {
    pending: { label: 'Pending', color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
    calling: { label: 'Calling', color: 'var(--status-calling)', bg: 'var(--status-calling-bg)', pulse: true },
    'no-answer': { label: 'No Answer', color: 'var(--status-no-answer)', bg: 'var(--status-no-answer-bg)' },
    failed: { label: 'Failed', color: 'var(--status-failed)', bg: 'var(--status-failed-bg)' },
    completed: { label: 'Completed', color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span
            className={config.pulse ? 'animate-pulse-glow' : ''}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 600,
                color: config.color,
                background: config.bg,
                border: `1px solid ${config.color}22`,
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: config.color,
                    display: 'inline-block',
                }}
            />
            {config.label}
        </span>
    );
}
