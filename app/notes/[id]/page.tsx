"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import type { Note } from "@/lib/types";
import { extractFileId, getPreviewUrl } from "@/lib/drive";

export default function NotePage({ params }: { params: { id: string } }) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        const response = await fetch(`/api/notes/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch note");
        const data = await response.json();
        setNote(data.note);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Link href="/notes">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} />
            Back to Notes
          </Button>
        </Link>
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error || "Note not found"}
        </div>
      </div>
    );
  }

  // Calculate drive preview link (standard view link)
  const drivePreviewLink = note.file_id
    ? `https://drive.google.com/file/d/${note.file_id}/preview`
    : note.drive_url;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <Link href="/notes">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent">
          <ArrowLeft size={16} />
          Back to Notes
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card className="glass-card border-border/50 overflow-hidden md:col-span-2">
          <div className="p-6 md:p-8 border-b border-border/50 bg-muted/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading mb-2">{note.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-2 py-1 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium">
                    {note.course}
                  </span>
                  <span>•</span>
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-brand text-white shadow-lg shadow-brand-500/20">
                <FileText size={32} />
              </div>
            </div>
          </div>

          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={note.drive_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="w-full gap-2 bg-gradient-brand hover:opacity-90 border-0">
                  <Download size={20} />
                  Download PDF
                </Button>
              </a>
              <a href={drivePreviewLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" variant="outline" className="w-full gap-2 border-brand-500/20 hover:bg-brand-500/5 hover:text-brand-600 dark:hover:text-brand-400">
                  <ExternalLink size={20} />
                  Open Full Preview
                </Button>
              </a>
            </div>

            {/* Embedded Preview (Attempted) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-1 h-6 bg-brand-500 rounded-full" />
                  Quick Preview
                </h2>
                <span className="text-xs text-muted-foreground">Powered by Google Drive</span>
              </div>

              <div className="aspect-[16/10] w-full rounded-xl border border-border bg-muted/30 overflow-hidden relative group">
                <iframe
                  src={drivePreviewLink}
                  className="w-full h-full"
                  allow="autoplay"
                  title="PDF Preview"
                />
                {/* Fallback overlay if iframe is blocked (visually indicates external open) */}
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm font-medium mb-3">Better viewing experience?</p>
                  <a href={drivePreviewLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2">
                      <ExternalLink size={16} />
                      Open in New Tab
                    </Button>
                  </a>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                If the preview doesn't load, use the "Open Full Preview" button above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
