import React, { memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TimelineEvent } from "@/lib/types/order";
import { STATUS_ICON_BG_CLASS } from "@/lib/constants";
import { formatTimestamp } from "@/lib/utils/helpers";

interface TimelineItemHeaderProps {
  event: TimelineEvent;
  iconName: string;
  isExpanded: boolean;
  isFallOut: boolean;
  onToggle?: () => void;
}

const TimelineItemHeader: React.FC<TimelineItemHeaderProps> = ({
  event,
  iconName,
  isExpanded,
  isFallOut,
  onToggle,
}) => {
  return (
    <div
      className={`flex items-start justify-between gap-4 z-10 p-4 w-full ${
        event.isExpandable ? "cursor-pointer" : ""
      }`}
      onClick={event.isExpandable ? onToggle : undefined}
    >
      <div className="flex flex-col gap-1 min-w-0 w-full">
        <div className="flex gap-1">
          <div className="relative w-12">
            <div
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                STATUS_ICON_BG_CLASS[event.status] ?? STATUS_ICON_BG_CLASS.default
              }`}
            >
              <span className="material-symbols-outlined text-sm text-white">
                {iconName}
              </span>
            </div>
          </div>

          <div className="space-y-2 content-center">
            <div className="text-sm font-semibold text-gray-800 break-words">
              {event.title}
              {event.notesType === "userRemarks" && event.user && (
                <span className="font-normal text-gray-600">
                  {" by "}
                  <span className="font-semibold">{event.user}</span>
                </span>
              )}
            </div>

            {event.description && (
              <div className="text-xs text-gray-500">{event.description}</div>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 absolute right-12 top-6">
          {isFallOut && (
            <span className="ml-2 text-red-500 mr-2.5 font-black text-sm">Fallout</span>
          )}
          {formatTimestamp(event.timestamp)}
        </div>

        {event.isExpandable && (
          <div className="flex-shrink-0 absolute right-5 top-6">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TimelineItemHeader);
