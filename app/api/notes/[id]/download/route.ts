import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getNoteById } from "@/lib/supabase";

/**
 * GET /api/notes/:id/download
 * Redirect to Google Drive download link
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const { id } = params;
    const note = await getNoteById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.redirect(note.drive_url);
  } catch (error) {
    console.error("GET /api/notes/:id/download error:", error);
    return NextResponse.json(
      { error: "Failed to download note" },
      { status: 500 }
    );
  }
}
