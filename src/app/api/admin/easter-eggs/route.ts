import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/auth";
import { readJSON, writeJSON, contentPath } from "@/lib/admin/content";
import type { EasterEggsConfig } from "@/types";

const FILE = contentPath("easter-eggs.json");
const SEED: EasterEggsConfig = { forkBomb: true, doomMode: true, legoTardis: true };

function load(): EasterEggsConfig {
  return readJSON<EasterEggsConfig>(FILE, SEED);
}

export async function GET(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(load());
}

export async function PUT(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json() as Partial<EasterEggsConfig>;
  const updated: EasterEggsConfig = { ...load(), ...body };
  writeJSON(FILE, updated);
  revalidatePath("/");
  return NextResponse.json(updated);
}
