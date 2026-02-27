export interface Caller {
    _id: string;
    name: string;
    role: string;
    languages: string[];
    assignedStates: string[];
    dailyLimit: number;
    todayAssignedCount: number;
    lastAssignedAt: string | null;
    lastResetDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Lead {
    _id: string;
    name: string;
    phone: string;
    timestamp: string;
    leadSource: string;
    city: string;
    state: string;
    status: 'pending' | 'calling' | 'completed' | 'no-answer' | 'failed';
    assignedCallerId: {
        _id: string;
        name: string;
    } | null;
    assignedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    count?: number;
    message?: string;
}

export type LeadStatus = Lead['status'];
