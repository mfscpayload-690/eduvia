import { NextResponse } from "next/server";
import { getTimetable, createTimetableEntry } from "@/lib/supabase";
import { requireAuth, requireAdmin } from "@/lib/auth";

/**
 * GET /api/timetable
 * Fetch timetable entries, optionally filtered by course
 */
export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const course = searchParams.get("course") || undefined;

    const timetable = await getTimetable(course || undefined);

    return NextResponse.json({
      success: true,
      timetable,
    });
  } catch (error) {
    console.error("GET /api/timetable error:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/timetable
 * Admin-only: Create a new timetable entry
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { course, day, start_time, end_time, room, faculty } = body;

    if (!course || !day || !start_time || !end_time || !room || !faculty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const entry = await createTimetableEntry({
      course,
      day,
      start_time,
      end_time,
      room,
      faculty,
    });

    return NextResponse.json(
      { success: true, entry },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/timetable error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create timetable entry" },
      { status: 500 }
    );
  }
}
