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
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
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
    "/((?!signin|points|_next|favicon.ico).*)",
  ],
};
