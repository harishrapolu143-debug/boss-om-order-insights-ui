import { STATUS_CARD_CLASS } from "../constants";
import { TimelineEvent } from "../types/order";
import { current, isDraft } from "immer";

export function handleApiError(error: any): string {
  let errorMessage = "An unexpected error occurred";

  if (error?.response) {
    errorMessage =
      error.response.data?.message ||
      error.response.data?.error ||
      errorMessage;
  } else if (error?.request) {
    errorMessage = "No response from server. Please check your connection.";
  } else if (error?.message) {
    errorMessage = error.message;
  }

  return errorMessage;
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export const convertParse = (data: any) => {
  if (!data) return "";
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return String(data);
  }
};

export const formatTimestamp = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  return isNaN(date.getTime())
    ? ""
    : date
        .toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(",", "");
};

export function formatDate(
  date: string | Date,
  format: "short" | "long" = "short",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "long") {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat("en-US").format(dateObj);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const isComplexValue = (value: unknown): boolean => {
  if (!value) return false;

  if (typeof value === "object") return true;

  if (typeof value === "string") {
    return value.trim().startsWith("{") || value.trim().startsWith("[");
  }

  return false;
};

export const normalizeValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";

  let result: any = value;

  try {
    while (typeof result === "string") {
      const parsed = JSON.parse(result);
      result = parsed;
    }
  } catch {
    return String(value);
  }

  if (typeof result === "object") return JSON.stringify(result, null, 2);

  return String(result);
};

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const mergeDefined = <T extends Record<string, any>>(
  prev: T,
  next?: Partial<T>,
): T => {
  if (!next) return prev;

  const result = (
    isDraft(prev)
      ? { ...current(prev) } // Immer proxy → plain object
      : { ...prev }
  ) as T; // normal object

  Object.keys(next).forEach((key) => {
    const value = next[key as keyof T];

    if (value !== undefined) {
      result[key as keyof T] = value as T[keyof T];
    }
  });

  return result;
};

export const normalizeOrderId = (
  orderId: string | null | undefined,
): string => {
  return typeof orderId === "string" ? orderId.trim().toUpperCase() : "";
};

export const emailToName = (email: string) => {
  if (!email) return "";

  const namePart = email.split("@")[0];

  return namePart
    .split(/[._-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getStatusCardClass = (status: string) =>
  STATUS_CARD_CLASS[status] ?? STATUS_CARD_CLASS.default;

export const getLocalStorage = (key: string) => {
  return sessionStorage.getItem(key);
};
export const removeLocalStorage = (key: string) => {
  return sessionStorage.removeItem(key);
};

export const setLocalStorage = (key: string, payload: any) => {
  sessionStorage.setItem(
    key,
    typeof payload === "object" ? JSON.stringify(payload) : payload,
  );
};

export const setLocalStorageObject = (obj: any) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const payload = obj[key];
      sessionStorage.setItem(
        key,
        typeof payload === "object" ? JSON.stringify(payload) : payload,
      );
    }
  }
};

export const delayResponse = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isValidJson(value?: string) {
  if (typeof value !== "string") return false;

  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null;
  } catch (e) {
    return false;
  }
}

export const formatDateTime = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    year: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export function splitByLastDash(text: string) {
  const index = text.lastIndexOf("-");

  if (index === -1) {
    return [text]; // no dash found
  }

  const before = text.slice(0, index);
  const after = text.slice(index + 1);

  return [before, after];
}

export function sortTimelineBySeqNumber(
  input: TimelineEvent[],
  isAsc?: boolean,
) {
  if (Array.isArray(input)) {
    return input.sort((a, b) => {
      const aVal = a.seqNumber;
      const bVal = b.seqNumber;

      if (!aVal) return isAsc ? -1 : 1;
      if (!bVal) return isAsc ? 1 : -1;

      return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }
  return input;
}

export function sortTimelineByDate(input: TimelineEvent[], isDesc?: boolean) {
  if (!Array.isArray(input)) {
    return input;
  }

  return input
    .filter(
      (i) => typeof i.actualTimestamp === "string" && i.actualTimestamp.trim()
    )
    .sort((a, b) => {
      const timeA = new Date(a.actualTimestamp).getTime();
      const timeB = new Date(b.actualTimestamp).getTime();

      if (timeA !== timeB) {
        return isDesc ? timeB - timeA : timeA - timeB;
      }

      // Same timestamp, use sequence number as a tie-breaker
      const aVal = a.seqNumber;
      const bVal = b.seqNumber;

      if (!aVal) return isDesc ? 1 : -1;
      if (!bVal) return isDesc ? -1 : 1;

      return isDesc
        ? bVal.localeCompare(aVal)
        : aVal.localeCompare(bVal);
    });
}