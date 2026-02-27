'use client';

import { useState, useEffect, type FormEvent } from 'react';
import type { Caller } from '../lib/types';

interface AddCallerModalProps {
    onSave: (data: Partial<Caller>) => void;
    onCancel: () => void;
    editCaller?: Caller | null;
}

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

const COMMON_LANGUAGES = [
    'English', 'Hindi', 'Bengali', 'Tamil', 'Telugu',
    'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Odia',
    'Punjabi', 'Assamese', 'Urdu',
];

export default function AddCallerModal({ onSave, onCancel, editCaller }: AddCallerModalProps) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [languages, setLanguages] = useState<string[]>([]);
    const [assignedStates, setAssignedStates] = useState<string[]>([]);
    const [dailyLimit, setDailyLimit] = useState(0);

    useEffect(() => {
        if (editCaller) {
            setName(editCaller.name);
            setRole(editCaller.role || '');
            setLanguages([...editCaller.languages]);
            setAssignedStates([...editCaller.assignedStates]);
            setDailyLimit(editCaller.dailyLimit);
        }
    }, [editCaller]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onSave({ name, role, languages, assignedStates, dailyLimit });
    }

    function toggleItem(arr: string[], setArr: (v: string[]) => void, item: string) {
        if (arr.includes(item)) {
            setArr(arr.filter((i) => i !== item));
        } else {
            setArr([...arr, item]);
        }
    }

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="glass-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: 540,
                    width: '90%',
                    padding: 32,
                    maxHeight: '85vh',
                    overflowY: 'auto',
                }}
            >
                <h3
                    style={{
                        margin: '0 0 4px',
                        fontSize: 20,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                    }}
                >
                    {editCaller ? 'Edit Caller' : 'Add New Caller'}
                </h3>
                <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-muted)' }}>
                    {editCaller
                        ? 'Update caller details and permissions.'
                        : 'Configure details and permissions for the new team member.'}
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Full Name *</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            style={inputStyle}
                        />
                    </div>

                    {/* Role */}
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Role</label>
                        <input
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g. Senior Agent"
                            style={inputStyle}
                        />
                    </div>

                    {/* Languages */}
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Languages</label>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {COMMON_LANGUAGES.map((lang) => {
                                const selected = languages.includes(lang);
                                return (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => toggleItem(languages, setLanguages, lang)}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: 9999,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            border: selected
                                                ? '1px solid var(--accent-blue)'
                                                : '1px solid var(--border-color)',
                                            background: selected ? 'var(--accent-blue-glow)' : 'transparent',
                                            color: selected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {lang}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Assigned States */}
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Assigned States</label>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 150, overflowY: 'auto' }}>
                            {INDIAN_STATES.map((state) => {
                                const selected = assignedStates.includes(state);
                                return (
                                    <button
                                        key={state}
                                        type="button"
                                        onClick={() => toggleItem(assignedStates, setAssignedStates, state)}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: 9999,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            border: selected
                                                ? '1px solid var(--status-completed)'
                                                : '1px solid var(--border-color)',
                                            background: selected ? 'var(--status-completed-bg)' : 'transparent',
                                            color: selected ? 'var(--status-completed)' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {state}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Daily Limit */}
                    <div style={fieldWrap}>
                        <label style={labelStyle}>Daily Limit</label>
                        <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--text-muted)' }}>
                            Maximum outbound calls allowed per day. 0 = unlimited.
                        </p>
                        <input
                            type="number"
                            min={0}
                            value={dailyLimit}
                            onChange={(e) => setDailyLimit(Number(e.target.value))}
                            style={{ ...inputStyle, width: 120 }}
                        />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="button" onClick={onCancel} style={cancelBtnStyle}>
                            Cancel
                        </button>
                        <button type="submit" style={saveBtnStyle}>
                            {editCaller ? 'Save Changes' : 'Add Caller'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const fieldWrap: React.CSSProperties = { marginBottom: 20 };

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
};

const cancelBtnStyle: React.CSSProperties = {
    padding: '10px 24px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 14,
    cursor: 'pointer',
};

const saveBtnStyle: React.CSSProperties = {
    padding: '10px 24px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--accent-blue)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
};
