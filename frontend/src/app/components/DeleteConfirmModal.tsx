'use client';

interface DeleteConfirmModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteConfirmModal({ title, message, onConfirm, onCancel }: DeleteConfirmModalProps) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="glass-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: 420,
                    width: '90%',
                    padding: 28,
                }}
            >
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {title}
                </h3>
                <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 8,
                            border: '1px solid var(--border-color)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontSize: 14,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 8,
                            border: 'none',
                            background: 'var(--status-failed)',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
