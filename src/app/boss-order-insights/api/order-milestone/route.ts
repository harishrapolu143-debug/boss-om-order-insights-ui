import { NextResponse } from "next/server";
import { ENDPOINTS_CONSTANTS } from "@/lib/constants/endpointConstants";
import { serverBaseQuery } from "@/lib/utils/serverBaseQuery";
import { getServerToken } from "@/lib/auth/authToken";
import { ORDER_ID_REGEX } from "@/lib/constants/localConstants";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // if (!ORDER_ID_REGEX.test(orderId)) {
    //   return NextResponse.json(
    //     { success: false, error: "INVALID_ORDER_ID" },
    //     { status: 400 },
    //   );
    // }
    const token = await getServerToken();

    const apiPath = `${ENDPOINTS_CONSTANTS.API_ORDER_TIMELINE_MILESTONES}`;
    const result = await serverBaseQuery.post(
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