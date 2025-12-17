"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

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
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-neutral-400">Notes Management</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-neutral-400">Timetable Management</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-neutral-400">Events Management</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-neutral-400">Lost & Found Management</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
