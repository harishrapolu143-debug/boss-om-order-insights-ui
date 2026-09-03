import { createApi } from "@reduxjs/toolkit/query/react";
import { ENDPOINTS_CONSTANTS } from "@/lib/constants/endpointConstants";
import { Order, OrderSummary } from "@/lib/types/order";
import appBaseQueryWithReauth from "../baseQuery/appBaseQuery";
import { GetMilestone, GetOrderTimeLine } from "@/lib/types/payload";
import { mapApiTimelineToUi } from "@/lib/utils/orderPayload";
import { normalizeString } from "@/components/orderActivity/utils/normalize";

type ProcessedTask = {
  taskName: string;
  taskSequence: number;
  taskType: "MANDATORY" | "OPTIONAL";
  done: boolean;
  fallout: boolean;
  falloutReason: string;
};

type ProcessedMilestone = {
  milestoneName: string;
  milestoneSequence: number;
  tasks: ProcessedTask[];
};

type ProcessedOrderMilestones = {
  productType: string;
  orderAction: string;
  accountType: string;
  milestones: ProcessedMilestone[];
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  fulfillmentTaskMap?: Map<
    string,
    {
      statusCode: string;
      title: string;
      subTitle: string;
    }
  >;
};

interface ProcessOrderSummary {
  result: {
    success: boolean;
    status: number;
    orderNumber: string;
    topic: string;
    payloadType: string;
    durationMs: number;
    result: {
      instruction: string;
      orderNumber: string;
      orderVersion: string;
      topic: string;
      payloadType: string;
      generatedOn: string;
      context: {
        order: any;
        tasks: any[];
        cases: any[];
        fallouts: any[];
        versionHistory?: any[];
      };
    };
  };
}

interface BackendMilestone {
  milestoneName: string;
  milestoneSequence: number;
  tasks: BackendTask[];
}

interface BackendTask {
  taskName: string;
  taskSequence: number;
  taskType: "MANDATORY" | "OPTIONAL";

  done?: boolean;
  fallout?: boolean;
  falloutReason?: string;
}

const transformResponse = (result: any): any => {
  const updatedResponse =
    result.data && Array.isArray(result.data.content)
      ? mapApiTimelineToUi(result.data.content)
      : Array.isArray(result.data)
        ? mapApiTimelineToUi(result.data)
        : {};
  return {
    ...updatedResponse,
    pagination: result.data?.pageable,
  };
};

export const OrderTimelineApi = createApi({
  reducerPath: "OrderTimelineApi",
  baseQuery: appBaseQueryWithReauth,
  endpoints: (builder) => ({
    getOrderTimeline: builder.query<Order, GetOrderTimeLine>({
      query: (request) => ({
        url: ENDPOINTS_CONSTANTS.GET_ORDER_TIMELINE,
        method: "POST",
        body: request,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        return { orderId: queryArgs.orderId };
      },
      transformResponse,
    }),
    getOrderTimelineBypage: builder.query<Order, GetOrderTimeLine>({
      query: (request) => ({
        url: ENDPOINTS_CONSTANTS.GET_ORDER_TIMELINE_PAGE,
        method: "POST",
        body: request,
      }),
      transformResponse,
    }),
    getMilestones: builder.query<ProcessedOrderMilestones, GetMilestone>({
      query: ({ fulfillmentTaskMap, dispatchStatus, ...request }) => ({
        url: ENDPOINTS_CONSTANTS.GET_ORDER_TIMELINE_MILESTONES,
        method: "POST",
        body: request,
      }),

      transformResponse: (response: any, meta, arg) => {
        const fulfillmentTasks = arg?.fulfillmentTaskMap || [];
        const dispatchStatus = arg?.dispatchStatus;

        let totalTasks = 0;
        let completedTasks = 0;
        let falloutDetails = "";

        const processedTasks: Record<string, any> = {};

        let milestones =
          response?.data?.milestones?.map((milestone: BackendMilestone) => ({
            ...milestone,
            tasks: milestone.tasks
              .map((task: any) => {
                const taskKey = task?.taskName?.toLowerCase();

                const matchedTask = fulfillmentTasks.find(
                  (item: any) =>
                    item?.short_description?.toLowerCase() === taskKey,
                );

                if (
                  matchedTask?.taskType === "CASE" &&
                  processedTasks[taskKey]
                ) {
                  const existingTask = processedTasks[taskKey];

                  if (!existingTask.fallout) {
                    return null;
                  }
                }

                const status = matchedTask?.state?.toLowerCase() || "";

                const completedStatuses = ["closed complete", "success"];

                const falloutStatuses = ["fallout"];

                const inprogressStatuses = [
                  "in progress",
                  "open",
                  "awaiting information",
                ];

                let link = null;

                const done = completedStatuses.includes(status);

                const fallout = falloutStatuses.includes(status);

                const inprogress = inprogressStatuses.includes(status);

                if (
                  matchedTask?.case &&
                  Object.keys(matchedTask.case)?.length
                ) {
                  link = matchedTask?.case;
                  if (!falloutDetails) {
                    falloutDetails = matchedTask?.case;
                  }
                }

                const isOptional =
                  (typeof task.taskType === "string" &&
                    task.taskType.toUpperCase() === "OPTIONAL") ||
                  (normalizeString(milestone.milestoneName) === "dispatched" &&
                    !dispatchStatus);
                if (!isOptional) {
                  totalTasks++;

                  if (done) {
                    completedTasks++;
                  }
                }
                
                const result = {
                  ...task,
                  taskName:
                    task.taskType === "OPTIONAL"
                      ? `${task.taskName} (Optional)`
                      : task.taskName,

                  done,
                  fallout,
                  inprogress,
                  link,
                  falloutReason: fallout
                    ? matchedTask?.subTitle ||
                      matchedTask?.title ||
                      "Task failed"
                    : "",
                };

                processedTasks[taskKey] = result;

                return result;
              })
              .filter(Boolean),
          })) || [];

        if (
          milestones.every(
            (m: any) => Array.isArray(m.tasks) && m.tasks.length === 0,
          )
        ) {
          milestones = [];
        }
        return {
          ...response.data,
          milestones,
          totalTasks,
          completedTasks,
          falloutDetails,
          completionPercentage:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
          isHaveMilestones:
            fulfillmentTasks.length > 0 && milestones.length > 0,
        };
      },
    }),
    getOrderSummary: builder.query<ProcessOrderSummary, OrderSummary>({
      query: (request) => ({
        url: ENDPOINTS_CONSTANTS.GET_ORDER_SUMMARY,
        method: "POST",
        body: request,
      }),
    }),
  }),
});

export const {
  useLazyGetOrderTimelineQuery,
  useLazyGetOrderTimelineBypageQuery,
  useGetOrderTimelineBypageQuery,
  useLazyGetMilestonesQuery,
  useLazyGetOrderSummaryQuery,
} = OrderTimelineApi;
