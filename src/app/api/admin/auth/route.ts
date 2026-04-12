import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, password, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // secure: true — enable in production (requires HTTPS)
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
