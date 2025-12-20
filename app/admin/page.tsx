import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, BookOpen, CalendarClock, CalendarDays, Package } from "lucide-react";

const tiles = [
  { href: "/admin/notes", title: "Notes", description: "Upload and manage study notes", icon: BookOpen },
  { href: "/admin/timetable", title: "Timetable", description: "Manage class schedules", icon: CalendarClock },
  { href: "/admin/events", title: "Events", description: "Create and edit events", icon: CalendarDays },
  { href: "/admin/lostfound", title: "Lost & Found", description: "Review and update items", icon: Package },
];

export default function AdminPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8 text-blue-500" />
          Admin Dashboard
        </h1>
        <p className="text-neutral-400 mt-2">Manage campus data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiles.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full border-neutral-200 transition hover:border-blue-500 hover:shadow-lg dark:border-neutral-800 dark:hover:border-blue-400">
              <CardContent className="pt-6 pb-8 px-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{title}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
                  </div>
                </div>
                <p className="text-sm text-blue-600 group-hover:underline dark:text-blue-300">Open</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
