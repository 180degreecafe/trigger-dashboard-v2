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

  // 🔑 جلب الجلسة
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  /* ---------- PUBLIC ROUTES ---------- */
  if (path.startsWith("/points")) return res;

  /* ---------- SIGNIN PAGE ---------- */
  if (path.startsWith("/signin")) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return res;
  }

  /* ---------- PROTECTED ROUTES ---------- */
  const protectedRoutes = [
    "/dashboard",
    "/campaigns",
    "/triggers",
    "/actions",
    "/notifications",
  ];

  const isProtected = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  // 🔥 إذا غير مسجل دخول
  if (isProtected && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/signin";

    // 🔥 نحفظ الصفحة المطلوبة
    redirectUrl.searchParams.set("redirectTo", path);

    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

/* ---------- MATCHER ---------- */
export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api|points).*)",
  ],
};
