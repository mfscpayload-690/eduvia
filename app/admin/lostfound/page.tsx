"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { LostFoundItem, LostFoundStatus } from "@/lib/types";

interface LostForm {
  item_name: string;
  description: string;
  status: LostFoundStatus;
  contact: string;
}

const statuses: LostFoundStatus[] = ["lost", "found", "claimed"];

export default function AdminLostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<LostForm>({ item_name: "", description: "", status: "lost", contact: "" });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lostfound");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load items");
      setItems(data.items || []);
    } catch (e: any) {
      setError(e.message || "Failed to load items");
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
      const res = await fetch("/api/lostfound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create item");
      setForm({ item_name: "", description: "", status: "lost", contact: "" });
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to create item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lost & Found Management</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Add and review lost & found items.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Add Item</h2>
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
              placeholder="Item name"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              required
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="Contact"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <textarea
              required
              className="md:col-span-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
            />
            <select
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LostFoundStatus })}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
            <h2 className="text-lg font-semibold">Items</h2>
            {loading && <Loader2 className="animate-spin h-4 w-4 text-neutral-500" />}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && items.length === 0 && <p className="text-sm text-neutral-500">No items yet.</p>}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
              >
                <div className="font-semibold">{item.item_name}</div>
                <div className="text-neutral-500">Status: {item.status} • Contact: {item.contact}</div>
                <div className="text-neutral-500 line-clamp-2">{item.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
