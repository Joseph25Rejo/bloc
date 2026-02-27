'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Lead, Caller } from './lib/types';
import { fetchActiveLeads, fetchCallers } from './lib/api';
import { getSocket } from './lib/socket';
import StatsBar from './components/StatsBar';
import LeadTable from './components/LeadTable';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [callers, setCallers] = useState<Caller[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [callerFilter, setCallerFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const loadData = useCallback(async () => {
    try {
      const [leadsRes, callersRes] = await Promise.all([fetchActiveLeads(), fetchCallers()]);
      if (leadsRes.success && leadsRes.data) setLeads(leadsRes.data);
      if (callersRes.success && callersRes.data) setCallers(callersRes.data);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Socket.IO real-time events ─────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();

    socket.on('newLead', (lead: Lead) => {
      setLeads((prev) => {
        if (prev.find((l) => l._id === lead._id)) return prev;
        return [lead, ...prev];
      });
    });

    socket.on('leadStatusUpdated', (updatedLead: Lead) => {
      setLeads((prev) =>
        prev.map((l) => (l._id === updatedLead._id ? updatedLead : l))
      );
    });

    socket.on('leadCompleted', ({ leadId }: { leadId: string }) => {
      setLeads((prev) => prev.filter((l) => l._id !== leadId));
    });

    socket.on('leadDeleted', ({ leadId }: { leadId: string }) => {
      setLeads((prev) => prev.filter((l) => l._id !== leadId));
    });

    return () => {
      socket.off('newLead');
      socket.off('leadStatusUpdated');
      socket.off('leadCompleted');
      socket.off('leadDeleted');
    };
  }, []);

  function handleLeadUpdated(updatedLead: Lead) {
    setLeads((prev) =>
      prev.map((l) => (l._id === updatedLead._id ? updatedLead : l))
    );
  }

  function handleLeadRemoved(leadId: string) {
    setLeads((prev) => prev.filter((l) => l._id !== leadId));
  }

  const sortedLeads = [...leads].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Get unique callers from leads for the filter dropdown
  const assignedCallers = Array.from(
    new Map(
      leads
        .filter((l) => l.assignedCallerId)
        .map((l) => [l.assignedCallerId!._id, l.assignedCallerId!.name])
    )
  );

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
          Loading leads...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
          Live Overview
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
          Real-time updates from your lead pipeline
        </p>
      </div>

      {/* Stats */}
      <StatsBar leads={leads} />

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Filters:</span>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={filterSelectStyle}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="calling">Calling</option>
          <option value="no-answer">No Answer</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={callerFilter}
          onChange={(e) => setCallerFilter(e.target.value)}
          style={filterSelectStyle}
        >
          <option value="">All Callers</option>
          {assignedCallers.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
          style={filterSelectStyle}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {(statusFilter || callerFilter) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setCallerFilter('');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--accent-blue)',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Lead Feed Title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
          Live Lead Feed
        </h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {leads.length} active leads
        </span>
      </div>

      {/* Table */}
      <LeadTable
        leads={sortedLeads}
        onLeadUpdated={handleLeadUpdated}
        onLeadRemoved={handleLeadRemoved}
        statusFilter={statusFilter}
        callerFilter={callerFilter}
      />
    </div>
  );
}

const filterSelectStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 6,
  border: '1px solid var(--border-color)',
  background: 'var(--bg-card)',
  color: 'var(--text-secondary)',
  fontSize: 12,
  cursor: 'pointer',
  outline: 'none',
};
