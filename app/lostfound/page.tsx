"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function LostFoundPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="w-8 h-8 text-blue-500" />
          Lost & Found
        </h1>
        <p className="text-neutral-400 mt-2">Report or find lost items</p>
      </div>

      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-neutral-400">Lost & Found coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
