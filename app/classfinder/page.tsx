"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function ClassfinderPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="w-8 h-8 text-blue-500" />
          Classroom Finder
        </h1>
        <p className="text-neutral-400 mt-2">Find classroom locations</p>
      </div>

      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-neutral-400">Classroom finder coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
