import { Lead, Caller, ApiResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://bloc-5ibj.onrender.com';

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    return res.json();
}

// ─── Leads ──────────────────────────────────────────────────────────────────

export async function fetchActiveLeads() {
    return request<Lead[]>('/api/leads/active');
}

export async function fetchAllLeads() {
    return request<Lead[]>('/api/leads');
}

export async function updateLeadStatus(id: string, status: string) {
    return request<Lead>(`/api/leads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
}

export async function deleteLead(id: string) {
    return request<null>(`/api/leads/${id}`, { method: 'DELETE' });
}

// ─── Callers ────────────────────────────────────────────────────────────────

export async function fetchCallers() {
    return request<Caller[]>('/api/callers');
}

export async function createCaller(data: Partial<Caller>) {
    return request<Caller>('/api/callers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateCaller(id: string, data: Partial<Caller>) {
    return request<Caller>(`/api/callers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteCaller(id: string) {
    return request<null>(`/api/callers/${id}`, { method: 'DELETE' });
}
