import { NextResponse } from "next/server";
import { getNoteById } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/notes/:id
 * Fetch a specific note by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const note = await getNoteById(params.id);

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("GET /api/notes/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}
