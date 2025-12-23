"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Edit2, Trash2, Link as LinkIcon, CheckCircle, X, ChevronDown } from "lucide-react";
import type { Note } from "@/lib/types";
import { extractFileId, getDownloadUrl } from "@/lib/drive";

// Branch options - same as profile
const BRANCHES = [
  { value: "Computer Science and Engineering(CS)", label: "CS - Computer Science" },
  { value: "Computer Science and Engineering(CYBERSECURITY)", label: "CS - Cybersecurity" },
  { value: "Electronics and Communication Engineering (EC)", label: "EC - Electronics & Communication" },
  { value: "Electrical and Electronics Engineering (EE)", label: "EE - Electrical & Electronics" },
  { value: "M.Tech in Computer Science and Engineering(Cyber Forensics and Information Security)", label: "M.Tech - Cyber Forensics" },
];

interface NoteForm {
  title: string;
  course: string;
  branches: string[];
  semester: number | "";
  year_of_study: number | "";
  drive_share_link: string;
}

interface EditingNote {
  id: string;
  form: NoteForm;
}

const initialForm: NoteForm = {
  title: "",
  course: "",
  branches: [],
  semester: "",
  year_of_study: "",
  drive_share_link: "",
};

// Multi-select dropdown component
function BranchMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (branches: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleBranch = (branch: string) => {
    if (selected.includes(branch)) {
      onChange(selected.filter(b => b !== branch));
    } else {
      onChange([...selected, branch]);
    }
  };

  const removeBranch = (branch: string) => {
    onChange(selected.filter(b => b !== branch));
  };

  return (
    <div className="relative">
      <div
        className="w-full min-h-[42px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm cursor-pointer dark:border-neutral-700 dark:bg-neutral-800 flex flex-wrap gap-1.5 items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-neutral-400">Select branches...</span>
        ) : (
          selected.map(branch => {
            const label = BRANCHES.find(b => b.value === branch)?.label || branch;
            return (
              <span
                key={branch}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded text-xs font-medium"
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBranch(branch);
                  }}
                  className="hover:text-brand-800 dark:hover:text-brand-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })
        )}
        <ChevronDown className={`w-4 h-4 text-neutral-400 ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg max-h-48 overflow-y-auto">
            {BRANCHES.map(branch => (
              <label
                key={branch.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(branch.value)}
                  onChange={() => toggleBranch(branch.value)}
                  className="rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-neutral-900 dark:text-neutral-100">{branch.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<NoteForm>(initialForm);
  const [editing, setEditing] = useState<EditingNote | null>(null);
  const [extractedFileId, setExtractedFileId] = useState<string>("");

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

  // Auto-extract file ID when drive link changes
  useEffect(() => {
    if (form.drive_share_link) {
      try {
        const fileId = extractFileId(form.drive_share_link);
        setExtractedFileId(fileId);
      } catch {
        setExtractedFileId("");
      }
    } else {
      setExtractedFileId("");
    }
  }, [form.drive_share_link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate
      if (!form.title || !form.course || !form.drive_share_link) {
        throw new Error("Please fill in Title, Course, and Google Drive Link");
      }

      // Extract file ID from share link
      let fileId: string;
      try {
        fileId = extractFileId(form.drive_share_link);
      } catch {
        throw new Error("Invalid Google Drive link. Please paste a valid share link.");
      }

      const driveUrl = getDownloadUrl(fileId);

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          course: form.course,
          file_id: fileId,
          drive_url: driveUrl,
          branches: form.branches.length > 0 ? form.branches : undefined,
          semester: form.semester || undefined,
          year_of_study: form.year_of_study || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create note");

      setForm(initialForm);
      setExtractedFileId("");
      setSuccess("Note added successfully!");
      setTimeout(() => setSuccess(null), 3000);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to create note");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditing({
      id: note.id,
      form: {
        title: note.title,
        course: note.course,
        branches: note.branches || [],
        semester: note.semester || "",
        year_of_study: note.year_of_study || "",
        drive_share_link: `https://drive.google.com/file/d/${note.file_id}/view?usp=sharing`,
      },
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);

    try {
      let fileId: string;
      try {
        fileId = extractFileId(editing.form.drive_share_link);
      } catch {
        throw new Error("Invalid Google Drive link");
      }

      const res = await fetch(`/api/notes/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editing.form.title,
          course: editing.form.course,
          file_id: fileId,
          drive_url: getDownloadUrl(fileId),
          branches: editing.form.branches.length > 0 ? editing.form.branches : undefined,
          semester: editing.form.semester || undefined,
          year_of_study: editing.form.year_of_study || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update note");

      setEditing(null);
      setSuccess("Note updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
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
      setSuccess("Note deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to delete note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Notes Management</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Upload and manage study notes for students.</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Add Note Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add New Note</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Data Structures Module 1"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Course <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  placeholder="e.g., PBCST304 - Data Structures"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

            {/* Branches Multi-select */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Applicable Branches
              </label>
              <BranchMultiSelect
                selected={form.branches}
                onChange={(branches) => setForm({ ...form, branches })}
              />
              <p className="mt-1 text-xs text-neutral-500">
                Select all branches this note applies to. Leave empty for all branches.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Semester
                </label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Year of Study
                </label>
                <select
                  value={form.year_of_study}
                  onChange={(e) => setForm({ ...form, year_of_study: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="">Select Year</option>
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Google Drive Share Link <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  required
                  value={form.drive_share_link}
                  onChange={(e) => setForm({ ...form, drive_share_link: e.target.value })}
                  placeholder="Paste Google Drive share link (with viewer access)"
                  className="w-full rounded-lg border border-neutral-300 bg-white pl-10 pr-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
              {extractedFileId && (
                <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  File ID extracted: <code className="bg-green-500/10 px-1 rounded">{extractedFileId}</code>
                </p>
              )}
              <p className="mt-1.5 text-xs text-neutral-500">
                Make sure the file has &quot;Anyone with the link&quot; viewer access enabled.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                {saving ? "Saving..." : "Add Note"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Notes */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Existing Notes</h2>
            {loading && <Loader2 className="animate-spin h-4 w-4 text-neutral-500" />}
          </div>

          {!loading && notes.length === 0 && (
            <p className="text-sm text-neutral-500 py-4 text-center">No notes uploaded yet.</p>
          )}

          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:border-brand-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3 className="font-semibold truncate">{note.title}</h3>
                    <p className="text-sm text-neutral-500 truncate">{note.course}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {note.branches && note.branches.length > 0 ? (
                        note.branches.map(branch => {
                          const label = BRANCHES.find(b => b.value === branch)?.label || branch;
                          return (
                            <span key={branch} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded">
                              {label}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded">All Branches</span>
                      )}
                      {note.semester && <span className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded">Sem {note.semester}</span>}
                      {note.year_of_study && <span className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded">Year {note.year_of_study}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Edit Note</h2>

              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input
                  value={editing.form.title}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, title: e.target.value } })}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Course</label>
                <input
                  value={editing.form.course}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, course: e.target.value } })}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Applicable Branches</label>
                <BranchMultiSelect
                  selected={editing.form.branches}
                  onChange={(branches) => setEditing({ ...editing, form: { ...editing.form, branches } })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Semester</label>
                  <select
                    value={editing.form.semester}
                    onChange={(e) => setEditing({ ...editing, form: { ...editing.form, semester: e.target.value ? Number(e.target.value) : "" } })}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Sem {sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Year</label>
                  <select
                    value={editing.form.year_of_study}
                    onChange={(e) => setEditing({ ...editing, form: { ...editing.form, year_of_study: e.target.value ? Number(e.target.value) : "" } })}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    <option value="">Select</option>
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Google Drive Link</label>
                <input
                  value={editing.form.drive_share_link}
                  onChange={(e) => setEditing({ ...editing, form: { ...editing.form, drive_share_link: e.target.value } })}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
