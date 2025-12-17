import { NextResponse } from "next/server";
import { getEvents, createEvent, getUpcomingEvents } from "@/lib/supabase";
import { requireAuth, requireAdmin } from "@/lib/auth";

/**
 * GET /api/events
 * Fetch events, optionally filtered by filter parameter
 */
export async function GET(req: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");

    let events = filter === "upcoming" ? await getUpcomingEvents() : await getEvents();

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Admin-only: Create a new event
 */
export async function POST(req: Request) {
  try {
    const session = await requireAdmin();

    const body = await req.json();
    const { title, description, starts_at, ends_at } = body;

    if (!title || !description || !starts_at || !ends_at) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await createEvent({
      title,
      description,
      starts_at: new Date(starts_at),
      ends_at: new Date(ends_at),
      created_by: session.user.id,
    });

    return NextResponse.json(
      { success: true, event },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/events error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
