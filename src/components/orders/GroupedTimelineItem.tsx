"use client";

import React, { memo, useMemo, useState } from "react";
import { TimelineEvent } from "@/lib/types/order";
import { STATUS_ICON_MAP } from "@/lib/constants";
import { formatTimestamp, getStatusCardClass } from "@/lib/utils/helpers";
import TimelineItemHeader from "./timeline-item/TimelineItemHeader";

interface GroupedTimelineItemProps {
  events: TimelineEvent[];
  title: string;
}


const getEventSubtitle = (fullTitle: string): string => {
  const parts = fullTitle?.split(" - ") || [];
  return parts.length > 1 ? parts.slice(1).join(" - ").trim() : fullTitle?.trim() || "";
};

const getEventIconAndColor = (
  subtitle: string
): { icon: string; color: string; bgColor: string } => {
  if (subtitle.toLowerCase().includes("completed") || subtitle.toLowerCase().includes("created")) {
    return { icon: "check_circle", color: "text-green-600", bgColor: "bg-green-100" };
  }
  if (subtitle.toLowerCase().includes("updated")) {
    return { icon: "info", color: "text-blue-600", bgColor: "bg-blue-100" };
  }
  if (subtitle.toLowerCase().includes("failed") || subtitle.toLowerCase().includes("error")) {
    return { icon: "error", color: "text-red-600", bgColor: "bg-red-100" };
  }
  return { icon: "circle", color: "text-gray-400", bgColor: "bg-gray-100" };
};

const GroupedTimelineItem: React.FC<GroupedTimelineItemProps> = ({
  events,
  title,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const primaryEvent = events[0];

  const iconName = useMemo(
    () =>
      primaryEvent.status === "fallout" &&
      primaryEvent.errorMessage &&
      primaryEvent.errorMessage.toLowerCase().includes("success") && primaryEvent.notesType
        ? STATUS_ICON_MAP[primaryEvent.notesType] ?? STATUS_ICON_MAP.default
        : STATUS_ICON_MAP[primaryEvent.status] ?? STATUS_ICON_MAP.default,
    [primaryEvent.status, primaryEvent.errorMessage, primaryEvent.notesType]
  );

  const statusCardClass = useMemo(
    () => getStatusCardClass(primaryEvent.status),
    [primaryEvent.status]
  );

  const isFallOut = useMemo(
    () => primaryEvent.status === "fallout",
    [primaryEvent.status]
  );

  const headerEvent = useMemo(
    () => ({
      ...primaryEvent,
      title,
      isExpandable: true,
    }),
    [primaryEvent, title]
  );

  return (
    <div className="w-full">
      <div className="relative flex gap-4 w-full">
        <div className="flex-1 w-full min-w-0">
          <div className={`w-full flex items-center bg-white rounded-xl transition-all duration-300 ${
            isExpanded 
              ? "border border-orange-300 shadow-md" 
              : "border border-gray-100 shadow-sm" //box-shadow: rgba(249, 115, 22, 0.2) 0px 2px 8px 0px;
          }`} style={isExpanded ? { boxShadow: "rgba(249, 115, 22, 0.2) 0px 2px 8px 0px" } : {}}>
            <div className={`w-full ${statusCardClass}`}>
              <TimelineItemHeader
                event={headerEvent}
                iconName={iconName}
                isExpanded={isExpanded}
                isFallOut={isFallOut}
                onToggle={() => setIsExpanded(!isExpanded)}
              />

              <div className={`overflow-y-auto transition-all duration-300 border-t border-gray-100 ${
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
              }`}>
                <div className="space-y-2 pt-2">
                  {events.map((event) => {
                    const eventSubtitle = getEventSubtitle(event.title);

                    return (
                      <div
                        key={event.id}
                        className="p-3 py-2"
                      >
                        <div className="flex items-start gap-2">
                          <div className="shrink-0 mt-0.5 mx-1">
                            {eventSubtitle ? (
                              (() => {
                                const { icon, color, bgColor } = getEventIconAndColor(eventSubtitle);
                                return (
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${bgColor}`}>
                                    <span className={`material-symbols-outlined text-sm ${color}`}>
                                      {icon}
                                    </span>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {eventSubtitle && (
                              <div className="text-sm font-medium text-gray-700">
                                {eventSubtitle}
                              </div>
                            )}
                            
                            {event.description && (
                              <div className="text-xs text-gray-600 mt-0.5">
                                {event.description}
                              </div>
                            )}

                            {event.tableData && event.tableData.length > 0 && (
                              <div className="ml-6 my-1.5 border-l-2 border-gray-200 pl-4">
                                <table className="text-xs">
                                  <tbody>
                                    {event.tableData.map((row) => (
                                      <tr key={row.id}>
                                        <td className="text-gray-500 pr-4 py-1.5">
                                          {row.fieldLabel || row.fieldName}
                                        </td>
                                        <td className="font-medium text-gray-900 py-1.5 max-w-200 wrap-break-word">
                                          {String(row.changedTo || "-")}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 text-xs text-gray-500">
                            {formatTimestamp(event.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(GroupedTimelineItem);
