import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/admin/auth";
import { readJSON, writeJSON, contentPath } from "@/lib/admin/content";
import { flattenTranslations, unflattenTranslations } from "@/lib/admin/i18n";
import type { Translations } from "@/i18n/locales/en";
import en from "@/i18n/locales/en";
import it from "@/i18n/locales/it";

const seeds: Record<string, Translations> = { en, it };

function localeFile(locale: string): string {
  return contentPath("locales", `${locale}.json`);
}

export async function GET(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const locale = new URL(request.url).searchParams.get("locale") ?? "en";
  const data = readJSON<Translations>(localeFile(locale), seeds[locale] ?? en);
  return NextResponse.json(flattenTranslations(data as unknown as Record<string, unknown>));
}

export async function PUT(request: NextRequest) {
  if (!verifySession(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { locale, data } = await request.json() as { locale: string; data: Record<string, string> };
  const nested = unflattenTranslations(data);
  writeJSON(localeFile(locale), nested);
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
