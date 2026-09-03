import React, { useEffect, useMemo, useState } from "react";
import { EventCard } from "./EventCard";
import { FilterBar } from "./FilterBar";
import { motion } from "motion/react";
import {
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { TimelineEvent } from "@/lib/types/order";
import {
  emailToName,
  formatDateTime,
  sortTimelineByDate,
  splitByLastDash,
} from "@/lib/utils/helpers";
import { normalizeString } from "../utils/normalize";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { resetOnRefresh } from "@/lib/redux/slices/orderSlice";
import OrderTimelinePageSkeleton from "@/components/common/OrderTimelineSkeleton";
import { mapRepeatedTaskVersions } from "@/lib/utils/mapRepeatedTaskVersions";
import { cn } from "./ui/utils";

interface TimelineViewProps {
  events: TimelineEvent[];
  expandedEventIds: string[];
  onToggleEvent: (id: string) => void;
  setExpandedEventIds: React.Dispatch<React.SetStateAction<string[]>>;
  versionSummary: Record<string, any>;
  footer?: React.ReactNode;
  // FilterBar props
  logTypeFilter: string[];
  versionFilter: string;
  currentView: "timeline" | "table";
  onLogTypeChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onViewChange: (view: "timeline" | "table") => void;
  versionFilterOptions: { key: string; label: string }[];
  isLoading?: boolean;
  disabled?: boolean;
  isFromBossOm?: boolean;
  onRefresh?: () => void;
}

const getSubTaskIconStatus = (title?: string) => {
  if (typeof title === "string") {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("fallout") || lowerTitle.includes("fail")) {
      return "error";
    } else if (lowerTitle.includes("completed")) {
      return "task_completed";
    } else if (lowerTitle.includes("on hold")) {
      return "task_updated";
    } else {
      return "task_created";
    }
  }
};

interface RequestData {
  sys_id?: string;
  u_sales_channel?: string;
  u_agent_id?: string;
  u_notes?: string;
  u_version?: string;
  u_products?: string;
  u_reward?: string;
  u_request_type?: string;
  u_due_date?: string;
}

function generateSummary(data: RequestData): string {
  const salesChannel: string = data.u_sales_channel
    ? data.u_sales_channel
    : "Unknown Channel";
  const customerName = data.u_agent_id ? emailToName(data.u_agent_id) : "";

  const actionServices: string[] = [];
  if (data.u_due_date) {
    actionServices.push(`update <b>due date to ${data.u_due_date}</b>`);
  } else if (data.u_notes) {
    data.u_notes.split(",").forEach((note: string) => {
      const trimmedNote = note.trim();

      // Example:
      // Voice-New Service
      // VAS-Update Service

      const parts: string[] = trimmedNote.split("-");

      const serviceName: string = parts[0]?.trim();

      let action = "update";

      const lowerNote = trimmedNote.toLowerCase();

      if (lowerNote.includes("cancel")) {
        action = "cancel";
      } else if (lowerNote.includes("new")) {
        action = "add";
      } else if (lowerNote.includes("update")) {
        action = "update";
      }

      if (serviceName) {
        actionServices.push(`${action} <b>${serviceName}</b>`);
      }
    });
  }

  // remove duplicates
  const uniqueActionServices: string[] = [...new Set(actionServices)];

  let actionText = "update <b>service</b>";

  if (uniqueActionServices.length === 1) {
    actionText = uniqueActionServices[0];
  } else if (uniqueActionServices.length > 1) {
    actionText =
      uniqueActionServices.slice(0, -1).join(", ") +
      " and " +
      uniqueActionServices.slice(-1);
  }

  return `<b class="capitalize">${customerName}</b> submitted a ${
    data.u_request_type || "service"
  } request through <b>${salesChannel}</b> to ${actionText}.`;
}

export const isValidActivity = (event: TimelineEvent) => {
  return Boolean(
    (event.groupedData && event.groupedData.length > 0) ||
    event.note ||
    event.apiDetails ||
    event.retry ||
    event.isExpandable ||
    (event.payload && typeof event.payload === "object") ||
    (Array.isArray(event.customerInteraction) &&
      event.customerInteraction.length > 0),
  );
};

