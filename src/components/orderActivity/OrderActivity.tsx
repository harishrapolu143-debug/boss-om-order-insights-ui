"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { CompactOrderBar } from "./components/CompactOrderBar";
import { TimelineView } from "./components/TimelineView";
import { LogTableView } from "./components/LogTableView";
import { Button } from "./components/ui/button/button";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner/sonner";
import {
  useLazyGetMilestonesQuery,
  useLazyGetOrderSummaryQuery,
  useLazyGetOrderTimelineBypageQuery,
  useLazyGetOrderTimelineQuery,
} from "@/lib/redux/service/query/endpoints/orderTimelineApi";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setActiveView,
  setOrderId,
  toggleTimelineFilter,
} from "@/lib/redux/slices/orderSlice";
import { TimelineFilter } from "@/lib/types";
import OrderTimelinePageSkeleton from "../common/OrderTimelineSkeleton";
import OrderTrackerGraph from "./components/OrderTrackerGraph";
import { AIInsightPanel } from "./components/AIInsightPanel";
import OrderTracker from "../orderTracker/OrderTracker";
import { Info } from "lucide-react";
import { normalizeString } from "./utils/normalize";
import { logTypeConfig } from "./components/FilterBar";
import { OrderTrackerBar } from "./components/OrderTrackerBar";
import { getPassedDays } from "./utils/date";

type Props = {
  isFromBossOm: boolean;
  bossOMOrderId: string | undefined;
};

type Pagination = {
  page: number;
  size: number;
};

export type DisplayMode = "taskboard" | "timeline";

