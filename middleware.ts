import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(_req: NextRequest) {},
  {
    pages: {
      signIn: "/auth/signin",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (!token) return false;
        if (pathname.startsWith("/admin")) {
          return (token as any).role === "admin";
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    "/timetable/:path*",
    "/lostfound/:path*",
    "/events/:path*",
    "/classfinder/:path*",
    "/admin/:path*",
  ],
};
