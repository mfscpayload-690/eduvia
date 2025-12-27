"use client";

import React from 'react';
import { useRecommendation } from './recommendation-context';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function SmartRecommendationPopup() {
    const { recommendation, dismissRecommendation, acceptRecommendation } = useRecommendation();
    const router = useRouter();

    const handleView = () => {
        acceptRecommendation();
        if (recommendation) {
            router.push(recommendation.link);
        }
    };

    return (
        <AnimatePresence>
            {recommendation && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed bottom-6 right-6 z-50 w-80 sm:w-96"
                >
                    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-1 backdrop-blur-xl shadow-2xl dark:bg-black/40">
                        {/* Gradient Border Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-50" />

                        <div className="relative rounded-xl bg-white/60 dark:bg-zinc-900/80 p-5">
                            <button
                                onClick={dismissRecommendation}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                    <Sparkles size={20} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="text-sm font-bold text-foreground leading-none">
                                        Smart Suggestion
                                    </h4>
                                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                        {recommendation.isFallback ? "Feature Under Development" : recommendation.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                        {recommendation.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    onClick={dismissRecommendation}
                                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-neutral-200/50 dark:hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    Dismiss
                                </button>
                                {!recommendation.isFallback && (
                                    <button
                                        onClick={handleView}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                    >
                                        View
                                        <ArrowRight size={14} />
                                    </button>
                                )}
                                {recommendation.isFallback && (
                                    <button
                                        onClick={dismissRecommendation}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-zinc-600 to-zinc-500 hover:from-zinc-500 hover:to-zinc-400 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                    >
                                        Okay
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