export default function OrderActivity({ isFromBossOm, bossOMOrderId }: Props) {
  const [expandedEventIds, setExpandedEventIds] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<"timeline" | "table">(
    "timeline",
  );
  const [displayMode, setDisplayMode] = useState<DisplayMode>("timeline");
  const [isTrackerBarExpanded, setIsTrackerBarExpanded] = useState(false);
  const [orderPayload, setOrderPayload] = useState<any>({});
  const [collectionOfMilestone, setCollectionOfMilestone] = useState<any>({});

  const {
    orderId,
    pagination,
    orderTimelineData,
    activeView: versionFilter,
    timelineFilter: logTypeFilter,
    versionHistory,
    milestoneTasks,
    orderRecord,
  } = useAppSelector((state) => state.order);

  const dispatch = useAppDispatch();

  const [getOrderActivity, { isFetching: activityLoading }] =
    useLazyGetOrderTimelineBypageQuery();
  const [getAllOrderActivity, { isFetching: allActivityLoading }] =
    useLazyGetOrderTimelineQuery();
  const [getMilestones, { isFetching: isMilesTonesFetching }] =
    useLazyGetMilestonesQuery();
  const [getOrderSummary, { isFetching: orderSummaryFetching }] =
    useLazyGetOrderSummaryQuery();

  const isLoading = activityLoading || allActivityLoading;

  const handleSearch = (orderId: string) => {
    dispatch(setOrderId(orderId));
  };

  useEffect(() => {
    if (bossOMOrderId) {
      dispatch(setOrderId(bossOMOrderId));
    }
  }, [isFromBossOm]);

  const handleToggleEvent = (id: string) => {
    setExpandedEventIds((prev) =>
      prev.includes(id)
        ? prev.filter((eventId) => eventId !== id)
        : [...prev, id],
    );
  };

  const fetchOrderActivity = ({ page, size }: Partial<Pagination>) => {
    getOrderActivity({ orderId, page, size })
      .unwrap()
      .then((response) => {
        if (!page && !response?.timeline?.length) {
          toast.error(`No Activity found for Order ${orderId}.`);
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Unable to load order activity.");
      });
  };

  const fetchMilestone = (order: any, fulfillmentTaskMap: any) => {
    getMilestones({
      productType: order.u_service_type,
      orderAction: order.order_type,
      accountType: order.account_u_account_classification,
      voiceCategory: order.u_voice_category || "",
      networkType: order.u_network_type || "",
      fulfillmentTaskMap,
      dispatchStatus: orderRecord?.u_dispatch_status,
    })
      .unwrap()
      .catch((error) => {
        console.log(error);
        toast.error("Unable to load milestone.");
      });
  };

  const fetchOrderSummary = () => {
    getOrderSummary({
      orderNumber: orderId,
      topic: "OTCF",
      payloadType: "AI_CONTEXT_VIEW",
    })
      .unwrap()
      .then((response) => {
        const orderDetails = response?.result?.result?.context || {};
        const orderPayload = orderDetails?.order || {};
        const milestonesCollection = [
          ...(orderDetails.tasks || []).map((res) => ({
            ...res,
            taskType: "TASK",
          })),

          ...(orderDetails.cases || []).map((res) => ({
            ...res,
            taskType: "CASE",
          })),

          ...(orderDetails.fallouts || []).map((res) => ({
            ...res,
            taskType: "FALLOUT",
          })),
        ];
        setOrderPayload(orderPayload);
        setCollectionOfMilestone(milestonesCollection);
        fetchMilestone(orderPayload, milestonesCollection);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Unable to load order summary.");
      });
  };

  const handleLoadAll = () => {
    getAllOrderActivity({ orderId });
  };

  const handleLoadMore = () => {
    fetchOrderActivity({
      page: pagination.page + 1,
      size: pagination.size,
    });
  };

  const handleLogTypeChange = (changeValue: string) => {
    dispatch(toggleTimelineFilter(changeValue as TimelineFilter));
  };

  const handleVersionChange = (value: string) => {
    dispatch(setActiveView(value));
  };

  const handleRefresh = () => {
    fetchOrderActivity({});
  };

  const timelineData: any[] = useMemo(() => {
    return orderTimelineData?.timeline || [];
  }, [orderTimelineData?.timeline]);

  const versionSummary = useMemo(() => {
    let summary = {};
    if (Array.isArray(versionHistory)) {
      summary = versionHistory.reduce((acc: Record<string, any>, item) => {
        if (item.u_version) {
          acc[item.u_version] = item;
        }
        return acc;
      }, {});
    }
    return summary;
  }, [versionHistory]);

  const handleFilter = (data: any[]) => {
    const filteredData: any[] = [];
    data.forEach((event) => {
      const isCategoryMatch = Object.entries(logTypeConfig).some(
        ([key, value]) =>
          value.filterBy === "category" &&
          (key.toLowerCase() === event.category.toLowerCase() ||
            normalizeString(key) === normalizeString(event.category)),
      );
      const flag = logTypeFilter.some((key: string) => {
        if (logTypeConfig[key].filterBy === "category") {
          if (
            key.toLowerCase() === event.category.toLowerCase() ||
            normalizeString(key) === normalizeString(event.category)
          ) {
            return true;
          }
        } else if (logTypeConfig[key].filterBy === "nodeType") {
          if (key === event.notesType && !isCategoryMatch) {
            return true;
          }
        }
        return false;
      });
      if (flag) {
        filteredData.push({
          ...event,
          isExpandable: event.payload
            ? logTypeFilter.includes("interfaceLogs")
            : false,
        });
      }
    });
    return filteredData;
  };

  const versionFilterOptions = useMemo(() => {
    let filtered = orderTimelineData?.timeline
      ? [...orderTimelineData?.timeline]
      : [];

    if (logTypeFilter.length > 0) {
      filtered = handleFilter(filtered);
    } else {
      filtered = [];
    }

    const versions = new Set<number>();
    filtered.forEach((event) => {
      if (event.version) versions.add(event.version);
    });

    const tabs = [{ key: "0", label: "Consolidated View" }];
    Array.from(versions)
      .sort((a, b) => b - a)
      .forEach((v) => tabs.push({ key: v.toString(), label: `Version ${v}` }));

    return tabs;
  }, [logTypeFilter, timelineData]);

  const displayedEvents = useMemo(() => {
    let filtered = [...timelineData];

    if (logTypeFilter.length > 0) {
      filtered = handleFilter(filtered);
    } else {
      filtered = [];
    }

    if (versionFilter !== "0") {
      filtered = filtered.filter((e) => e.version === Number(versionFilter));
    }

    return filtered;
  }, [timelineData, logTypeFilter, versionFilter]);

  const remainingCount = useMemo(() => {
    let count =
      orderTimelineData?.pagination?.totalElements -
      orderTimelineData?.timeline?.length;
    if (count < 0) count = 0;
    return count;
  }, [orderTimelineData]);

  const daysPastDue = useMemo(() => {
    return normalizeString(orderRecord?.u_state || "") === "completed"
      ? 0
      : getPassedDays(orderRecord?.u_due_date);
  }, [orderRecord]);

  useEffect(() => {
    if (orderId) {
      fetchOrderActivity({});
      fetchOrderSummary();
    }
  }, [orderId]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toaster />
      {!isFromBossOm && (
        <>
          <Header onSearch={handleSearch} isLoading={isLoading} />

          {/* Compact Order Info Bar */}
          <CompactOrderBar
            order={orderRecord}
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
            isLoading={orderSummaryFetching}
            isMilestoneLoading={isMilesTonesFetching}
            daysPastDue={daysPastDue}
          />
        </>
      )}

      <main className="flex-1 overflow-auto">
        {displayMode === "timeline" && (
          <div className="max-w-500 mx-auto pb-6">
            {!orderId ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6 lg:mx-12 my-4">
                <p className="text-blue-800 text-sm flex items-center gap-2">
                  <Info className="w-5 h-5" /> Please provide your order number
                  to continue.
                </p>
              </div>
            ) : (
              <>
                {currentView === "timeline" && (
                  <>
                    {/* Order Tracker Summary Bar */}
                    <OrderTrackerBar
                      order={orderRecord}
                      isLoading={orderSummaryFetching}
                      daysPastDue={daysPastDue}
                      isExpanded={isTrackerBarExpanded}
                      onToggle={() => setIsTrackerBarExpanded((prev) => !prev)}
                    />

                    <OrderTracker
                      onRefresh={() =>
                        fetchMilestone(orderPayload, collectionOfMilestone)
                      }
                      isLoading={isMilesTonesFetching}
                      isFromBossOM={isFromBossOm}
                    />

                    <TimelineView
                      onRefresh={handleRefresh}
                      events={displayedEvents}
                      expandedEventIds={expandedEventIds}
                      onToggleEvent={handleToggleEvent}
                      setExpandedEventIds={setExpandedEventIds}
                      versionSummary={versionSummary}
                      logTypeFilter={logTypeFilter}
                      versionFilter={versionFilter}
                      currentView={currentView}
                      onLogTypeChange={handleLogTypeChange}
                      onVersionChange={handleVersionChange}
                      onViewChange={setCurrentView}
                      versionFilterOptions={versionFilterOptions}
                      isLoading={isLoading}
                      disabled={!orderId}
                      isFromBossOm={isFromBossOm}
                      footer={
                        !pagination.isLastPage && (
                          <div className="flex justify-center items-center gap-3 mt-6">
                            <Button
                              onClick={handleLoadMore}
                              variant="outline"
                              disabled={activityLoading}
                            >
                              Load More Events{" "}
                              {/*
                              {remainingCount
                                ? `(${remainingCount} remaining)`
                                : ""}
                              */}
                            </Button>
                            <Button
                              onClick={handleLoadAll}
                              variant="default"
                              disabled={allActivityLoading}
                            >
                              Load All Entries
                            </Button>
                          </div>
                        )
                      }
                    />
                  </>
                )}
                {currentView === "table" && (
                  <LogTableView events={displayedEvents} />
                )}

                {/* Load More Button */}
              </>
            )}
          </div>
        )}
        {displayMode === "taskboard" && (
          // <TaskBoardView events={timelineData} />
          <OrderTrackerGraph />
          // <OrderVersionGraph />
        )}
      </main>
    </div>
  );
}
