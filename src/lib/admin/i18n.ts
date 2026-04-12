/** Flatten a nested translations object to dot-notation keys. */
export function flattenTranslations(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "object" && val !== null) {
      Object.assign(acc, flattenTranslations(val as Record<string, unknown>, fullKey));
    } else {
      acc[fullKey] = String(val);
    }
    return acc;
  }, {});
}

/** Reconstruct a nested object from dot-notation keys. */
export function unflattenTranslations(
  flat: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [dotKey, value] of Object.entries(flat)) {
    const parts = dotKey.split(".");
    let cursor = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof cursor[parts[i]] !== "object") cursor[parts[i]] = {};
      cursor = cursor[parts[i]] as Record<string, unknown>;
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return result;
}
