"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackHomeButton() {
  const pathname = usePathname();
  const hidden = pathname?.startsWith("/auth") || pathname === "/" || pathname === "/dashboard";
  if (hidden) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <Link href="/" aria-label="Back to home">
        <button
          className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-transform transition-shadow duration-150 hover:scale-105 hover:shadow-[0_0_0_8px_rgba(59,130,246,0.25)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </button>
      </Link>
    </div>
  );
}
