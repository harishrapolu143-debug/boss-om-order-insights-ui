"use client";

import React, { useCallback, useMemo, useState } from "react";
import { TimelineEvent } from "@/lib/types/order";
import { STATUS_ICON_MAP } from "@/lib/constants";
import { getStatusCardClass, } from "@/lib/utils/helpers";
import TimelineItemHeader from "./timeline-item/TimelineItemHeader";
import ExpandableTimelineContent from "./timeline-item/ExpandableTimelineContent";
import InlineObjectNote from "./timeline-item/InlineObjectNote";

interface TimelineItemProps {
    event: TimelineEvent;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleTimelineData = useCallback(() => setIsExpanded((v) => !v), []);

    const objectNote = useMemo(() => {
        if (
            typeof event.note === "object" &&
            event.note !== null &&
            !Array.isArray(event.note)
        ) {
            return event.note as Record<string, unknown>;
        }

        return null;
    }, [event.note]);

    const isFallOut = useMemo(
        () =>
            event.status === "fallout" &&
            event.errorMessage &&
            !event.errorMessage.toLowerCase().includes("success"),
        [event.status, event.errorMessage]
    );

    const iconName = useMemo(
        () =>
            event.status === "fallout" &&
                event.errorMessage &&
                event.errorMessage.toLowerCase().includes("success") && event.notesType
                ? STATUS_ICON_MAP[event.notesType] ?? STATUS_ICON_MAP.default
                : STATUS_ICON_MAP[event.status] ?? STATUS_ICON_MAP.default,
        [event.status, event.errorMessage, event.notesType]
    );

    const statusCardClass = useMemo(
        () => getStatusCardClass(event.status),
        [event.status]
    );

    return (
        <div className="w-full">
            <div className="relative flex gap-4 w-full">
                <div className="flex-1 w-full min-w-0">
                    <div
                        className={`w-full flex items-center bg-white border border-gray-100 rounded-xl shadow-sm transition-all
        ${isExpanded ? "shadow-md" : ""}`}
                    >
                        <div className={`w-full ${statusCardClass}`}>
                            <TimelineItemHeader
                                event={event}
                                iconName={iconName}
                                isExpanded={isExpanded}
                                isFallOut={Boolean(isFallOut)}
                                onToggle={toggleTimelineData}
                            />

                            <ExpandableTimelineContent
                                event={event}
                                isExpanded={isExpanded}
                                isFallOut={Boolean(isFallOut)}
                            />

                            {!event.isExpandable && objectNote && (
                                <div className="px-4 pb-4">
                                    <InlineObjectNote note={objectNote} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineItem;