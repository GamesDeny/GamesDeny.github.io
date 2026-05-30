import { type NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";

/** Returns true if the request carries a valid admin session cookie. */
export function verifySession(request: NextRequest): boolean {
  const cookie = request.cookies.get(COOKIE_NAME);
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return cookie?.value === password;
}

/** Cookie name used for the admin session. */
export { COOKIE_NAME };
