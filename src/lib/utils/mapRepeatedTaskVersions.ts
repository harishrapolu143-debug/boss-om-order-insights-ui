import { TimelineEvent } from "@/lib/types/order";

export const mapRepeatedTaskVersions = (events: TimelineEvent[]): TimelineEvent[] => {
    if (!Array.isArray(events) || events.length === 0) {
        return [];
    }

    const repeatedGroupKeys = new Set<string>();

    events.forEach((event) => {
        if (event.groupKey) {
            repeatedGroupKeys.add(event.groupKey);
        }
    });

    const latestVersionMap: Record<string, number> = {};

    events.forEach((event) => {
        if (event.groupKey && repeatedGroupKeys.has(event.groupKey) && event.version !== undefined) {
            latestVersionMap[event.groupKey] = Math.max(latestVersionMap[event.groupKey] || 0, Number(event.version));
        }
    });

    return events.map((event) => {
        const latestVersion = event.groupKey ? latestVersionMap[event.groupKey] : undefined;

        if (latestVersion !== undefined && event.version !== undefined && Number(event.version) < latestVersion) {
            return {
                ...event,
                version: latestVersion,
                olderVersion: event.version,
            };
        }

        return event;
    });
};