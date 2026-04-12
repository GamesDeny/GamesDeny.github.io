import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/auth";
import { readJSON, writeJSON, contentPath } from "@/lib/admin/content";
import type { RoadmapConfig } from "@/types";

const FILE = contentPath("roadmap.json");
const SEED: RoadmapConfig = { username: "" };

export async function GET(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(readJSON<RoadmapConfig>(FILE, SEED));
}

export async function PUT(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as RoadmapConfig;
  writeJSON(FILE, body);
  revalidatePath("/");
  return NextResponse.json(body);
}
