"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { TimetableEntry } from "@/lib/types";

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const response = await fetch("/api/timetable");
        if (!response.ok) throw new Error("Failed to fetch timetable");
        const data = await response.json();
        setTimetable(data.timetable || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-neutral-400">Loading timetable...</p>
      </div>
    );
  }

  // Group by day
  const groupedByDay = DAYS_ORDER.reduce(
    (acc, day) => {
      acc[day] = timetable.filter((entry) => entry.day === day);
      return acc;
    },
    {} as Record<string, TimetableEntry[]>
  );

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="w-8 h-8 text-blue-500" />
          Timetable
        </h1>
        <p className="text-neutral-400 mt-2">Your class schedule</p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {timetable.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Clock className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">No timetable entries available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {DAYS_ORDER.map((day) => {
            const dayEntries = groupedByDay[day];
            if (dayEntries.length === 0) return null;

            return (
              <div key={day}>
                <h2 className="text-lg font-semibold mb-3 text-neutral-100">{day}</h2>
                <div className="space-y-2">
                  {dayEntries
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((entry) => (
                      <Card key={entry.id} className="hover:border-blue-600 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base">{entry.course}</h3>
                              <p className="text-sm text-neutral-400">{entry.faculty}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-sm font-mono bg-neutral-800 px-3 py-1 rounded">
                                {entry.start_time} - {entry.end_time}
                              </p>
                              <p className="text-sm text-neutral-400">{entry.room}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
