import path from "path";
import fs from "fs";

/** Absolute path to a file inside the content/ directory. */
export function contentPath(...segments: string[]): string {
  return path.join(process.cwd(), "content", ...segments);
}

/**
 * Read a JSON file from content/. Returns `fallback` if the file doesn't exist.
 * Throws on malformed JSON so errors are visible early.
 */
export function readJSON<T>(filePath: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
}

/** Write data as pretty-printed JSON to the given path. */
export function writeJSON<T>(filePath: string, data: T): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
