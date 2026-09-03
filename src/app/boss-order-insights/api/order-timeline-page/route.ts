import { NextResponse } from "next/server";
import { mapApiTimelineToUi } from "@/lib/utils/orderPayload";
import { ENDPOINTS_CONSTANTS } from "@/lib/constants/endpointConstants";
import { serverBaseQuery } from "@/lib/utils/serverBaseQuery";
import { getServerToken } from "@/lib/auth/authToken";
import { ITEM_PER_PAGE, ORDER_ID_REGEX } from "@/lib/constants/localConstants";
import { normalizeOrderId } from "@/lib/utils/helpers";

export async function POST(req: Request) {
  try {
    const { orderId, page, size } = await req.json();
    const normalizedOrderId = normalizeOrderId(orderId);

    if (!ORDER_ID_REGEX.test(normalizedOrderId)) {
      return NextResponse.json(
        { success: false, error: "INVALID_ORDER_ID" },
        { status: 400 },
      );
    }

    const token = await getServerToken();
    const apiPath = `${ENDPOINTS_CONSTANTS.API_ORDER_TIMELINE_PAGINATION}/${encodeURIComponent(normalizedOrderId)}`;
    const result = await serverBaseQuery.get(
      apiPath,
      { page: page || 0, size: size || ITEM_PER_PAGE },
      { Authorization: `Bearer ${token}` },
    );

    if (result.error) {
      return NextResponse.json(
        { success: false, error: "API_ERROR", statusCode: result.error.status },
        { status: result.error.status },
      );
    }

    
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ORDER] Error:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}