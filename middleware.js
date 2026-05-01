import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          res.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  /* ---------- PUBLIC ---------- */
  if (path.startsWith("/points")) return res;

  /* ---------- SIGNIN ---------- */
  if (path.startsWith("/signin")) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return res;
  }

  /* ---------- PROTECTED ---------- */
  const protectedRoutes = [
    "/dashboard",
    "/campaigns",
    "/triggers",
    "/actions",
    "/notifications",
  ];

  const isProtected = protectedRoutes.some((p) =>
    path.startsWith(p)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api|points).*)",
  ],
};
