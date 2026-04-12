import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/auth";
import { readJSON, writeJSON, contentPath } from "@/lib/admin/content";
import type { EducationEntry } from "@/types";
import _seed from "@/data/education";
import { randomUUID } from "node:crypto";

const FILE = contentPath("education.json");

function load(): EducationEntry[] {
  return readJSON<EducationEntry[]>(FILE, _seed);
}

export async function GET(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(load());
}

export async function POST(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as EducationEntry;
  const item: EducationEntry = { ...body, id: randomUUID() };
  writeJSON(FILE, [...load(), item]);
  revalidatePath("/");
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as EducationEntry;
  const items = load().map((e) => (e.id === body.id ? body : e));
  writeJSON(FILE, items);
  revalidatePath("/");
  return NextResponse.json(body);
}

export async function DELETE(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  writeJSON(FILE, load().filter((e) => e.id !== id));
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
