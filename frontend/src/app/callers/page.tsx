'use client';

import { useEffect, useState } from 'react';
import type { Caller } from '../lib/types';
import {
    fetchCallers,
    createCaller,
    updateCaller,
    deleteCaller as deleteCallerApi,
} from '../lib/api';
import CallerCard from '../components/CallerCard';
import AddCallerModal from '../components/AddCallerModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function CallersPage() {
    const [callers, setCallers] = useState<Caller[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Caller | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    useEffect(() => {
        loadCallers();
    }, []);

    async function loadCallers() {
        try {
            const res = await fetchCallers();
            if (res.success && res.data) setCallers(res.data);
        } catch {
            // silent
        }
        setLoading(false);
    }

    async function handleSave(data: Partial<Caller>) {
        try {
            if (editTarget) {
                const res = await updateCaller(editTarget._id, data);
                if (res.success && res.data) {
                    setCallers((prev) =>
                        prev.map((c) => (c._id === editTarget._id ? res.data! : c))
                    );
                }
            } else {
                const res = await createCaller(data);
                if (res.success && res.data) {
                    setCallers((prev) => [...prev, res.data!]);
                }
            }
        } catch {
            // silent
        }
        setShowModal(false);
        setEditTarget(null);
    }

    async function handleDelete(callerId: string) {
        try {
            const res = await deleteCallerApi(callerId);
            if (res.success) {
                setCallers((prev) => prev.filter((c) => c._id !== callerId));
            }
        } catch {
            // silent
        }
        setDeleteTarget(null);
    }

    function openEdit(caller: Caller) {
        setEditTarget(caller);
        setShowModal(true);
    }

    function openAdd() {
        setEditTarget(null);
        setShowModal(true);
    }

    // Stats
    const totalCallers = callers.length;
    const activeCallers = callers.filter(
        (c) => !(c.dailyLimit > 0 && c.todayAssignedCount >= c.dailyLimit)
    ).length;
    const totalAssignedToday = callers.reduce((sum, c) => sum + c.todayAssignedCount, 0);
    const maxedOut = totalCallers - activeCallers;

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '60vh',
                    color: 'var(--text-muted)',
                    fontSize: 14,
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            border: '3px solid var(--border-color)',
                            borderTopColor: 'var(--accent-blue)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto 16px',
                        }}
                    />
                    Loading callers...
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 28,
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Caller Management
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                        Manage your team assignments and daily limits
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    style={{
                        padding: '10px 24px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'var(--accent-blue)',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'background 0.2s',
                    }}
                >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Caller
                </button>
            </div>

            {/* Summary Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: 16,
                    marginBottom: 28,
                }}
            >
                <StatMini label="Total Callers" value={totalCallers} color="var(--accent-blue)" />
                <StatMini label="Active" value={activeCallers} color="var(--status-completed)" />
                <StatMini label="Assigned Today" value={totalAssignedToday} color="var(--status-pending)" />
                <StatMini label="At Limit" value={maxedOut} color="var(--status-failed)" />
            </div>

            {/* Caller Grid */}
            {callers.length === 0 ? (
                <div
                    className="glass-card"
                    style={{
                        padding: 60,
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: 14,
                    }}
                >
                    <p style={{ fontSize: 40, marginBottom: 12 }}>👥</p>
                    <p style={{ margin: 0 }}>No callers yet. Add your first team member.</p>
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 20,
                    }}
                >
                    {callers.map((caller) => (
                        <CallerCard
                            key={caller._id}
                            caller={caller}
                            onEdit={openEdit}
                            onDelete={(id) => setDeleteTarget(id)}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showModal && (
                <AddCallerModal
                    editCaller={editTarget}
                    onSave={handleSave}
                    onCancel={() => {
                        setShowModal(false);
                        setEditTarget(null);
                    }}
                />
            )}

            {deleteTarget && (
                <DeleteConfirmModal
                    title="Delete Caller"
                    message="Are you sure you want to delete this caller? This action cannot be undone."
                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}

function StatMini({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="glass-card" style={{ padding: '16px 20px' }}>
            <p
                style={{
                    margin: 0,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}
            >
                {label}
            </p>
            <p
                style={{
                    margin: '6px 0 0',
                    fontSize: 26,
                    fontWeight: 700,
                    color,
                    lineHeight: 1,
                }}
            >
                {value}
            </p>
        </div>
    );
}
