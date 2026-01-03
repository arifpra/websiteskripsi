import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "__Host-authjs.session-token",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "authjs.callback-url",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "__Host-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.callback-url",
] as const;

const clearAuthCookies = (response: NextResponse) => {
  for (const name of AUTH_COOKIES) {
    const secure = name.startsWith("__Secure-") || name.startsWith("__Host-");
    response.cookies.set(name, "", { path: "/", maxAge: 0, secure });
  }
};

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  clearAuthCookies(response);
  return response;
}
