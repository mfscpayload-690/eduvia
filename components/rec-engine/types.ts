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
