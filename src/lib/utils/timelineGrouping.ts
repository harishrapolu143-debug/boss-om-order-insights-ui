import { TimelineEvent } from "@/lib/types/order";

export interface GroupedTimelineEvent {
  groupId: string;
  isGroup: boolean;
  primaryEvent: TimelineEvent;
  events: TimelineEvent[];
  title: string;
}


function extractGroupingKey(title: string): string {
  const trimmed = title?.trim() || "";
  const parts = trimmed.split(" - ");
  return parts[0]?.trim() || trimmed;
}

export function groupTimelineEventsByTitle(
  events: TimelineEvent[]
): GroupedTimelineEvent[] {
  if (!events || events.length === 0) {
    return [];
  }

  const grouped: GroupedTimelineEvent[] = [];
  let currentGroup: TimelineEvent[] = [];
  let currentGroupingKey: string | null = null;

  events.forEach((event, index) => {
    const groupingKey = extractGroupingKey(event.title);

    if (currentGroupingKey === groupingKey && currentGroup.length > 0) {
      currentGroup.push(event);
    } else {
      if (currentGroup.length > 0) {
        grouped.push(createGroupedEvent(currentGroup));
      }

      currentGroup = [event];
      currentGroupingKey = groupingKey;
    }

    if (index === events.length - 1) {
      grouped.push(createGroupedEvent(currentGroup));
    }
  });

  return grouped;
}

function createGroupedEvent(events: TimelineEvent[]): GroupedTimelineEvent {
  const primaryEvent = events[0];
  const isGroup = events.length > 1;
  
  const groupTitle = isGroup 
    ? extractGroupingKey(primaryEvent.title)
    : primaryEvent.title || "";

  return {
    groupId: isGroup
      ? events.map((e) => e.id).join("-")
      : primaryEvent.id,
    isGroup,
    primaryEvent,
    events,
    title: groupTitle,
  };
}
