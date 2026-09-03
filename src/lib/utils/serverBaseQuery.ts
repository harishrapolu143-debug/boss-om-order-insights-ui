import "server-only";

import { getServerToken } from "../auth/authToken";
interface FetchOptions extends RequestInit {
    url: string;
    params?: Record<string, string>;
    skipReauth?: boolean;
}
interface ServerError {
    status: number;
    message: string;
    details?: unknown;
}
interface ServerResult {
    data?: any;
    error?: ServerError;
}
export class ServerBaseQuery {
    private baseUrl = process.env.API_BASE_URL || "";
    private timeout = 30000;
    private buildUrl(path: string, params?: Record<string, string>): string {
        if (/^https?:\/\//i.test(path)) {
            throw new Error("Absolute URLs are not allowed");
        }

        const fullUrl = `${this.baseUrl}${path}`;

        if (!params) return fullUrl;

        return `${fullUrl}?${new URLSearchParams(params).toString()}`;
    }

    private async fetchInternal<T>(
        options: FetchOptions,
        token?: string
    ): Promise<ServerResult> {
        const { url, params, headers, ...rest } = options;
        console.log("[SERVER] FETCH CALLED FOR", url)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const finalHeader: Record<string, string> = {
                "Content-Type": "application/json",
            }
            if (token) {
                finalHeader['Authorization'] = `Bearer ${token}`;
            }
            if (headers) Object.assign(finalHeader, headers as Record<string, string>);
            const res = await fetch(this.buildUrl(url, params), {
                ...rest,
                headers: finalHeader,
                signal: controller.signal,
                cache: "no-store",
            });
            clearTimeout(timeoutId);
            if (!res.ok) {
                console.log("[SERVER] error: ", res)
                return {
                    error: {
                        status: res.status,
                        message: res.statusText,
                        details: await res.text().catch(() => ""),
                    },
                };
            }

            return { data: (await res.json()) as T };
        } catch (err: any) {
            console.log("[SERVER] Error:", err)
            return {
                error: {
                    status: err?.name === "AbortError" ? 504 : 500,
                    message: err?.message || "Unknown error",
                },
            };
        }
    }
    async fetch<T>(options: FetchOptions): Promise<ServerResult> {
        let result = await this.fetchInternal<T>(options);
        if (result.error?.status === 401 && !options.skipReauth) {
            console.log('[SERVER] Refresh Token api calling');

            const token = await getServerToken(true);

            result = await this.fetchInternal<T>(options, token);
        }
        return result;
    }

    get<T>(
        url: string,
        params?: Record<string, string>,
        headers?: Record<string, string>,
        skipReauth?: boolean
    ) {
        return this.fetch<T>({ url, params, headers, method: "GET", skipReauth });
    }
    post<T>(
        url: string,
        body?: unknown,
        headers?: Record<string, string>,
        skipReauth?: boolean
    ) {
        return this.fetch<T>({
            url,
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
            headers,
            skipReauth,
        });
    }
    put<T>(url: string, body?: unknown, headers?: Record<string, string>) {
        return this.fetch<T>({
            url,
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
            headers,
        });
    }
    delete<T>(url: string, headers?: Record<string, string>) {
        return this.fetch<T>({ url, method: "DELETE", headers });
    }
}

export const serverBaseQuery = new ServerBaseQuery();