export const TimelineView: React.FC<TimelineViewProps> = ({
  events = [],
  expandedEventIds = [],
  onToggleEvent,
  setExpandedEventIds,
  versionSummary,
  footer,
  logTypeFilter,
  versionFilter,
  currentView,
  onLogTypeChange,
  onVersionChange,
  onViewChange,
  versionFilterOptions,
  disabled,
  isFromBossOm = false,
  onRefresh,
  isLoading,
}) => {
  // All versions expanded by default
  const [detailsOn, setDetailsOn] = useState(true);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(() => {
    if (!events || events.length === 0) return new Set();
    const versions = [
      ...new Set(events.map((e) => e?.version).filter((v) => v !== undefined)),
    ];
    return new Set(versions.map((v) => `Version ${v}`));
  });
  const dispatch = useAppDispatch();

  const { orderMilestones, bossOMPage } = useAppSelector(
    (state) => state.order,
  );

  const mappedEvents = useMemo(() => {
    return mapRepeatedTaskVersions(events);
  }, [events]);

  const { taskNameGroupedEvents, summary } = useMemo(() => {
    const summary: Record<string, any> = {};
    const taskNameGroupedEvents = sortTimelineByDate(mappedEvents || [])
      .filter((events) => {
        if (events.title) {
          return true;
        }
        return isValidActivity(events);
      })
      .reduce(
        (acc, event) => {
          if (!event || event.version === undefined) return acc;
          const versionKey = `Version ${event.version}`;
          if (
            versionSummary[event.version] &&
            Number(event.version) > 1 &&
            !summary[versionKey]
          ) {
            summary[versionKey] = versionSummary[event.version];
          }
          if (!acc[versionKey]) {
            acc[versionKey] = [];
          }
          if (event.groupKey) {
            const {
              status,
              id,
              timestamp,
              actualTimestamp,
              version,
              isCase,
              groupKey,
              seqNumber,
            } = event;
            const groupIndex = acc[versionKey].findIndex(
              (item: TimelineEvent) => item.groupKey === groupKey,
            );
            const iconStatus = getSubTaskIconStatus(event.title);
            if (groupIndex !== -1) {
              acc[versionKey][groupIndex].groupedData?.push({
                ...event,
                subTaskTitle: event.title,
                ...(!event.isCase && { iconStatus }),
              });
            } else {
              acc[versionKey].push({
                id,
                title: event.parentTitle || event.title,
                status,
                timestamp,
                actualTimestamp,
                groupedData: [
                  {
                    ...event,
                    subTaskTitle: event.title,
                    ...(!event.isCase && { iconStatus }),
                  },
                ],
                version,
                isCase,
                groupKey,
                seqNumber,
              });
            }
          } else {
            acc[versionKey].push(event);
          }

          return acc;
        },
        {} as Record<string, TimelineEvent[]>,
      );
    return { taskNameGroupedEvents, summary };
  }, [mappedEvents, versionSummary]);

  const getRecordTitle = (
    retry: unknown,
    parentTitle?: string,
    fallback?: string,
  ): string => {
    let value = "";

    if (typeof retry === "string" && retry.trim()) {
      value = retry;
    } else if (Array.isArray(retry) && retry.length > 0) {
      value = String(retry[0]);
    } else {
      value = parentTitle || fallback || "";
    }

    // const index = value.indexOf("-");
    // return index !== -1 ? value.substring(0, index).trim() : value;
    return value;
  };

  const getGroupStatusColor = (items: TimelineEvent[]): string | undefined => {
    if (!items?.length) return undefined;
    return items[0]?.statusColor;
  };

  const groupedEvents = useMemo(() => {
    const result: Record<string, TimelineEvent[]> = {};

    if (!taskNameGroupedEvents) return result;

    const getUniqueKey = (i: TimelineEvent) => {
      let baseKey = "";
      const normalizeCategory = normalizeString(i.category || "");
      if (normalizeCategory === "boss_dispatch") {
        baseKey = i.titleFormatter
          ? i.titleFormatter(i)
          : i.title + "_" + i?.note?.taskStatus;
      } else if (normalizeCategory === "neustar") {
        baseKey = `${i.title}_${i.note?.eventType}`;
      } else if (
        ["o2", "brim", "email", "bsw", "ont"].includes(normalizeCategory) ||
        (typeof i.retry === "string" && i.retry.trim())
      ) {
        baseKey = `${i.title}_${i.id}`;
      } else {
        baseKey = i.title + "_" + (i?.notesType || '');
      }
      return normalizeString(baseKey);
    };

    Object.entries(taskNameGroupedEvents).forEach(([versionKey, events]) => {
      const sortedEvents = sortTimelineByDate(events, true);
      const formatted: TimelineEvent[] = [];

      const globalSeen = new Set<string>(); // ✅ top-level dedupe

      for (const item of sortedEvents) {
        const itemKey = getUniqueKey(item);

        if (globalSeen.has(itemKey)) continue;
        globalSeen.add(itemKey);

        const sortedGroupedData = sortTimelineByDate(
          item.groupedData || [],
          true,
        );

        if (!sortedGroupedData.length) {
          formatted.push(item);
          continue;
        }

        const caseMap: Record<string, TimelineEvent> = {};
        const caseSetMap: Record<string, Set<string>> = {};

        const retryMap: Record<
          string,
          TimelineEvent & { _retrySet: Set<string> }
        > = {};

        const others: TimelineEvent[] = [];
        const seen = new Set<string>(); // ✅ groupedData dedupe

        for (const i of sortedGroupedData) {
          const uniqueKey = getUniqueKey(i);

          if (seen.has(uniqueKey)) continue;
          seen.add(uniqueKey);

          const key = i.parentTitle || i.title || "default";

          if (i.isCase) {
            if (!caseMap[key]) {
              caseMap[key] = {
                ...i,
                title: i.parentTitle || i.title,
                subTaskTitle: i.title,
                groupedData: [i],
                timelineHeader: "Case Timeline",
                statusColor: i.statusColor,
              };
              caseSetMap[key] = new Set();
            } else {
              const caseKey = getUniqueKey(i);
              if (!caseSetMap[key].has(caseKey)) {
                caseSetMap[key].add(caseKey);
                caseMap[key].groupedData!.push({
                  ...i,
                  subTaskTitle: i.title,
                });
              }
            }
          } else if (
            typeof i.retry === "string" &&
            i.retry.trim() &&
            i.parentTitle
          ) {
            if (!retryMap[key]) {
              retryMap[key] = {
                ...i,
                _retrySet: new Set<string>(),
                statusColor: i.statusColor,
              };
            }

            retryMap[key]._retrySet.add(i.retry);
          } else {
            others.push(i);
          }
        }

        const retryValues: TimelineEvent[] = Object.values(retryMap).map(
          ({ _retrySet, ...rest }) => ({
            ...rest,
            retry: Array.from(_retrySet),
          }),
        );

        const groupedData: TimelineEvent[] = [
          ...Object.values(caseMap),
          ...retryValues,
          ...others,
        ];

        const groupedSeen = new Set<string>();

        const finalGroupedData = groupedData.filter((g) => {
          const key = getUniqueKey(g);
          if (groupedSeen.has(key)) return false;
          groupedSeen.add(key);
          return true;
        });
        if (finalGroupedData.length > 1) {
          const systemInfo = sortedGroupedData.filter(
            (d) => d.sourceSystem && d.destinationSystem,
          );

          const titleSource = sortedGroupedData.find(
            (r) =>
              typeof r.parentTitle === "string" &&
              r.parentTitle.trim() &&
              !r.isCase,
          );

          const groupStatusColor = sortedGroupedData[0]?.statusColor;

          formatted.push({
            ...item,
            groupedData: sortTimelineByDate(finalGroupedData, true),
            statusColor: groupStatusColor,
            sourceSystem: systemInfo[0]?.sourceSystem,
            destinationSystem:
              systemInfo[systemInfo.length - 1]?.destinationSystem,
            title: getRecordTitle(
              titleSource?.retry,
              titleSource?.parentTitle,
              item.title,
            ),
          });
        } else if (finalGroupedData.length === 1) {
          formatted.push({
            ...finalGroupedData[0],
            title: getRecordTitle(
              finalGroupedData[0]?.retry,
              finalGroupedData[0].parentTitle,
              finalGroupedData[0].title,
            ),
            statusColor: finalGroupedData[0].statusColor,
          });
        } else {
          formatted.push(item);
        }
      }

      result[versionKey] = formatted.sort((a, b) => {
        const aStartTime = a.groupedData?.at(-1)?.timestamp;
        const bStartTime = b.groupedData?.at(-1)?.timestamp;
        const timeA = new Date(aStartTime ? aStartTime : a.timestamp).getTime();
        const timeB = new Date(bStartTime ? bStartTime : b.timestamp).getTime();
        if (timeA < timeB) return 1;
        if (timeA > timeB) return -1;
        return 0;
      });
    });

    return result;
  }, [taskNameGroupedEvents]);

  const versions = Object.keys(groupedEvents).sort((a, b) => {
    const versionA = parseInt(a.replace("Version ", ""));
    const versionB = parseInt(b.replace("Version ", ""));
    return versionB - versionA; // Descending order
  });

  console.log(groupedEvents, "groupedEvents");

  const toggleVersion = (version: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  const expandVersions = (version: string[]) => {
    const newExpanded = new Set(version);
    setExpandedVersions(newExpanded);
  };

  // const expandTasks = (versionEvent: TimelineEvent[]) => {
  //   setExpandedEventIds(() => {
  //     let prevState: string[] = [];
  //     versionEvent.forEach((e) => {
  //       const normalizeCategory = normalizeString(e.category || "");
  //       if (
  //         isValidActivity(e) &&
  //         normalizeCategory !== "brim" &&
  //         normalizeCategory !== "o2"
  //       )
  //         prevState.push(e.id);
  //     });
  //     return prevState;
  //   });
  // };

  const handleExpand = () => {
    window.parent.postMessage(
      {
        type: "BUTTON_CLICKED",
        payload: {},
      },
      "*",
    );
  };

  const handleExpandAll = (
    versionEvent: TimelineEvent[],
    isExpandAll: boolean,
  ) => {
    setExpandedEventIds((prev) => {
      let prevState = [...prev];
      if (isExpandAll) {
        prevState = prevState.filter((id) =>
          versionEvent.every((e) => e.id !== id),
        );
      } else {
        versionEvent.forEach((e) => {
          if (!prevState.includes(e.id) && isValidActivity(e))
            prevState.push(e.id);
        });
      }
      return prevState;
    });
  };

  const handleRefresh = () => {
    dispatch(resetOnRefresh());
    if (onRefresh) onRefresh();
  };

  useEffect(() => {
    expandVersions(versions);
    // expandTasks(Object.values(groupedEvents).flat(1));
  }, [events]);

  const isHaveMilestones = orderMilestones?.isHaveMilestones;
  const isStickyDisabled = isFromBossOm && !bossOMPage;

  return (
    <>
      <div
        className={cn(
          "sticky bg-[#F9FAFB] rounded-sm z-50 px-6 lg:px-12",
          isHaveMilestones ? "" : "py-1 bg-[#F9FAFB]",
        )}
        style={{
          top:
            isHaveMilestones && !isStickyDisabled
              ? "var(--milestone-height)"
              : "0",
        }}
      >
        <div className="milestones-header pb-0!">
          <div
            className={`flex justify-between items-center pb-4 ${detailsOn && "border-b  border-[#d7e0ee]"}`}
          >
            <div>
              <h2>Order Activity</h2>
              <p>
                View a timeline of your order’s journey, including status
                updates and key events.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {bossOMPage &&
                orderMilestones &&
                Object.keys(orderMilestones?.milestones || {}).length === 0 && (
                  <button
                    type="button"
                    onClick={handleExpand}
                    title="Open application in a new tab"
                    aria-label="Open application in a new tab"
                    className="group inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                )}
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-all px-2.5 py-1.5 rounded-lg shadow-sm"
              >
                <RefreshCcw
                  className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <label
                className="toggle-wrap"
                aria-label="Toggle milestone details"
              >
                <span>{detailsOn ? "Details On" : "Details Off"}</span>
                <input
                  type="checkbox"
                  checked={detailsOn}
                  onChange={(e) => setDetailsOn(e.target.checked)}
                />
                <span className={`switch ${detailsOn ? "on" : "off"}`}>
                  <span className="switch-thumb" aria-hidden="true" />
                </span>
              </label>
            </div>
          </div>
          {detailsOn && (
            <FilterBar
              logTypeFilter={logTypeFilter}
              versionFilter={versionFilter}
              currentView={currentView}
              onLogTypeChange={onLogTypeChange}
              onVersionChange={onVersionChange}
              onViewChange={onViewChange}
              versionFilterOptions={versionFilterOptions}
              isLoading={isLoading}
              disabled={disabled}
              isFromBossOm={isFromBossOm}
            />
          )}
        </div>
      </div>
      {detailsOn && (
        <>
          {isLoading ? (
            <div className="my-4 border border-gray-200 rounded-xl py-4 bg-white shadow-sm mx-8 lg:mx-14">
              <OrderTimelinePageSkeleton hideHeader />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p className="text-lg">No events found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="flex justify-center mt-3 px-8 lg:px-14">
              <div className=" flex-1">
                {versions.map((version, stageIndex) => {
                  const versionEvents = groupedEvents[version];
                  const isVersionExpanded = expandedVersions.has(version);
                  const isExpandAll = versionEvents.every(
                    (e: TimelineEvent) =>
                      expandedEventIds.includes(e.id) || !isValidActivity(e),
                  );
                  const firstEvent = versionEvents.at(-1)?.groupedData?.at(-1);
                  const lastEvent = versionEvents[0]?.groupedData?.[0];
                  const eventStartTime = firstEvent
                    ? firstEvent.timestamp
                    : versionEvents.at(-1)?.timestamp;
                  const eventEndTime = lastEvent
                    ? lastEvent.timestamp
                    : versionEvents[0]?.timestamp;
                  return (
                    <div key={version} className="relative">
                      {stageIndex < versions.length - 1 && (
                        <div className="absolute left-5 top-full w-0.5 h-4 bg-gray-300 z-1" />
                      )}
                      <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white shadow-sm">
                        <div
                          className={`px-5 py-3 border-b cursor-pointer flex items-center gap-3 bg-amber-50 border-amber-200`}
                          onClick={() => toggleVersion(version)}
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 bg-amber-400`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-gray-900">
                                {version}
                              </span>
                            </div>
                            {/* Version Summary */}
                            {/* {summary[version] && (
                    <div className="flex flex-wrap gap-1">
                      {summary[version].notes && (
                        <p className="text-xs text-gray-500 truncate">
                          {summary[version].notes}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {summary[version].eventType && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 leading-none">
                            <span className="text-blue-400">Event</span>
                            {summary[version].eventType}
                          </span>
                        )}
                        {summary[version].salesChannel && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded px-1.5 py-0.5 leading-none">
                            <span className="text-purple-400">Channel</span>
                            {summary[version].salesChannel}
                          </span>
                        )}
                        {summary[version].agentId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5 leading-none">
                            <span className="text-green-400">Agent</span>
                            {summary[version].agentId}
                          </span>
                        )}
                      </div>
                    </div>
                  )} */}
                            {summary[version] && (
                              <p
                                className="text-xs text-gray-500 mt-0.5 truncate"
                                dangerouslySetInnerHTML={{
                                  __html: generateSummary(summary[version]),
                                }}
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs flex-shrink-0">
                            {isVersionExpanded && (
                              <span
                                className="text-xs text-blue-500 underline hover:text-blue-800 cursor-pointer inline-flex items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExpandAll(versionEvents, isExpandAll);
                                }}
                              >
                                {isExpandAll ? (
                                  <>
                                    <ArrowUp className="w-4 h-4" />
                                    <span>Collapse All</span>
                                  </>
                                ) : (
                                  <>
                                    <ArrowDown className="w-4 h-4" />
                                    <span>Expand All</span>
                                  </>
                                )}
                              </span>
                            )}
                            <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                              {versionEvents.length}{" "}
                              {versionEvents.length > 1 ? "Entries" : "Entry"}
                            </span>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${isVersionExpanded ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="px-5 py-2 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs text-gray-500">
                            {formatDateTime(eventStartTime)} -{" "}
                            {formatDateTime(eventEndTime)}
                          </span>
                        </div>

                        {/* Stage Events */}
                        {isVersionExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-5 pt-4 pb-2 space-y-3 max-w-400 mx-auto"
                          >
                            {versionEvents.map(
                              (event: TimelineEvent, index: number) => (
                                <div key={`${event.id}-${index}`}>
                                  <EventCard
                                    event={event}
                                    isExpanded={expandedEventIds.includes(
                                      event.id,
                                    )}
                                    onToggle={() => onToggleEvent(event.id)}
                                  />
                                </div>
                              ),
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {footer}
        </>
      )}
    </>
  );
};
