'use client';

import type { Caller } from '../lib/types';

interface CallerCardProps {
    caller: Caller;
    onEdit: (caller: Caller) => void;
    onDelete: (callerId: string) => void;
}

export default function CallerCard({ caller, onEdit, onDelete }: CallerCardProps) {
    const atLimit =
        caller.dailyLimit > 0 && caller.todayAssignedCount >= caller.dailyLimit;

    function formatTime(dateStr: string | null) {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <div
            className="glass-card"
            style={{
                padding: 24,
                opacity: atLimit ? 0.6 : 1,
                position: 'relative',
            }}
        >
            {/* Limit badge */}
            {atLimit && (
                <span
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        padding: '3px 10px',
                        borderRadius: 9999,
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--status-failed)',
                        background: 'var(--status-failed-bg)',
                        border: '1px solid var(--status-failed)33',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                >
                    Limit Reached
                </span>
            )}

            {/* Name & Role */}
            <h4
                style={{
                    margin: '0 0 2px',
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                }}
            >
                {caller.name}
            </h4>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
                {caller.role || 'Agent'}
            </p>

            {/* Languages */}
            {caller.languages.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                    <p style={labelStyle}>Languages</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {caller.languages.map((lang) => (
                            <span key={lang} style={chipStyle}>
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Assigned States */}
            {caller.assignedStates.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <p style={labelStyle}>Assigned States</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {caller.assignedStates.map((state) => (
                            <span key={state} style={{ ...chipStyle, background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)33' }}>
                                {state}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats row */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 12,
                    padding: '12px 0',
                    borderTop: '1px solid var(--border-color)',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: 16,
                }}
            >
                <div>
                    <p style={miniLabelStyle}>Daily Limit</p>
                    <p style={miniValueStyle}>{caller.dailyLimit || '∞'}</p>
                </div>
                <div>
                    <p style={miniLabelStyle}>Today</p>
                    <p style={miniValueStyle}>{caller.todayAssignedCount}</p>
                </div>
                <div>
                    <p style={miniLabelStyle}>Last Assigned</p>
                    <p style={{ ...miniValueStyle, fontSize: 11 }}>
                        {formatTime(caller.lastAssignedAt)}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onEdit(caller)} style={editBtnStyle}>
                    Edit
                </button>
                <button onClick={() => onDelete(caller._id)} style={deleteBtnStyle}>
                    Delete
                </button>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    margin: '0 0 6px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const chipStyle: React.CSSProperties = {
    padding: '3px 10px',
    borderRadius: 9999,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
};

const miniLabelStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
};

const miniValueStyle: React.CSSProperties = {
    margin: '4px 0 0',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const editBtnStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s',
};

const deleteBtnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid var(--status-failed)33',
    background: 'var(--status-failed-bg)',
    color: 'var(--status-failed)',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s',
};
