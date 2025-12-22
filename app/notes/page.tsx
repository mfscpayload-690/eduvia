"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, ExternalLink } from "lucide-react";
import type { Note } from "@/lib/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch("/api/notes");
        if (!response.ok) throw new Error("Failed to fetch notes");
        const data = await response.json();
        setNotes(data.notes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-brand-500" />
          Course Notes
        </h1>
        <p className="text-muted-foreground">Download or preview course materials shared by faculty.</p>
        <div className="mt-2 inline-flex items-center w-fit rounded-lg border border-brand-500/20 bg-brand-500/10 px-4 py-2 text-sm text-brand-600 dark:text-brand-400">
          <span className="font-medium mr-2">Update:</span> All notes are based on <span className="font-bold ml-1">KTU 2024 Scheme</span>.
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {notes.length === 0 ? (
        <Card className="glass-card border-dashed border-2 border-border/50">
          <CardContent className="pt-6 text-center py-16 flex flex-col items-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No notes available yet</h3>
            <p className="text-muted-foreground max-w-xs">Check back later once your faculty uploads new course materials.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="glass-card border-border/50 hover:border-brand-500/30 transition-all duration-300 hover:shadow-lg group">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg font-heading line-clamp-2 group-hover:text-brand-500 transition-colors">{note.title}</CardTitle>
                  <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-brand-500/10 transition-colors">
                    <BookOpen size={16} className="text-muted-foreground group-hover:text-brand-500" />
                  </div>
                </div>
                <CardDescription className="line-clamp-1">{note.course}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full bg-muted">PDF</span>
                  <span>•</span>
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-3">
                  <Link href={`/notes/${note.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2 border-border/50 hover:bg-muted">
                      <ExternalLink size={16} />
                      Preview
                    </Button>
                  </Link>
                  <a href={note.drive_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button size="sm" className="w-full gap-2 bg-gradient-brand hover:opacity-90 border-0 text-white">
                      <Download size={16} />
                      Download
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
