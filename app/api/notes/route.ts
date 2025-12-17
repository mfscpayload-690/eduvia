import { NextResponse } from "next/server";
import { getNotes, createNote } from "@/lib/supabase";
import { requireAuth, requireAdmin } from "@/lib/auth";

/**
 * GET /api/notes
 * Fetch all available notes (student accessible)
 */
export async function GET() {
  try {
    await requireAuth();
    const notes = await getNotes();

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * Admin-only: Create a new note
 */
export async function POST(req: Request) {
  try {
    const session = await requireAdmin();

    const body = await req.json();
    const { title, course, file_id, drive_url } = body;

    if (!title || !course || !file_id || !drive_url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const note = await createNote({
      title,
      course,
      file_id,
      drive_url,
      created_by: session.user.id,
    });

    return NextResponse.json(
      { success: true, note },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/notes error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
