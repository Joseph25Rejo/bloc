'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';

const navItems = [
    { href: '/', label: 'Dashboard', icon: DashboardIcon },
    { href: '/callers', label: 'Callers', icon: CallersIcon },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = getSocket();

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        if (socket.connected) setConnected(true);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    return (
        <aside
            style={{
                width: 240,
                minHeight: '100vh',
                background: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 0',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 40,
            }}
        >
            {/* Logo */}
            <div style={{ padding: '0 24px', marginBottom: 40 }}>
                <h1
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--accent-blue)',
                        letterSpacing: '-0.5px',
                        margin: 0,
                    }}
                >
                    <span style={{ color: 'var(--text-primary)' }}>BL</span>OC
                </h1>
                <p
                    style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        marginTop: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                    }}
                >
                    Admin Panel
                </p>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1 }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 24px',
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                background: isActive ? 'var(--accent-blue-glow)' : 'transparent',
                                borderRight: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <item.icon active={isActive} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Connection Status */}
            <div
                style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <span
                    className={connected ? 'animate-pulse-dot' : ''}
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: connected ? '#22c55e' : '#ef4444',
                        display: 'inline-block',
                    }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {connected ? 'Live Connected' : 'Disconnected'}
                </span>
            </div>
        </aside>
    );
}

/* ─── Icon Components ──────────────────────────────────────────────────── */

function DashboardIcon({ active }: { active: boolean }) {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active ? 'var(--accent-blue)' : 'var(--text-muted)'} strokeWidth="2">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    );
}

function CallersIcon({ active }: { active: boolean }) {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={active ? 'var(--accent-blue)' : 'var(--text-muted)'} strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
