import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/auth";
import { readJSON, writeJSON, contentPath } from "@/lib/admin/content";
import type { Skill } from "@/types";
import _seed from "@/data/skills";

const FILE = contentPath("skills.json");

function load(): Skill[] {
  return readJSON<Skill[]>(FILE, _seed);
}

export async function GET(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(load());
}

export async function POST(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as Skill;
  writeJSON(FILE, [...load(), body]);
  revalidatePath("/");
  return NextResponse.json(body, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as Skill;
  const items = load().map((s) => (s.name === body.name ? body : s));
  writeJSON(FILE, items);
  revalidatePath("/");
  return NextResponse.json(body);
}

export async function DELETE(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const name = new URL(request.url).searchParams.get("name");
  writeJSON(FILE, load().filter((s) => s.name !== name));
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
