import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/admin/auth";
import { siteConfig } from "@/config/contact";
import type { RoadmapConfig } from "@/types";

export async function GET(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const config: RoadmapConfig = { username: siteConfig.roadmapUsername };
  return NextResponse.json(config);
}
