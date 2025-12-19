"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileNavItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/notes", label: "Course Notes" },
    { href: "/timetable", label: "Timetable" },
    { href: "/classfinder", label: "Classroom Finder" },
    { href: "/events", label: "Events" },
    { href: "/lostfound", label: "Lost & Found" },
    { href: "/settings", label: "Profile" },
  ];

  if (session?.user?.role === "admin") {
    mobileNavItems.push({ href: "/admin", label: "Admin" });
  }

  return (
    <nav className="border-b border-neutral-800 bg-neutral-900 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-blue-500 hover:text-blue-400 transition-colors"
        >
          {/* Logo placeholder - replace with actual logo */}
          <div className="h-8 w-8 rounded-md border border-blue-500/30 bg-blue-500/10" aria-label="Eduvia logo" />
          Eduvia
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-neutral-800 rounded-md transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <span className="text-sm text-neutral-400">{session.user?.name}</span>
              <Button
                onClick={() => signOut()}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={() => signIn("google")}
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <LogIn size={16} />
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mt-4 space-y-2 md:hidden pb-4 border-t border-neutral-800 pt-4">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full px-3 py-2 rounded-md text-sm text-neutral-200 hover:bg-neutral-800"
            >
              {item.label}
            </Link>
          ))}

          {session ? (
            <>
              <div className="text-sm text-neutral-400 px-2">{session.user?.name}</div>
              <Button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                signIn("google");
                setMobileMenuOpen(false);
              }}
              size="sm"
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <LogIn size={16} />
              Sign In
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
