import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/auth";
import { readJSON, writeJSON, contentPath } from "@/lib/admin/content";
import type { Language } from "@/types";
import _seed from "@/data/languages";

const FILE = contentPath("languages.json");

function load(): Language[] {
  return readJSON<Language[]>(FILE, _seed);
}

export async function GET(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(load());
}

export async function POST(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as Language;
  writeJSON(FILE, [...load(), body]);
  revalidatePath("/");
  return NextResponse.json(body, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as Language;
  const items = load().map((l) => (l.name === body.name ? body : l));
  writeJSON(FILE, items);
  revalidatePath("/");
  return NextResponse.json(body);
}

export async function DELETE(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const name = new URL(request.url).searchParams.get("name");
  writeJSON(FILE, load().filter((l) => l.name !== name));
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
