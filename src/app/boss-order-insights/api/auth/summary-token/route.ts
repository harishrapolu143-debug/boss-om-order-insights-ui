import { NextResponse } from "next/server";
import { serverBaseQuery } from "@/lib/utils/serverBaseQuery";
import { ENDPOINTS_CONSTANTS } from "@/lib/constants/endpointConstants";

interface AuthTokenResponse {
  access_token?: string;
  expires_in ?: string;
}

export async function POST() {
  try {
    console.log('[SERVER] Token api Called');
    const tokenID = process.env.ORDER_SUMMARY_CLIENT_ID || process.env.TOKEN_CLIENT_ID;
    const tokenSecret = process.env.ORDER_SUMMARY_CLIENT_SECRET || process.env.TOKEN_CLIENT_SECRET;
    const authTokenUrl = ENDPOINTS_CONSTANTS.API_TOKEN_URL;
    const token = Buffer.from(`${tokenID}:${tokenSecret}`).toString("base64");
    if (!token || !authTokenUrl) {
      return NextResponse.json(
        { success: false, error: "CONFIG_ERROR" },
        { status: 500 },
      );
    }

    const authUrl = authTokenUrl;
    const result = await serverBaseQuery.post(
      authUrl,
      {},
      {
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`,
      },
      true
    );

    if (result.error) {
      return NextResponse.json(
        { success: false, error: "AUTH_FAILED" },
        { status: result.error.status },
      );
    }

    const data = result.data as AuthTokenResponse;

    if (!data?.access_token) {
      return NextResponse.json(
        { success: false, error: "INVALID_RESPONSE" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { success: true, token: data.access_token, expiresIn: data.expires_in },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("[REQUEST ERROR] Token endpoint error:", {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during authentication",
        error: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
