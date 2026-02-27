'use client';

import { useState } from 'react';
import type { Lead, LeadStatus } from '../lib/types';
import StatusBadge from './StatusBadge';
import DeleteConfirmModal from './DeleteConfirmModal';
import { updateLeadStatus, deleteLead } from '../lib/api';

interface LeadTableProps {
    leads: Lead[];
    onLeadUpdated: (lead: Lead) => void;
    onLeadRemoved: (leadId: string) => void;
    statusFilter: string;
    callerFilter: string;
}

const statusOptions: { value: LeadStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'calling', label: 'Calling' },
    { value: 'no-answer', label: 'No Answer' },
    { value: 'failed', label: 'Failed' },
    { value: 'completed', label: 'Completed' },
];

export default function LeadTable({ leads, onLeadUpdated, onLeadRemoved, statusFilter, callerFilter }: LeadTableProps) {
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const filtered = leads.filter((l) => {
        if (statusFilter && l.status !== statusFilter) return false;
        if (callerFilter && l.assignedCallerId?._id !== callerFilter) return false;
        return true;
    });

    async function handleStatusChange(leadId: string, newStatus: LeadStatus) {
        setActionLoading(leadId);
        try {
            const res = await updateLeadStatus(leadId, newStatus);
            if (res.success) {
                if (newStatus === 'completed') {
                    onLeadRemoved(leadId);
                } else if (res.data) {
                    onLeadUpdated(res.data);
                }
            }
        } catch {
            // silent fail — socket will sync
        }
        setActionLoading(null);
    }

    async function handleDelete(leadId: string) {
        setActionLoading(leadId);
        try {
            const res = await deleteLead(leadId);
            if (res.success) {
                onLeadRemoved(leadId);
            }
        } catch {
            // silent fail
        }
        setDeleteTarget(null);
        setActionLoading(null);
    }

    function formatTime(dateStr: string) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    if (filtered.length === 0) {
        return (
            <div
                className="glass-card"
                style={{
                    padding: 60,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 14,
                }}
            >
                <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
                <p style={{ margin: 0 }}>No leads found</p>
            </div>
        );
    }

    return (
        <>
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: 14,
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    borderBottom: '1px solid var(--border-color)',
                                    textAlign: 'left',
                                }}
                            >
                                {['Name', 'Phone', 'Location', 'Source', 'Status', 'Assigned To', 'Time', 'Actions'].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: '14px 16px',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: 'var(--text-muted)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.8px',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((lead) => (
                                <tr
                                    key={lead._id}
                                    className="animate-slide-in"
                                    style={{
                                        borderBottom: '1px solid var(--border-color)',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = 'var(--bg-card-hover)')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = 'transparent')
                                    }
                                >
                                    <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {lead.name}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                                        {lead.phone || '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                                        {[lead.city, lead.state].filter(Boolean).join(', ') || '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                                        {lead.leadSource || '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <StatusBadge status={lead.status} />
                                    </td>
                                    <td style={{ padding: '14px 16px', color: 'var(--accent-blue)', fontWeight: 500 }}>
                                        {lead.assignedCallerId?.name || 'Unassigned'}
                                    </td>
                                    <td
                                        style={{
                                            padding: '14px 16px',
                                            color: 'var(--text-muted)',
                                            fontSize: 12,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {formatTime(lead.createdAt)}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <select
                                                disabled={actionLoading === lead._id}
                                                value=""
                                                onChange={(e) => handleStatusChange(lead._id, e.target.value as LeadStatus)}
                                                style={{
                                                    padding: '6px 8px',
                                                    borderRadius: 6,
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--bg-secondary)',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: 12,
                                                    cursor: 'pointer',
                                                    outline: 'none',
                                                }}
                                            >
                                                <option value="" disabled>
                                                    Change…
                                                </option>
                                                {statusOptions
                                                    .filter((s) => s.value !== lead.status)
                                                    .map((s) => (
                                                        <option key={s.value} value={s.value}>
                                                            {s.label}
                                                        </option>
                                                    ))}
                                            </select>
                                            <button
                                                disabled={actionLoading === lead._id}
                                                onClick={() => setDeleteTarget(lead._id)}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: 6,
                                                    border: '1px solid var(--status-failed)33',
                                                    background: 'var(--status-failed-bg)',
                                                    color: 'var(--status-failed)',
                                                    fontSize: 12,
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteTarget && (
                <DeleteConfirmModal
                    title="Delete Lead"
                    message="Are you sure you want to permanently delete this lead? This action cannot be undone."
                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
}
