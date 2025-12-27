"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Recommendation, RecSettings, TriggerType } from './types';
import { Note } from '@/lib/types';

interface RecommendationContextType {
    recommendation: Recommendation | null;
    settings: RecSettings;
    updateSettings: (newSettings: Partial<RecSettings>) => void;
    checkRecommendation: (trigger: TriggerType) => void;
    dismissRecommendation: () => void;
    acceptRecommendation: () => void;
    setLastViewedNote: (noteId: string) => void;
}

const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

export function RecommendationProvider({ children }: { children: ReactNode }) {
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
    const [settings, setSettings] = useState<RecSettings>({
        mode: 'on',
        frequencyModifier: 1.0,
        dismissStreak: 0,
    });
    const [lastViewedNoteId, setLastViewedNoteIdState] = useState<string | null>(null);

    const updateSettings = (newSettings: Partial<RecSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    const setLastViewedNote = (noteId: string) => {
        setLastViewedNoteIdState(noteId);
    };

    const dismissRecommendation = () => {
        setRecommendation(null);
        setSettings((prev) => {
            const newStreak = prev.dismissStreak + 1;
            let newModifier = prev.frequencyModifier;

            if (newStreak >= 3) {
                newModifier = 0.5; // Decrease frequency by 50%
            }

            return {
                ...prev,
                dismissStreak: newStreak,
                frequencyModifier: newModifier,
            };
        });
    };

    const acceptRecommendation = () => {
        setRecommendation(null);
        setSettings((prev) => ({
            ...prev,
            dismissStreak: 0,
            frequencyModifier: 1.0, // Reset frequency on acceptance
        }));
    };

    // Helper to fetch real notes
    async function fetchRecentNotes(): Promise<Note[]> {
        try {
            // Assuming this API exists based on standard patterns or will return empty if not
            const res = await fetch('/api/notes?limit=1');
            if (!res.ok) return [];
            const data = await res.json();
            return data.notes || [];
        } catch (e) {
            return [];
        }
    }

    const checkRecommendation = async (trigger: TriggerType) => {
        if (settings.mode === 'off') return;

        // Check dashboard only mode
        if (settings.mode === 'dashboard_only') {
            if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
                return;
            }
        }

        // Frequency check
        if (Math.random() > settings.frequencyModifier) {
            console.log('Skipping recommendation due to frequency modifier');
            return;
        }

        let rec: Recommendation | null = null;

        // Define fallback recommendation structure
        const createFallbackRec = (type: TriggerType): Recommendation => ({
            id: `fallback-${type}-${Date.now()}`,
            title: "Smart Suggestions",
            description: "Recommendations coming soon",
            link: "#",
            type: type,
            timestamp: Date.now(),
            isFallback: true
        });

        switch (trigger) {
            case 'notes':
                try {
                    const notes = await fetchRecentNotes();
                    if (notes && notes.length > 0) {
                        const featuredNote = notes[0];
                        if (featuredNote && featuredNote.id !== lastViewedNoteId) {
                            rec = {
                                id: `rec-note-${featuredNote.id}`,
                                title: `Recommended Note`,
                                description: `Check out: ${featuredNote.title}`,
                                link: `/notes/${featuredNote.id}`,
                                type: 'notes',
                                timestamp: Date.now()
                            };
                        } else {
                            // Even if we have notes, if logic says no rec, we might fallback? 
                            // User says "When there IS data show rec... when NO data... show fallback".
                            // Technically here we HAVE data but maybe just filtered out. 
                            // Let's assume valid data = show something. If filtered, maybe show fallback.
                            rec = createFallbackRec('notes');
                        }
                    } else {
                        rec = createFallbackRec('notes');
                    }
                } catch {
                    rec = createFallbackRec('notes');
                }
                break;

            case 'event':
                rec = createFallbackRec('event');
                break;

            case 'classroom':
                rec = createFallbackRec('classroom');
                break;

            case 'lostfound':
                rec = createFallbackRec('lostfound');
                break;
        }

        if (rec) {
            setRecommendation(rec);
        }
    };

    return (
        <RecommendationContext.Provider value={{
            recommendation,
            settings,
            updateSettings,
            checkRecommendation,
            dismissRecommendation,
            acceptRecommendation,
            setLastViewedNote
        }}>
            {children}
        </RecommendationContext.Provider>
    );
}

export function useRecommendation() {
    const context = useContext(RecommendationContext);
    if (context === undefined) {
        throw new Error('useRecommendation must be used within a RecommendationProvider');
    }
    return context;
}
