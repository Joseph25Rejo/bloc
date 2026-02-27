'use client';

import type { Lead } from '../lib/types';

interface StatsBarProps {
    leads: Lead[];
}

const statCards = [
    { key: 'total', label: 'Total Active', icon: '📊', color: 'var(--accent-blue)' },
    { key: 'pending', label: 'Pending', icon: '⏳', color: 'var(--status-pending)' },
    { key: 'calling', label: 'Calling', icon: '📞', color: 'var(--status-calling)' },
    { key: 'no-answer', label: 'No Answer', icon: '📵', color: 'var(--status-no-answer)' },
    { key: 'failed', label: 'Failed', icon: '❌', color: 'var(--status-failed)' },
] as const;

export default function StatsBar({ leads }: StatsBarProps) {
    const counts: Record<string, number> = {
        total: leads.length,
        pending: leads.filter((l) => l.status === 'pending').length,
        calling: leads.filter((l) => l.status === 'calling').length,
        'no-answer': leads.filter((l) => l.status === 'no-answer').length,
        failed: leads.filter((l) => l.status === 'failed').length,
    };

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
                marginBottom: 24,
            }}
        >
            {statCards.map((card) => (
                <div
                    key={card.key}
                    className="glass-card"
                    style={{
                        padding: '20px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: `${card.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                        }}
                    >
                        {card.icon}
                    </div>
                    <div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 12,
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                            }}
                        >
                            {card.label}
                        </p>
                        <p
                            style={{
                                margin: '4px 0 0',
                                fontSize: 28,
                                fontWeight: 700,
                                color: card.color,
                                lineHeight: 1,
                            }}
                        >
                            {counts[card.key]}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
