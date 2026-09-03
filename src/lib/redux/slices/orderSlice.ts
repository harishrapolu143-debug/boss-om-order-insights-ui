import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { TimelineFilter } from "@/lib/types";
import { OrderTimelineApi } from "../service/query/endpoints/orderTimelineApi";
import { ITEM_PER_PAGE } from "@/lib/constants/localConstants";
import { mergeDefined } from "@/lib/utils/helpers";

export type OrderRecord = {
  sys_id: string;
  external_id: string;
  version: string;
  order_type: string;
  u_state: string;
  u_due_date: string; // ISO date string
  u_service_type: string;
  u_sales_channel: string;
  u_agent_id: string;
  u_milestone: string;
  u_disposition_comments: string;
  u_dispatch_status: string;
  sys_created_on: string; // datetime string
  sys_updated_on: string; // datetime string
  sys_updated_by: string;
  account_u_account_classification: string;
  account_sn_tmt_core_external_id: string;
  account_primary_contact_first_name: string;
  account_primary_contact_last_name: string;
  account_primary_contact_email: string;
  account_primary_contact_mobile_phone: string;
};

export type VersionHistory = {
  sys_id: string;
  u_sales_channel: string;
  u_agent_id: string;
  u_notes: string;
  u_version: string;
  u_products: string; // JSON string
  u_reward: string;
  u_request_type: string;
};

interface OrderState {
  orderId: string;
  timelineFilter: TimelineFilter[];
  activeView: string;
  orderTimelineData: any;
  loadAllData: boolean;
  pagination: {
    page: number;
    size: number;
    isLastPage: boolean;
  };
  error: string | null;
  orderMilestones: any;
  orderRecord?: OrderRecord;
  milestoneTasks?: Record<string, any>;
  orderDetails?: Record<string, any>;
  versionHistory?: VersionHistory[];
  currentOrderVersion: string;
  bossOMPage: boolean;
}

const initialState: OrderState = {
  orderId: "",
  timelineFilter: ["userRemarks", "remarks", "caseActivity", "interfaceLogs"],
  activeView: "0",
  pagination: {
    page: 0,
    isLastPage: true,
    size: ITEM_PER_PAGE,
  },
  orderTimelineData: null,
  loadAllData: false,
  error: null,
  orderMilestones: {},
  orderRecord: undefined,
  milestoneTasks: undefined,
  currentOrderVersion: "1",
  bossOMPage: false,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrderId: (state, action: PayloadAction<string>) => {
      return {
        ...initialState,
        orderId: action.payload,
        bossOMPage: state.bossOMPage
      };
    },

    setPagination: (
      state,
      action: PayloadAction<Partial<OrderState["pagination"]>>,
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    toggleTimelineFilter: (state, action: PayloadAction<TimelineFilter>) => {
      const filter = action.payload;
      state.timelineFilter = state.timelineFilter.includes(filter)
        ? state.timelineFilter.filter((f) => f !== filter)
        : [...state.timelineFilter, filter];
      state.pagination.page = 0;
      state.activeView = "0";
    },
    setActiveView: (state, action: PayloadAction<string>) => {
      state.activeView = action.payload;
      state.pagination.page = 0;
    },
    resetOnRefresh: (state) => {
      state.orderTimelineData = null;
      state.pagination = {
        page: 0,
        size: ITEM_PER_PAGE,
        isLastPage: true,
      };
      state.loadAllData = false;
      state.activeView = "0";
      console.log("[REDUX] Order state reset due to timeline refresh");
    },
    setBossOMPage: (state, action: PayloadAction<boolean>) => {
      state.bossOMPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        OrderTimelineApi.endpoints.getOrderTimeline.matchFulfilled,
        (state, action) => {
          state.orderTimelineData = action.payload;
          state.pagination.page = 0;
          state.pagination.isLastPage = true;
          state.loadAllData = true;
        },
      )
      .addMatcher(
        OrderTimelineApi.endpoints.getOrderTimelineBypage.matchFulfilled,
        (state, action) => {
          const incomingTimeline = action.payload?.timeline ?? [];
          if (
            !state.orderTimelineData ||
            (action.payload?.orderId &&
              action.payload?.orderId !== state.orderTimelineData.orderId)
          ) {
            state.orderTimelineData = {
              ...action.payload,
              timeline: [...incomingTimeline],
            };
          } else {
            let existingTimeline = [];
            try {
              existingTimeline = JSON.parse(
                JSON.stringify(state.orderTimelineData.timeline),
              );
            } catch {
              existingTimeline = [];
            }

            state.orderTimelineData = {
              ...mergeDefined(state.orderTimelineData, action.payload),
              timeline: [...existingTimeline, ...incomingTimeline],
            };
          }

          if (!action.payload?.noteTypeCall) {
            state.pagination.page = action.payload?.pagination?.pageNumber ?? 0;

            state.pagination.isLastPage =
              action.payload?.pagination?.last ?? true;

            state.loadAllData = action.payload?.pagination?.last ?? true;
          }
          state.error = null;
        },
      )
      .addMatcher(
        OrderTimelineApi.endpoints.getMilestones.matchFulfilled,
        (state, action) => {
          state.orderMilestones = action.payload;
        },
      )
      .addMatcher(
        OrderTimelineApi.endpoints.getOrderSummary.matchFulfilled,
        (state, action) => {
          const response = action.payload;
          const orderDetails = response?.result?.result?.context || {};
          const orderPayload = orderDetails?.order || {};
          const milestonesCollection = Object.fromEntries([
            ...(orderDetails.tasks || []).map((res) => [
              res.short_description,
              res,
            ]),

            ...(orderDetails.cases || []).map((res) => [
              res.short_description,
              res,
            ]),

            ...(orderDetails.fallouts || []).map((res) => [
              res.short_description,
              res,
            ]),
          ]);
          state.orderRecord = orderPayload;
          state.orderMilestones = milestonesCollection;
          state.versionHistory = orderDetails?.versionHistory;
          state.orderDetails = orderDetails?.order;
          state.currentOrderVersion =
            response?.result?.result?.orderVersion ||
            initialState.currentOrderVersion;
        },
      );
  },
});

export const {
  setOrderId,
  setPagination,
  toggleTimelineFilter,
  setActiveView,
  resetOnRefresh,
  setBossOMPage,
} = orderSlice.actions;

export const selectOrderState = (state: RootState) => state.order;
export default orderSlice.reducer;