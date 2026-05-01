import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 🔥 التعديل هنا
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  /* ---------- public ---------- */
  if (pathname.startsWith("/points")) return res;

  /* ---------- protected ---------- */
  const protectedRoutes = [
    "/dashboard",
    "/campaigns",
    "/triggers",
    "/actions",
    "/notifications",
  ];

  const isProtected = protectedRoutes.some((p) =>
    pathname.startsWith(p)
  );

  /* ---------- redirect unauth ---------- */
  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  /* ---------- prevent signin access ---------- */
  if (pathname === "/signin" && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|points).*)",
  ],
};
