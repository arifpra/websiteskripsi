import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// route yang wajib login
const PROTECTED_ROUTES = [
  "/history-order",
  "/cart/checkout",
  "/checkout",
  "/admin",
  "/owner",
];

// helper: cek apakah path termasuk protected
function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Ambil token JWT tanpa memanggil auth() (ini ringan & edge-safe)
  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  const token = await getToken(
    authSecret ? { req: request, secret: authSecret } : { req: request }
  );

  const isLoggedIn = !!token;
  const role = (token?.role as "ADMIN" | "OWNER" | "CUSTOMER" | undefined) ?? undefined;

  // 1) WAJIB LOGIN untuk route tertentu
  if (!isLoggedIn && isProtectedPath(pathname)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/signin";
    signInUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(signInUrl);
  }

  // 2) Role guard: Admin area
  if (isLoggedIn && pathname.startsWith("/admin") && role !== "ADMIN") {
    // OWNER tidak boleh masuk admin (owner hanya insight)
    if (role === "OWNER") {
      const url = request.nextUrl.clone();
      url.pathname = "/owner";
      url.search = "";
      return NextResponse.redirect(url);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 3) Role guard: Owner area
  if (isLoggedIn && pathname.startsWith("/owner") && role !== "OWNER") {
    // admin/customer tidak boleh masuk owner
    if (role === "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 4) Kalau sudah login tapi buka /signin -> redirect sesuai role
  if (isLoggedIn && pathname.startsWith("/signin")) {
    const url = request.nextUrl.clone();
    url.search = "";

    if (role === "ADMIN") url.pathname = "/admin";
    else if (role === "OWNER") url.pathname = "/owner";
    else url.pathname = "/";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Matcher dibuat lebih "ketat" supaya middleware tidak jalan untuk semua route.
 * Ini membantu performa & kadang ikut menekan ukuran output edge.
 *
 * Kita hanya perlu:
 * - halaman signin
 * - semua halaman protected routes
 *
 * Catatan: Next.js matcher tidak support array startsWith secara dinamis,
 * jadi kita tulis pattern eksplisit.
 */
export const config = {
  matcher: [
    "/signin",
    "/history-order/:path*",
    "/cart/checkout/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/owner/:path*",
  ],
};
