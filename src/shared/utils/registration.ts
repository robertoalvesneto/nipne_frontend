const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidLike(value?: string | null) {
  return uuidRegex.test(value?.trim() ?? "");
}

export function getSafeRegistration(...values: Array<string | null | undefined>) {
  return values.find((value) => value?.trim() && !isUuidLike(value))?.trim() ?? "";
}

export function formatRegistration(...values: Array<string | null | undefined>) {
  return getSafeRegistration(...values) || "-";
}
