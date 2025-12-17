"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import type { Note } from "@/lib/types";

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
      <div className="flex items-center justify-center h-screen">
        <p className="text-neutral-400">Loading...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Link href="/notes">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft size={16} />
            Back to Notes
          </Button>
        </Link>
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200">
          {error || "Note not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <Link href="/notes">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft size={16} />
          Back to Notes
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{note.title}</CardTitle>
          <CardDescription className="space-y-1">
            <p>{note.course}</p>
            <p>{new Date(note.created_at).toLocaleDateString()}</p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <a href={note.drive_url} target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Download size={18} />
              Download PDF
            </Button>
          </a>

          <div className="pt-4 border-t border-neutral-800">
            <p className="text-sm text-neutral-400 mb-3">PDF Preview:</p>
            <div className="bg-neutral-800 rounded-lg p-4 text-center">
              <p className="text-neutral-500 text-sm">
                PDF preview not yet implemented. Please download the file to view it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
