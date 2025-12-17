import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/notes/:id/download
 * Redirect to Google Drive download link
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    // In a real implementation, you would fetch the note from Supabase
    // and get its drive_url, then redirect to it
    // For now, we'll return a placeholder

    return NextResponse.json(
      { error: "Note not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("GET /api/notes/:id/download error:", error);
    return NextResponse.json(
      { error: "Failed to download note" },
      { status: 500 }
    );
  }
}
