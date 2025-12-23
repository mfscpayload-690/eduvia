"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Maximize2, FileText, BookOpen, Calendar, GraduationCap } from "lucide-react";
import Link from "next/link";
import type { Note } from "@/lib/types";

export default function NotePage({ params }: { params: { id: string } }) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
          <p className="text-sm text-muted-foreground">Loading note...</p>
        </div>
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

  // Google Drive embed URL for preview
  const embedUrl = `https://drive.google.com/file/d/${note.file_id}/preview`;
  // Direct download URL
  const downloadUrl = note.drive_url || `https://drive.google.com/uc?export=download&id=${note.file_id}`;

  return (
    <>
      {/* Fullscreen Preview Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/80">
            <h2 className="text-white font-medium truncate">{note.title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Fullscreen (ESC)
            </Button>
          </div>
          <iframe
            src={embedUrl}
            className="flex-1 w-full"
            allow="autoplay"
            title="PDF Preview Fullscreen"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        <Link href="/notes">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent">
            <ArrowLeft size={16} />
            Back to Notes
          </Button>
        </Link>

        {/* Note Header Card */}
        <Card className="glass-card border-border/50 overflow-hidden">
          <div className="p-6 md:p-8 bg-gradient-to-r from-brand-500/10 to-accent-500/10 border-b border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold font-heading">{note.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 font-medium">
                    <BookOpen size={14} />
                    {note.course}
                  </span>
                  {note.semesters && note.semesters.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      <Calendar size={14} />
                      Semesters: {note.semesters.join(", ")}
                    </span>
                  )}
                  {note.year_of_study && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      <GraduationCap size={14} />
                      Year {note.year_of_study}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploaded on {new Date(note.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>
              <div className="hidden md:flex p-4 rounded-2xl bg-gradient-brand text-white shadow-lg shadow-brand-500/20">
                <FileText size={40} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="w-full gap-2 bg-gradient-brand hover:opacity-90 border-0 text-white">
                  <Download size={20} />
                  Download PDF
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsFullscreen(true)}
                className="flex-1 gap-2 border-brand-500/30 hover:bg-brand-500/5 hover:text-brand-600 dark:hover:text-brand-400"
              >
                <Maximize2 size={20} />
                Fullscreen View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Embedded PDF Preview */}
        <Card className="glass-card border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-brand-500 rounded-full" />
              <h2 className="font-semibold">Document Preview</h2>
            </div>
            <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
              Powered by Google Drive
            </span>
          </div>
          <div className="relative bg-neutral-100 dark:bg-neutral-900">
            {/* PDF Embed */}
            <iframe
              src={embedUrl}
              className="w-full h-[70vh] md:h-[80vh]"
              allow="autoplay"
              title="PDF Preview"
              loading="lazy"
            />
          </div>
          <div className="p-3 bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">
              Having trouble viewing? Try the{" "}
              <button
                onClick={() => setIsFullscreen(true)}
                className="text-brand-500 hover:underline font-medium"
              >
                fullscreen view
              </button>
              {" "}or{" "}
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:underline font-medium"
              >
                download the PDF
              </a>
              .
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
