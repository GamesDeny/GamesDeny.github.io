import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page through without auth
  if (pathname === "/admin/login") return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_NAME);
  const password = process.env.ADMIN_PASSWORD;

  if (!password || cookie?.value !== password) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
