"use client";

import React, {
  memo,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import TimelineItem from "./TimelineItem";
import GroupedTimelineItem from "./GroupedTimelineItem";
import TimelineContentSkeleton from "../common/TimelineContentSkeleton";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { groupTimelineEventsByTitle } from "@/lib/utils/timelineGrouping";
import {
  toggleTimelineFilter,
  setActiveView,
  resetOnRefresh,
} from "@/lib/redux/slices/orderSlice";
import {
  useLazyGetOrderTimelineBypageQuery,
  useLazyGetOrderTimelineQuery,
} from "@/lib/redux/service/query/endpoints/orderTimelineApi";
import TimelineVersionTabs from "./OrderDynamicTab";
import { ITEM_PER_PAGE } from "@/lib/constants/localConstants";

import OrderSidebar from "./OrderSideBar";
import { formatTimestamp } from "@/lib/utils/helpers";

interface OrderTimelineProps {
  isFromBossOm?: boolean;
}

const OrderTimeline: React.FC<OrderTimelineProps> = memo(
  ({ isFromBossOm = false }) => {
    const dispatch = useAppDispatch();

    const {
      orderId,
      pagination,
      orderTimelineData,
      loadAllData,
      activeView,
      timelineFilter,
    } = useAppSelector((state) => state.order);

    const [clientPage, setClientPage] = useState(1);
    const [notesType, setNotesType] = useState<any>([]);
    const [expanded, setExpanded] = useState<string[] | null>(null);

    const [getTimeLineData, { isFetching: isTimelineFetching }] =
      useLazyGetOrderTimelineBypageQuery();

    const [getAllTimeLineData, { isFetching: isAllTimelineFetching }] =
      useLazyGetOrderTimelineQuery();

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const shouldRestoreScrollRef = useRef(false);

    useLayoutEffect(() => {
      if (!shouldRestoreScrollRef.current || !bottomRef.current) return;

      bottomRef.current.scrollIntoView({ behavior: "auto", block: "end" });
      shouldRestoreScrollRef.current = false;
    }, [orderTimelineData?.timeline?.length, clientPage]);

    const timelineList = orderTimelineData?.timeline ?? [];

    const dynamicViewTabs = useMemo(() => {
      let filtered = [...timelineList];

      if (timelineFilter.length > 0) {
        filtered = filtered.filter((e) =>
          timelineFilter.includes(e.notesType)
        );
      } else {
        filtered = [];
      }

      const versions = new Set<number>();
      filtered.forEach((e) => e.version && versions.add(e.version));

      const tabs = [
        { key: "0", label: "Consolidated View", mobileLabel: "All" },
      ];

      Array.from(versions)
        .sort((a, b) => b - a)
        .forEach((v) =>
          tabs.push({
            key: v.toString(),
            label: `Version ${v}`,
            mobileLabel: `V${v}`
          })
        );

      return tabs;
    }, [timelineFilter, timelineList]);

    const expandedKeys = useMemo(
      () => expanded ?? dynamicViewTabs.map((tab) => tab.key),
      [expanded, dynamicViewTabs]
    );

    const toggleSection = (versionKey: string) => {
      setExpanded((prev) => {
        const current = prev ?? dynamicViewTabs.map((tab) => tab.key);
        return current.includes(versionKey)
          ? current.filter((k) => k !== versionKey)
          : [...current, versionKey];
      });
    };

    const filteredTimeline = useMemo(() => {
      let filtered = [...timelineList];

      if (timelineFilter.length > 0) {
        filtered = filtered.filter((e) =>
          timelineFilter.includes(e.notesType)
        );
      } else {
        filtered = [];
      }

      if (activeView !== "0") {
        filtered = filtered.filter(
          (e) => e.version === Number(activeView)
        );
      }

      return filtered;
    }, [timelineList, timelineFilter, activeView]);

    const paginatedTimeline = useMemo(
      () =>{
        if(clientPage > 0){
          return filteredTimeline.slice(0, clientPage * ITEM_PER_PAGE)
        }else{
          return filteredTimeline
        }
      },[filteredTimeline, clientPage]
    );

    const handleLoadMore = () => {
      shouldRestoreScrollRef.current = true;
      if (loadAllData) {
        setClientPage((p) => p + 1);
      } else {
        setClientPage((prev) => prev + 1);

        getTimeLineData({
          orderId,
          page: pagination.page + 1,
          size: pagination.size,
          loadedDetails: notesType
        });
      }
    }

    const findCatagaryDataLoad = () => {
      if (!timelineFilter?.length) return false;
      const isOnlyNotesType = timelineFilter.every((item: any) =>
        notesType.includes(item)
      );
      return !isOnlyNotesType;
    }

    const handleTimelineTab = (tab?: any, isActive?: boolean) => {
      // tab = tab || TIMELINE_TABS.find((item:any)=>{
      //   return timelineFilter.includes(item.id)
      // })
      // if(isActive === undefined){
      //   isActive = true;
      // }
      const orderTimelinefiltered = [...(orderTimelineData?.timeline || [])];
      let filter = JSON.parse(JSON.stringify(timelineFilter)) || [];
      if (tab) {
        if (!isActive) {
          filter.push(tab.id)
        } else {
          filter = timelineFilter.filter(id => {
            return id !== tab.id;
          })
        }
      }
      let filtered = []
      filtered = orderTimelinefiltered.filter((event) => filter.includes(event.notesType));
      if (filtered.length === 0 && filter.length > 0 && ((!isActive && !notesType.includes(tab.id)) || isActive)) {
        setNotesType([...notesType, ...filter]);
        getTimeLineData({
          orderId,
          page: pagination.page + 1,
          size: pagination.size,
          notesType: filter
        })
      }
      dispatch(toggleTimelineFilter(tab.id))
      setClientPage(1);
    }

    const handleLoadAll = async () => {
      shouldRestoreScrollRef.current = true;
      if(!loadAllData){
        await getAllTimeLineData({ orderId });
      }
      setClientPage(0);
    };

    const handleRefreshTimeline = () => {
      dispatch(resetOnRefresh());
      setTimeout(() => {
        getTimeLineData({ orderId });
      }, 0);
    };

    const isLoadMoreDisabled = loadAllData
      ? paginatedTimeline.length >= filteredTimeline.length
      : pagination.isLastPage;

    const hasTimeline = paginatedTimeline.length > 0;

    const hasMoreClientData = clientPage && loadAllData &&
      clientPage * pagination.size < filteredTimeline.length;

    const hasMoreServerData = !loadAllData && !pagination.isLastPage;

    const shouldShowButtons =
      hasTimeline && (hasMoreClientData || hasMoreServerData) && (findCatagaryDataLoad() || hasMoreClientData)

    return (
      <section className="flex h-full gap-8">
        <OrderSidebar
           orderId={orderTimelineData?.orderId}
           timelineFilter={timelineFilter}
           handleTimelineTab={handleTimelineTab}
        />
        <section className="flex-1">
          <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-3 my-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-700">
              Order Timeline
            </h3>

            <TimelineVersionTabs
              tabs={dynamicViewTabs}
              activeKey={activeView}
              onChange={(key) => {
                dispatch(setActiveView(key));
                setClientPage(1);
              }}
              onRefresh={handleRefreshTimeline}
            />
          </div>
        </div>

        {isTimelineFetching || isAllTimelineFetching ? (
          <TimelineContentSkeleton />
        ) : hasTimeline ? (
          <div>
            {dynamicViewTabs
              .filter(v => v.key !== "0")
              .map((tab) => {

                const versionKey = tab.key;
                const isOpen = expandedKeys.includes(versionKey);

                const filteredVersion = paginatedTimeline.filter(
                  n => versionKey == n.version
                );

                const groupedEvents = groupTimelineEventsByTitle(filteredVersion);

                const lastVersionInTimeline = filteredVersion[filteredVersion.length-1];

                return (
                  <div key={versionKey} className="relative">
                    {filteredVersion.length ? <div className={isOpen ? "mb-6" : ""}>
                      <div className="flex items-center gap-4 w-full mb-6">
                        <div className="flex items-center gap-4 
                        cursor-pointer
                        " onClick={() => toggleSection(versionKey)}>

                          <span className="bg-black material-symbols-outlined p-1.5 rounded-full text-sm text-white">Layers
                          </span>
                          <span className="font-semibold text-sm tracking-wide">
                            {String(tab.label).toUpperCase()}
                          </span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <i className="text-sm text-gray-400">
                            {lastVersionInTimeline ? formatTimestamp(lastVersionInTimeline.timestamp) : ""}
                          </i>
                        </div>

                      </div>
                      {isOpen && <div className="timeline-line"></div>}
                      <div
                        className={`transition-all duration-300 overflow-hidden ${isOpen ? "" : "max-h-0"
                          }`}
                      >
                        {groupedEvents.length > 0 && (
                          <div className="flex flex-col gap-4 sm:gap-4 overflow-x-hidden">
                            {groupedEvents.map((groupedEvent, idx) => (
                              <div key={groupedEvent.groupId ?? idx} className="flex items-center">
                                {/* <div className="timeline-horizontal-line"></div> */}
                                <hr className="h-0.5 bg-[#E5E7EB] border-0 w-12 relative left-4.5"/>
                                {groupedEvent.isGroup ? (
                                  <GroupedTimelineItem
                                    events={groupedEvent.events}
                                    title={groupedEvent.title}
                                  />
                                ) : (
                                  <TimelineItem event={groupedEvent.primaryEvent} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                    </div> : <div></div>}
                  </div>
                );
              })}

            <div ref={bottomRef} className="h-1" />
          </div>
        ) : (
          <div className="py-16 sm:py-20 text-center text-sm text-gray-700">
            No timeline available for selected filters
          </div>
        )}

        {shouldShowButtons && (
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 p-4 sm:p-6">
            <button
              disabled={isLoadMoreDisabled}
              onClick={handleLoadMore}
              className="w-full cursor-pointer sm:w-auto rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-500 transition hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Load More
            </button>
            <button
              disabled={isAllTimelineFetching}
              onClick={handleLoadAll}
              className="w-full cursor-pointer sm:w-auto rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-500 transition hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Load All
            </button>
          </div>
        )}
        </section>
      </section>
    );
  }
);

OrderTimeline.displayName = "OrderTimeline";
export default OrderTimeline;
