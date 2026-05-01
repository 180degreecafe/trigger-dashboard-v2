import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/ssr";

export async function middleware(req) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

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

  const isSignIn = pathname === "/signin";

  /* 🔒 حماية */
  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  /* 🔁 منع دخول signin */
  if (isSignIn && session) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|points).*)",
  ],
};
