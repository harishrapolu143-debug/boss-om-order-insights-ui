import { NextResponse } from "next/server";
import { ENDPOINTS_CONSTANTS } from "@/lib/constants/endpointConstants";
import { getOrderSummaryServerToken, getServerToken } from "@/lib/auth/authToken";
import { ORDER_ID_REGEX } from "@/lib/constants/localConstants";
import { serverSummaryBaseQuery } from "@/lib/utils/serverSummaryBaseQuery";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = await getOrderSummaryServerToken();

    console.log(token,'token')

    const apiPath = `${ENDPOINTS_CONSTANTS.API_ORDER_SUMMARY}`;
    const result = await serverSummaryBaseQuery.post(
      apiPath,
      body,
      { Authorization: `Bearer ${token}` },
    );
    
    if (result.error) {
      return NextResponse.json(
        { success: false, error: "API_ERROR", statusCode: result.error.status },
        { status: result.error.status },
      );
    }

    if (!result.data || typeof result.data !== "object") {
      return NextResponse.json(
        { success: false, error: "INVALID_RESPONSE" },
        { status: 502 },
      );
    }

    return NextResponse.json(
        result.data,
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}