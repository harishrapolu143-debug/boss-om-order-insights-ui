
export function parseJson(data: any): any {
  const tryParse = (value: any): any => {
    if (typeof value !== "string") return value;

    try {
      const parsed = JSON.parse(value);
      return parseJson(parsed);
    } catch {
      return value;
    }
  };

  if (Array.isArray(data)) {
    return data.map((item) => parseJson(item));
  }

  if (data && typeof data === "object") {
    const result: Record<string, any> = {};

    for (const key in data) {
      if (!Object.hasOwn(data, key)) continue;

      const value = data[key];

      if (typeof value === "string") {
        result[key] = tryParse(value);
      } else {
        result[key] = parseJson(value);
      }
    }

    return result;
  }

  return tryParse(data);
}
