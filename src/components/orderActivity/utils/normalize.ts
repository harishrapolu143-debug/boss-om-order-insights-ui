export const STRIP_ACTION_PREFIX = ["undo", "revision", "restore", 'Undo&Redo', 'redo'];

const STRIP_ACTION_PREFIXES_REGEX = new RegExp(
  `^(?:${STRIP_ACTION_PREFIX.join("|")})\\s*[:\\-–]\\s*`,
  "i",
);

export function stripActionPrefix(text?: string) {
  return text ? text.replace(STRIP_ACTION_PREFIXES_REGEX, "").trim() : "";
}

export const isRepeatedTask = (taskName?: string): boolean => {
  return !!taskName && STRIP_ACTION_PREFIXES_REGEX.test(taskName.trim());
};

export function normalizeString(str:string) {
  return str
    .trim()                     // remove leading/trailing spaces
    .toLowerCase()              // convert to lowercase
    .replace(/[^a-z0-9]+/g, "_") // replace spaces & special chars with _
    .replace(/^_+|_+$/g, "");   // remove leading/trailing underscores
}