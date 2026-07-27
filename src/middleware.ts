import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin-only routes
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/manager", req.url));
    }

    // Manager/Admin routes
    if (
      pathname.startsWith("/manager") &&
      token?.role !== "MANAGER" &&
      token?.role !== "DEPARTMENT_MANAGER" &&
      token?.role !== "ADMIN"
    ) {
      if (token?.role === "EMPLOYEE") {
        return NextResponse.redirect(new URL("/employee", req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Employee routes
    if (pathname.startsWith("/employee") && token?.role !== "EMPLOYEE") {
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (token?.role === "MANAGER" || token?.role === "DEPARTMENT_MANAGER") {
        return NextResponse.redirect(new URL("/manager", req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/employee/:path*"],
};
