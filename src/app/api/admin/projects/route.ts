import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/auth";
import { readJSON, writeJSON, contentPath } from "@/lib/admin/content";
import type { Project } from "@/types";
import _seed from "@/data/projects";
import { randomUUID } from "node:crypto";

const FILE = contentPath("projects.json");

function load(): Project[] {
  return readJSON<Project[]>(FILE, _seed);
}

export async function GET(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(load());
}

export async function POST(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as Omit<Project, "id">;
  const item: Project = { ...body, id: randomUUID() };
  const projects = [...load(), item];
  writeJSON(FILE, projects);
  revalidatePath("/");
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as Project;
  const projects = load().map((p) => (p.id === body.id ? body : p));
  writeJSON(FILE, projects);
  revalidatePath("/");
  return NextResponse.json(body);
}

export async function DELETE(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const projects = load().filter((p) => p.id !== id);
  writeJSON(FILE, projects);
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
