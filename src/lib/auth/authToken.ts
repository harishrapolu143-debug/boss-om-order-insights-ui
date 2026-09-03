import { ENDPOINTS_CONSTANTS } from "../constants/endpointConstants";
import { cache } from 'react';

let cachedToken: string = '';
let tokenExpiresAt = 0;
let summaryCachedToken: string = '';
let summaryTokenExpiresAt = 0;

export const getServerToken = cache(async (fetchNewToken?: boolean) => {
    const now = Date.now();
    if (cachedToken && now < tokenExpiresAt && !fetchNewToken) {
        return cachedToken;
    }

    console.log('Fetching server token', now);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${ENDPOINTS_CONSTANTS.GET_AUTH_TOKEN}`, {
        method: "POST",
        cache: "no-store",
    });

    const tokenResponse = await response.json()
    cachedToken = tokenResponse.token;

    tokenExpiresAt = now + Math.max(tokenResponse.expiresIn - 30, 0) * 1000;

    return cachedToken;
})



export const getOrderSummaryServerToken = cache(async (fetchNewToken?: boolean) => {
    const now = Date.now();
    if (summaryCachedToken && now < summaryTokenExpiresAt && !fetchNewToken) {
        return summaryCachedToken;
    }

    console.log('Fetching server token', now);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${ENDPOINTS_CONSTANTS.GET_SUMMARY_TOKEN}`, {
        method: "POST",
        cache: "no-store",
    });

    const tokenResponse = await response.json()
    summaryCachedToken = tokenResponse.token;

    summaryTokenExpiresAt = now + Math.max(tokenResponse.expiresIn - 30, 0) * 1000;

    return summaryCachedToken;
})