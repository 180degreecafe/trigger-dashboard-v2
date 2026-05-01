import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  /* ---------- PUBLIC ---------- */
  if (path.startsWith("/points")) return res;

  /* ---------- SIGNIN ---------- */
  if (path.startsWith("/signin")) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return res;
  }

  /* ---------- PROTECTED ---------- */
  if (!user) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/triggers/:path*",
    "/actions/:path*",
    "/campaigns/:path*",
    "/notifications/:path*",
  ],
};
