"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2, Trash2 } from "lucide-react";
import type { Note } from "@/lib/types";
import { extractFileId, getDownloadUrl } from "@/lib/drive";

interface NoteForm {
  title: string;
  course: string;
  file_id: string;
  drive_url: string;
  semester?: number;
  year_of_study?: number;
  share_link?: string;
}

interface EditingNote {
  id: string;
  form: NoteForm;
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<NoteForm>({ title: "", course: "", file_id: "", drive_url: "", semester: undefined, year_of_study: undefined, share_link: "" });
  const [editing, setEditing] = useState<EditingNote | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load notes");
      setNotes(data.notes || []);
    } catch (e: any) {
      setError(e.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // If share link provided, derive file_id and drive_url
      let payload = { ...form };
      if (form.share_link && !form.file_id) {
        try {
          const fid = extractFileId(form.share_link);
          payload.file_id = fid;
          payload.drive_url = getDownloadUrl(fid);
        } catch (err) {
          console.warn("Invalid share link", err);
        }
      }
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create note");
      setForm({ title: "", course: "", file_id: "", drive_url: "", semester: undefined, year_of_study: undefined, share_link: "" });
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to create note");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditing({ id: note.id, form: { title: note.title, course: note.course, file_id: note.file_id, drive_url: note.drive_url, semester: note.semester, year_of_study: note.year_of_study } });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing.form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update note");
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete note");
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to delete note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notes Management</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Upload and manage study notes.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Add Note</h2>
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              required
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              placeholder="Course"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              type="number"
              min={1}
              max={8}
              value={form.semester ?? ""}
              onChange={(e) => setForm({ ...form, semester: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Semester (1-8)"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              type="number"
              min={1}
              max={4}
              value={form.year_of_study ?? ""}
              onChange={(e) => setForm({ ...form, year_of_study: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Year of Study"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              required
              value={form.file_id}
              onChange={(e) => setForm({ ...form, file_id: e.target.value })}
              placeholder="Google Drive file_id"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              required
              value={form.drive_url}
              onChange={(e) => setForm({ ...form, drive_url: e.target.value })}
              placeholder="Drive download URL"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              value={form.share_link}
              onChange={(e) => setForm({ ...form, share_link: e.target.value })}
              placeholder="Optional: Paste Drive share link to auto-fill"
              className="md:col-span-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
              </Button>
            </div>
          </form>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Existing Notes</h2>
            {loading && <Loader2 className="animate-spin h-4 w-4 text-neutral-500" />}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && notes.length === 0 && <p className="text-sm text-neutral-500">No notes yet.</p>}
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="font-semibold">{note.title}</div>
                  <div className="text-neutral-500 text-xs">Course: {note.course}</div>
                  {note.semester && <div className="text-neutral-500 text-xs">Sem: {note.semester}</div>}
                  {note.year_of_study && <div className="text-neutral-500 text-xs">Year: {note.year_of_study}</div>}
                  <div className="text-neutral-500 text-xs truncate">Drive URL: {note.drive_url}</div>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardContent className="p-4 space-y-4">
              <h2 className="text-lg font-semibold">Edit Note</h2>
              <input
                required
                value={editing.form.title}
                onChange={(e) => setEditing({ ...editing, form: { ...editing.form, title: e.target.value } })}
                placeholder="Title"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <input
                required
                value={editing.form.course}
                onChange={(e) => setEditing({ ...editing, form: { ...editing.form, course: e.target.value } })}
                placeholder="Course"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <input
                type="number"
                min={1}
                max={8}
                value={editing.form.semester ?? ""}
                onChange={(e) => setEditing({ ...editing, form: { ...editing.form, semester: e.target.value ? Number(e.target.value) : undefined } })}
                placeholder="Semester (1-8)"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <input
                type="number"
                min={1}
                max={4}
                value={editing.form.year_of_study ?? ""}
                onChange={(e) => setEditing({ ...editing, form: { ...editing.form, year_of_study: e.target.value ? Number(e.target.value) : undefined } })}
                placeholder="Year of Study"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
