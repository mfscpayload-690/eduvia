export type TriggerType = 'notes' | 'event' | 'classroom' | 'lostfound' | 'dashboard';
export type RecMode = 'on' | 'dashboard_only' | 'off';

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    link: string;
    type: TriggerType;
    timestamp: number;
    isFallback?: boolean;
}

export interface RecSettings {
    mode: RecMode;
    frequencyModifier: number; // 1.0 = 100%, 0.5 = 50%
    dismissStreak: number;
}

// === Mock Data Types ===
export interface UserProfile {
    department: string;
    tags: string[];
}

export interface MockTimetableEntry {
    subject: string;
    startTime: string;
    endTime: string;
}

export interface MockNote {
    id: string;
    subject: string;
    title: string;
    nextPart?: string;
}

export interface MockEvent {
    id: string;
    title: string;
    tags: string[];
    department: string;
    registeredFriends: number;
}

export interface MockClassroom {
    room: string;
    availableFrom: string;
    availableTo: string;
}

export interface MockLostItem {
    id: string;
    category: string;
    description: string;
}
