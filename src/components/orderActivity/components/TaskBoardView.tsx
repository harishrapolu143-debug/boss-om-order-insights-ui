import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  RotateCw,
  Phone,
  User,
  Settings,
  Zap,
  Filter,
  XCircle,
  PlayCircle,
  PauseCircle,
  X,
} from "lucide-react";
import { Badge } from "./ui/badge/badge";
import { Button } from "./ui/button/button";

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  actor: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  stage: string;
  notesType?: string;
  version?: number;
  sourceSystem?: string;
  destinationSystem?: string;
  details?: any;
  payload?: Record<string, any>;
  tableData?: any[];
  apiDetails?: {
    url: string;
    method: string;
    request: Record<string, any>;
    response: Record<string, any>;
  };
  retryAttempt?: number;
  retryCount?: number;
  retryHistory?: Array<{
    attempt: number;
    status: 'failed' | 'completed';
    timestamp: string;
    error?: string;
  }>;
  expectedCompletionTime?: string;
  actualCompletionTime?: string;
  delayMinutes?: number;
}

interface TaskBoardViewProps {
  events: TimelineEvent[];
}

type FilterType =
  | "all"
  | "failed"
  | "in_progress"
  | "user_updated"
  | "latest_version"
  | "delayed";

// Milestone to stage mapping
const MILESTONE_TO_STAGE: Record<string, string> = {
  // Dispatch
  "Dispatch Planning sent": "Dispatch",
  "Dispatch Sent": "Dispatch",
  "Installation Pending": "Dispatch",
  "Dispatch Completed": "Dispatch",
  "Create Dispatch Planning Job": "Dispatch",

  // Billing
  "BRIM Ready": "Billing",
  Billing: "Billing",
  "Billing Completed": "Billing",
  "BRIM: Convert BAN in Biller": "Billing",
  "Create Subscription Order in BRIM": "Billing",
  "Start Billing": "Billing",

  // Provisioning
  "Pre-Provision Subscriber": "Provisioning",
  "Pre-Provision ONT": "Provisioning",
  "Network Assignment": "Provisioning",
  "Network Assignment Completed": "Provisioning",
  "RG Serial Number updated": "Provisioning",
  "RG Association completed": "Provisioning",
  "Device association in calix cloud completed": "Provisioning",
  "Subscriber association in calix cloud completed": "Provisioning",
  "Service association in calix cloud completed": "Provisioning",
  "ONT Activation completed": "Provisioning",
  "Activation In Progress": "Provisioning",
  "Activation Completed": "Provisioning",
  "Provision Completed": "Provisioning",
  "Provisioning Complete": "Provisioning",
  "Add Subscriber in Calix": "Provisioning",

  // Voice / Order Processing
  New: "Voice",
  "HSI Fiber Order Started": "Voice",
  "HSI Fiber Order Completed": "Voice",
  "Create Account in Alianza": "Voice",
  "Notify Order CONFIRMED to Neustar": "Voice",
  "Notify Order COMPLETED to Neustar": "Voice",

  // Completion
  "Awaiting Due Date": "Completion",
  "Order Completed": "Completion",
  "O2 Order Completion": "Completion",

  // Exception Handling - can appear under relevant step
  Fallout: "Provisioning",
  "Order Suspended": "Provisioning",
  "Initiate Suspend Order": "Provisioning",
  "Initiate Restore Order": "Provisioning",
  "Restore Service": "Provisioning",
  Deprovisioning: "Provisioning",
  "Network Unassignment": "Provisioning",
};

// System-based grouping
const SYSTEM_GROUP_MAPPING: Record<string, string> = {
  Buyflow: "Buyflow",
  "BOSS-CPQ": "BOSS-CPQ",
  Digital: "Digital",
  "BOSS-Dispatch": "BOSS-Dispatch",
  "BOSS-OM": "Digital",
  BRIM: "BRIM (Billing)",
  O2: "O2 (Inventory)",
  NEUSTAR: "Neustar",
  BSW: "BSW (Fulfillment)",
  IVR: "IVR (Customer Interaction Systems)",
  CALIX: "BSW (Fulfillment)",
  ALIANZA: "Neustar",
};

const PIPELINE_STAGES = [
  "Dispatch",
  "Billing",
  "Provisioning",
  "Voice",
  "Completion",
];

type StageTimelineData = {
  title: string;
  startTime: string;
  endTime?: string;
  expectedEndTime?: string;
  delayMinutes?: number;
  status:
    | "completed"
    | "in_progress"
    | "failed"
    | "completed_with_retry"
    | "delayed"
    | "no_activity";
};

// Mock stage timeline data with date ranges and delay information
const STAGE_TIMELINE_DATA: Record<
  string,
  {
    startTime: string;
    endTime?: string;
    expectedEndTime?: string;
    delayMinutes?: number;
    status:
      | "completed"
      | "in_progress"
      | "failed"
      | "completed_with_retry"
      | "delayed"
      | "no_activity";
  }
> = {
  Dispatch: {
    startTime: "2026-01-19T08:00:00Z",
    endTime: "2026-01-19T08:15:00Z",
    status: "completed",
  },
  Billing: {
    startTime: "2026-01-19T08:15:00Z",
    endTime: "2026-01-19T09:00:00Z",
    status: "completed",
  },
  Provisioning: {
    startTime: "2026-01-19T09:00:00Z",
    endTime: "2026-01-19T11:30:00Z",
    expectedEndTime: "2026-01-19T11:00:00Z",
    delayMinutes: 30,
    status: "delayed",
  },
  Voice: {
    startTime: "2026-01-19T11:30:00Z",
    endTime: "2026-01-19T14:30:00Z",
    status: "completed",
  },
  Completion: {
    startTime: "",
    status: "no_activity",
  },
};

// Mock delay data for specific tasks
const TASK_DELAY_DATA: Record<
  string,
  { expectedTime: string; actualTime: string; delayMinutes: number }
> = {
  "Create Account in Alianza": {
    expectedTime: "2026-01-19T09:30:00Z",
    actualTime: "2026-01-19T10:15:00Z",
    delayMinutes: 45,
  },
  "Add Subscriber in Calix": {
    expectedTime: "2026-01-19T10:30:00Z",
    actualTime: "2026-01-19T11:15:00Z",
    delayMinutes: 45,
  },
};



export function TaskBoardView({ events }: TaskBoardViewProps) {
  // Start with all groups expanded
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [delayedStageFilter, setDelayedStageFilter] = useState<string | null>(
    null,
  );

  // Group events by system
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};

    events.forEach((event) => {
      const system = event.sourceSystem || "Digital";
      const groupName = SYSTEM_GROUP_MAPPING[system] || "Digital";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      // Enhance event with stage mapping
      const eventStage =
        MILESTONE_TO_STAGE[event.title] ||
        (event.stage ? event.stage : "Digital");

      // Detect retry patterns
      const isRetry =
        event.title.includes("Retry") || event.details?.retryAttempt;
      const retryMatch = event.title.match(/Retry (\d+)/);
      const retryAttempt = retryMatch
        ? parseInt(retryMatch[1])
        : isRetry
          ? 1
          : 0;

      // Add delay information if available
      const delayInfo = TASK_DELAY_DATA[event.title];

      groups[groupName].push({
        ...event,
        stage: eventStage,
        retryAttempt,
        retryCount: retryAttempt,
        expectedCompletionTime: delayInfo?.expectedTime,
        actualCompletionTime: delayInfo?.actualTime || event.timestamp,
        delayMinutes: delayInfo?.delayMinutes,
      });
    });

    // Initialize all groups as expanded
    if (expandedGroups.size === 0) {
      setExpandedGroups(new Set(Object.keys(groups)));
    }

    return groups;
  }, [events, expandedGroups.size]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = events;

    switch (activeFilter) {
      case "failed":
        filtered = events.filter((e) => e.status === "failed");
        break;
      case "in_progress":
        filtered = events.filter((e) => e.status === "in_progress");
        break;
      case "user_updated":
        filtered = events.filter(
          (e) => e.actor !== "System" && e.actor !== "system",
        );
        break;
      case "latest_version":
        const maxVersion = Math.max(...events.map((e) => e.version || 1));
        filtered = events.filter((e) => e.version === maxVersion);
        break;
      case "delayed":
        filtered = events.filter((e) => TASK_DELAY_DATA[e.title]);
        break;
    }

    // Stage filter
    if (selectedStage && !delayedStageFilter) {
      filtered = filtered.filter((e) => {
        const eventStage = MILESTONE_TO_STAGE[e.title] || e.stage;
        return eventStage === selectedStage;
      });
    }

    // Delayed stage filter (only show delayed tasks for that stage)
    if (delayedStageFilter) {
      filtered = filtered.filter((e) => {
        const eventStage = MILESTONE_TO_STAGE[e.title] || e.stage;
        return eventStage === delayedStageFilter && TASK_DELAY_DATA[e.title];
      });
    }

    return filtered;
  }, [events, activeFilter, selectedStage, delayedStageFilter]);

  // Regroup filtered events
  const displayGroups = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};

    filteredEvents.forEach((event) => {
      const system = event.sourceSystem || "Digital";
      const groupName = SYSTEM_GROUP_MAPPING[system] || "Digital";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      const eventStage =
        MILESTONE_TO_STAGE[event.title] ||
        (event.stage ? event.stage : "Digital");

      const isRetry =
        event.title.includes("Retry") || event.details?.retryAttempt;
      const retryMatch = event.title.match(/Retry (\d+)/);
      const retryAttempt = retryMatch
        ? parseInt(retryMatch[1])
        : isRetry
          ? 1
          : 0;

      const delayInfo = TASK_DELAY_DATA[event.title];

      groups[groupName].push({
        ...event,
        stage: eventStage,
        retryAttempt,
        retryCount: retryAttempt,
        expectedCompletionTime: delayInfo?.expectedTime,
        actualCompletionTime: delayInfo?.actualTime || event.timestamp,
        delayMinutes: delayInfo?.delayMinutes,
      });
    });

    return groups;
  }, [filteredEvents]);

  // Calculate pipeline progress
  const pipelineProgress = useMemo(() => {
    const progress: Record<
      string,
      {
        total: number;
        completed: number;
        failed: number;
        current: boolean;
        hasRetries: boolean;
        hasDelays: boolean;
        delayedCount: number;
        status:
          | "completed"
          | "in_progress"
          | "failed"
          | "completed_with_retry"
          | "delayed"
          | "no_activity";
      }
    > = {};

    PIPELINE_STAGES.forEach((stage) => {
      const stageEvents = events.filter((e) => {
        const eventStage = MILESTONE_TO_STAGE[e.title] || e.stage;
        return eventStage === stage;
      });

      const hasRetries = stageEvents.some(
        (e) => e.retryAttempt && e.retryAttempt > 0,
      );
      const completedCount = stageEvents.filter(
        (e) => e.status === "completed",
      ).length;
      const failedCount = stageEvents.filter(
        (e) => e.status === "failed",
      ).length;
      const inProgress = stageEvents.some((e) => e.status === "in_progress");
      const delayedTasks = stageEvents.filter((e) => TASK_DELAY_DATA[e.title]);
      const hasDelays = delayedTasks.length > 0;

      let status:
        | "completed"
        | "in_progress"
        | "failed"
        | "completed_with_retry"
        | "delayed"
        | "no_activity" = "no_activity";

      if (stageEvents.length === 0) {
        status = "no_activity";
      } else if (failedCount > 0 && completedCount < stageEvents.length) {
        status = "failed";
      } else if (inProgress) {
        status = "in_progress";
      } else if (hasDelays && completedCount === stageEvents.length) {
        status = "delayed";
      } else if (completedCount === stageEvents.length && hasRetries) {
        status = "completed_with_retry";
      } else if (completedCount === stageEvents.length) {
        status = "completed";
      }

      // Override with mock data for demo
      if (STAGE_TIMELINE_DATA[stage]) {
        status = STAGE_TIMELINE_DATA[stage].status;
      }

      progress[stage] = {
        total: stageEvents.length,
        completed: completedCount,
        failed: failedCount,
        current: inProgress,
        hasRetries,
        hasDelays,
        delayedCount: delayedTasks.length,
        status,
      };
    });

    return progress;
  }, [events]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleStageClick = (stage: string) => {
    const stageData = STAGE_TIMELINE_DATA[stage];

    // If clicking a delayed stage, filter to show only delayed tasks
    if (stageData?.status === "delayed") {
      setDelayedStageFilter(delayedStageFilter === stage ? null : stage);
      setSelectedStage(null);
    } else {
      // Normal stage filter
      setSelectedStage(selectedStage === stage ? null : stage);
      setDelayedStageFilter(null);
    }
  };

  const clearAllFilters = () => {
    setActiveFilter("all");
    setSelectedStage(null);
    setDelayedStageFilter(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case "in_progress":
        return <PlayCircle className="w-5 h-5 text-amber-600" />;
      case "pending":
        return <PauseCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDataSourceLabel = (event: TimelineEvent) => {
    if (event.notesType === "userRemarks") return "Updated by Agent";
    if (event.notesType === "interface") return "From Customer";
    if (event.notesType === "interfaceLogs") return "From System";
    if (event.notesType === "milestones") return "From Workflow";
    return "From System";
  };

  const getWhyThisHappened = (event: TimelineEvent) => {
    if (event.notesType === "userRemarks") {
      return "Manually updated by agent or system user";
    }
    if (event.notesType === "interface") {
      return "Customer interaction captured by IVR system";
    }
    if (event.notesType === "interfaceLogs") {
      return "Response from external system integration";
    }
    if (event.notesType === "milestones") {
      return "Set by workflow configuration and automation rules";
    }
    return "Generated by system workflow";
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStageColorClasses = (
    status:
      | "completed"
      | "in_progress"
      | "failed"
      | "completed_with_retry"
      | "delayed"
      | "no_activity",
    isSelected: boolean,
  ) => {
    if (isSelected) {
      return "bg-indigo-50 border-indigo-500 shadow-md";
    }

    switch (status) {
      case "completed":
        return "bg-emerald-50 border-emerald-300 hover:border-emerald-400";
      case "in_progress":
        return "bg-blue-50 border-blue-300 hover:border-blue-400";
      case "failed":
        return "bg-rose-50 border-rose-300 hover:border-rose-400";
      case "completed_with_retry":
        return "bg-amber-50 border-amber-300 hover:border-amber-400";
      case "delayed":
        return "bg-orange-50 border-orange-300 hover:border-orange-400";
      case "no_activity":
        return "bg-gray-50 border-gray-200 hover:border-gray-300";
      default:
        return "bg-gray-50 border-gray-200 hover:border-gray-300";
    }
  };

  const getStageTextColor = (
    status:
      | "completed"
      | "in_progress"
      | "failed"
      | "completed_with_retry"
      | "delayed"
      | "no_activity",
  ) => {
    switch (status) {
      case "completed":
        return "text-emerald-700";
      case "in_progress":
        return "text-blue-700";
      case "failed":
        return "text-rose-700";
      case "completed_with_retry":
        return "text-amber-700";
      case "delayed":
        return "text-orange-700";
      case "no_activity":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  // Calculate retry statistics for each task
  const getTaskRetryInfo = (
    event: TimelineEvent,
    allEvents: TimelineEvent[],
  ) => {
    const taskName = event.title
      .replace(/Retry \d+: /, "")
      .replace(/^Retry \d+$/, "");
    const relatedEvents = allEvents.filter((e) => {
      const eName = e.title
        .replace(/Retry \d+: /, "")
        .replace(/^Retry \d+$/, "");
      return (
        eName === taskName &&
        (e.sourceSystem === event.sourceSystem ||
          e.destinationSystem === event.destinationSystem)
      );
    });

    const retryCount = relatedEvents.filter(
      (e) => e.retryAttempt && e.retryAttempt > 0,
    ).length;
    const finalEvent = relatedEvents[relatedEvents.length - 1];
    const resolvedAfterRetry =
      retryCount > 0 && finalEvent.status === "completed";
    const stillFailed = retryCount > 0 && finalEvent.status === "failed";

    return {
      retryCount,
      resolvedAfterRetry,
      stillFailed,
      attempts: relatedEvents.map((e, idx) => ({
        attempt: idx + 1,
        status: e.status,
        timestamp: e.timestamp,
        error: e.details?.errorMessage || e.apiDetails?.response?.message,
      })),
    };
  };

  // const { groupedEvents: nmilestoneGroupedEvents, pipelineStage } =
  //   useMemo(() => {
  //     const pipelineStage: StageTimelineData[] = [];
  //     const groupedEvents = events.reduce(
  //       (acc: Record<string, TimelineEvent[]>, item) => {
  //         if (item.milestone) {
  //           if (!acc[item.milestone]) acc[item.milestone] = [];
  //           const lastRecord = acc[item.milestone].at(-1);

  //           if (
  //             (lastRecord &&
  //               new Date(lastRecord.timestamp) > new Date(item.timestamp)) ||
  //             !lastRecord
  //           ) {
  //             acc[item.milestone].push(item);
  //           } else {
  //             acc[item.milestone].unshift(item);
  //           }
  //         }
  //         return acc;
  //       },
  //       {},
  //     );

  //     for (const key in groupedEvents) {
  //       if (!Object.hasOwn(groupedEvents, key)) continue;
  //       const value = groupedEvents[key];
  //       const lastStage = pipelineStage.at(-1);
  //       const stageData: StageTimelineData = {
  //         startTime: value[0]?.timestamp,
  //         endTime: value.at(-1)?.timestamp,
  //         title: key,
  //         status: "completed",
  //       };
  //       if (
  //         value[0] &&
  //         lastStage &&
  //         new Date(value[0].timestamp) < new Date(lastStage.startTime)
  //       ) {
  //         pipelineStage.unshift(stageData);
  //       } else {
  //         pipelineStage.push(stageData);
  //       }
  //     }

  //     return { groupedEvents, pipelineStage };
  //   }, [events]);

  // console.log(
  //   nmilestoneGroupedEvents,
  //   pipelineStage,
  //   "nmilestoneGroupedEvents",
  // );

  return (
    <div className="space-y-6">
      {/* PIPELINE STEPPER */}
      <div className="sticky top-0 z-10 bg-white rounded-lg border-2 border-gray-200 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {PIPELINE_STAGES.map((stage, index) => {
              const progress = pipelineProgress[stage];
              const stageData = STAGE_TIMELINE_DATA[stage];
              const isSelected =
                selectedStage === stage || delayedStageFilter === stage;

              return (
                <React.Fragment key={stage}>
                  <button
                    onClick={() => handleStageClick(stage)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${getStageColorClasses(
                      progress.status,
                      isSelected,
                    )}`}
                  >
                    <div className="text-xs font-bold text-gray-600 uppercase mb-2">
                      {stage}
                    </div>

                    {stageData.status === "no_activity" ? (
                      <div className="text-sm text-gray-500">No activity</div>
                    ) : stageData.status === "in_progress" ? (
                      <div
                        className={`text-sm font-medium ${getStageTextColor(progress.status)}`}
                      >
                        Started at {formatDateTime(stageData.startTime)}
                      </div>
                    ) : (
                      <>
                        <div
                          className={`text-sm font-medium ${getStageTextColor(progress.status)}`}
                        >
                          {formatDateTime(stageData.startTime)} →{" "}
                          {formatDateTime(stageData.endTime || "")}
                        </div>
                        {stageData.delayMinutes &&
                          stageData.delayMinutes > 0 && (
                            <div className="mt-1">
                              <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                <Clock className="w-3 h-3 mr-1" />+
                                {stageData.delayMinutes} min delay
                              </Badge>
                            </div>
                          )}
                      </>
                    )}
                  </button>
                  {index < PIPELINE_STAGES.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-300 mx-2 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER INDICATOR BANNER */}
      {(selectedStage || delayedStageFilter || activeFilter !== "all") && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-700" />
            <span className="text-sm font-bold text-indigo-900">
              Filtered by:
              {delayedStageFilter &&
                ` ${delayedStageFilter} (Delayed Tasks Only)`}
              {selectedStage && !delayedStageFilter && ` ${selectedStage}`}
              {activeFilter !== "all" &&
                !selectedStage &&
                !delayedStageFilter &&
                ` ${activeFilter.replace("_", " ")}`}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-indigo-700 border-indigo-300 hover:bg-indigo-100"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filter
          </Button>
        </div>
      )}

      {/* SMART FILTERS */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            All Tasks
          </Button>
          <Button
            variant={activeFilter === "failed" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("failed")}
            className={
              activeFilter === "failed" ? "bg-rose-600 hover:bg-rose-700" : ""
            }
          >
            <XCircle className="w-4 h-4 mr-1" />
            Failed Only
          </Button>
          <Button
            variant={activeFilter === "in_progress" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("in_progress")}
          >
            <PlayCircle className="w-4 h-4 mr-1" />
            In Progress
          </Button>
          <Button
            variant={activeFilter === "delayed" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("delayed")}
            className={
              activeFilter === "delayed"
                ? "bg-orange-600 hover:bg-orange-700"
                : ""
            }
          >
            <Clock className="w-4 h-4 mr-1" />
            Delayed Only
          </Button>
          <Button
            variant={activeFilter === "user_updated" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("user_updated")}
          >
            <User className="w-4 h-4 mr-1" />
            User Updated
          </Button>
          <Button
            variant={activeFilter === "latest_version" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("latest_version")}
          >
            Latest Version
          </Button>
        </div>
      </div>

      {/* COLOR MEANING LEGEND */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6 text-xs">
          <span className="font-bold text-gray-700 uppercase">
            Status Colors:
          </span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span className="text-gray-600">Completed on time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-gray-600">In progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-gray-600">Delayed (exceeded SLA)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span className="text-gray-600">Completed with retry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rose-500"></div>
            <span className="text-gray-600">Failed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-400"></div>
            <span className="text-gray-600">No activity</span>
          </div>
        </div>
      </div>

      {/* 3. TASK GROUPS */}
      <div className="space-y-4">
        {Object.entries(displayGroups).map(([groupName, groupEvents]) => {
          const isExpanded = expandedGroups.has(groupName);

          // Calculate retry information
          const retriedTasks = new Set<string>();
          groupEvents.forEach((event) => {
            if (event.retryAttempt && event.retryAttempt > 0) {
              const taskName = event.title
                .replace(/Retry \d+: /, "")
                .replace(/^Retry \d+$/, "");
              retriedTasks.add(taskName);
            }
          });

          const groupStats = {
            total: groupEvents.length,
            completed: groupEvents.filter((e) => e.status === "completed")
              .length,
            failed: groupEvents.filter((e) => e.status === "failed").length,
            inProgress: groupEvents.filter((e) => e.status === "in_progress")
              .length,
            retried: retriedTasks.size,
          };

          return (
            <div
              key={groupName}
              className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden"
            >
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors border-b-2 border-gray-200"
              >
                <div className="flex items-center gap-4">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {groupName}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {groupStats.total} Tasks | {groupStats.failed} Failed |{" "}
                      {groupStats.retried} Retried
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {groupStats.failed > 0 && (
                    <Badge className="bg-rose-100 text-rose-700 border-rose-300">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {groupStats.failed} Failed
                    </Badge>
                  )}
                  {groupStats.inProgress > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                      <Clock className="w-3 h-3 mr-1" />
                      {groupStats.inProgress} In Progress
                    </Badge>
                  )}
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {groupStats.completed} Done
                  </Badge>
                </div>
              </button>

              {/* Group Tasks */}
              {isExpanded && (
                <div className="divide-y divide-gray-200">
                  {groupEvents.map((event) => {
                    const isTaskExpanded = expandedTasks.has(event.id);
                    const isFailed = event.status === "failed";
                    const isIVR = event.notesType === "interface";
                    const retryInfo = getTaskRetryInfo(event, events);
                    const isDelayed =
                      event.delayMinutes && event.delayMinutes > 0;

                    return (
                      <div
                        key={event.id}
                        className={`${
                          isFailed
                            ? "bg-rose-50 border-l-4 border-rose-500"
                            : isDelayed
                              ? "bg-orange-50 border-l-4 border-orange-500"
                              : ""
                        }`}
                      >
                        {/* 4. TASK CARD */}
                        <button
                          onClick={() => toggleTask(event.id)}
                          className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              {/* Status Icon */}
                              <div className="flex-shrink-0 mt-1">
                                {getStatusIcon(event.status)}
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Task Title and Badges */}
                                <div className="flex items-start gap-2 mb-2">
                                  <h4 className="font-bold text-gray-900 text-base">
                                    {event.title}
                                  </h4>
                                  {event.version && (
                                    <Badge
                                      variant="outline"
                                      className="bg-indigo-50 text-indigo-700 border-indigo-300"
                                    >
                                      v{event.version}
                                    </Badge>
                                  )}
                                  {isFailed && (
                                    <Badge className="bg-rose-100 text-rose-700 border-rose-300">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      Failed
                                    </Badge>
                                  )}
                                  {isDelayed && (
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Delayed +{event.delayMinutes} mins
                                    </Badge>
                                  )}
                                  {retryInfo.retryCount > 0 && (
                                    <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                                      <RotateCw className="w-3 h-3 mr-1" />
                                      Retried: {retryInfo.retryCount} times
                                    </Badge>
                                  )}
                                </div>

                                {/* Retry Status */}
                                {retryInfo.retryCount > 0 && (
                                  <div className="text-sm mb-2">
                                    {retryInfo.resolvedAfterRetry && (
                                      <span className="text-emerald-700 font-bold">
                                        ✓ Resolved after retry
                                      </span>
                                    )}
                                    {retryInfo.stillFailed && (
                                      <span className="text-rose-700 font-bold">
                                        ✗ Still failed
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Simple Message */}
                                <div className="text-sm text-gray-600 mb-3">
                                  {event.details?.taskDetails || event.title}
                                </div>

                                {/* System Flow & Data Source */}
                                <div className="flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Zap className="w-3 h-3" />
                                    <span className="font-mono">
                                      {event.sourceSystem || "System"}
                                    </span>
                                    <ArrowRight className="w-3 h-3" />
                                    <span className="font-mono">
                                      {event.destinationSystem || "BOSS-OM"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <Settings className="w-3 h-3" />
                                    {getDataSourceLabel(event)}
                                  </div>
                                  <div className="text-gray-500">
                                    {new Date(event.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isTaskExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* 6. TASK DETAILS (EXPANDED) */}
                        {isTaskExpanded && (
                          <div className="px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-200">
                            <div className="space-y-4">
                              {/* Delay Details */}
                              {isDelayed &&
                                event.expectedCompletionTime &&
                                event.actualCompletionTime && (
                                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                    <h5 className="text-xs font-bold text-orange-900 uppercase mb-3 flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      Delay Details
                                    </h5>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <div className="text-xs text-orange-700 font-bold mb-1">
                                          Expected Time
                                        </div>
                                        <div className="text-orange-900">
                                          {formatDateTime(
                                            event.expectedCompletionTime,
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-orange-700 font-bold mb-1">
                                          Completed At
                                        </div>
                                        <div className="text-orange-900">
                                          {formatDateTime(
                                            event.actualCompletionTime,
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-orange-700 font-bold mb-1">
                                          Delay Duration
                                        </div>
                                        <div className="text-orange-900 font-bold">
                                          +{event.delayMinutes} minutes
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* Retry History */}
                              {retryInfo.retryCount > 0 &&
                                retryInfo.attempts.length > 1 && (
                                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                    <h5 className="text-xs font-bold text-amber-900 uppercase mb-3">
                                      Retry History
                                    </h5>
                                    <div className="space-y-2">
                                      {retryInfo.attempts.map(
                                        (attempt, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-start gap-3 text-sm"
                                          >
                                            <div
                                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                attempt.status === "completed"
                                                  ? "bg-emerald-100 text-emerald-700"
                                                  : "bg-rose-100 text-rose-700"
                                              }`}
                                            >
                                              {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                              <div className="font-bold">
                                                Attempt {attempt.attempt} →{" "}
                                                {attempt.status === "completed"
                                                  ? "Success"
                                                  : "Failed"}
                                                {attempt.error &&
                                                  ` (${attempt.error})`}
                                              </div>
                                              <div className="text-gray-600">
                                                {formatDateTime(
                                                  attempt.timestamp,
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* WHY THIS HAPPENED */}
                              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-indigo-100 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-indigo-700" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-indigo-700 uppercase mb-1">
                                      Why This Happened
                                    </div>
                                    <div className="text-sm text-indigo-900">
                                      {getWhyThisHappened(event)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 9. CALL SUMMARY (if IVR event) */}
                              {isIVR && event.tableData && (
                                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Phone className="w-4 h-4 text-emerald-700" />
                                    <h5 className="text-sm font-bold text-emerald-900">
                                      Customer Interaction
                                    </h5>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    {event.tableData.map((field) => (
                                      <div key={field.id}>
                                        <div className="text-xs text-emerald-700 font-bold mb-1">
                                          {field.fieldName}
                                        </div>
                                        <div className="text-sm text-emerald-900">
                                          {field.changedTo || "-"}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* API Details */}
                              {event.apiDetails && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">
                                      Request Sent
                                    </h5>
                                    <div className="text-xs text-gray-600 font-mono mb-2">
                                      {event.apiDetails.method}{" "}
                                      {event.apiDetails.url}
                                    </div>
                                    <div className="text-sm text-gray-900">
                                      Request payload sent to external system
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">
                                      Response Received
                                    </h5>
                                    <div className="text-sm text-gray-900">
                                      {event.apiDetails.response?.statusCode ? (
                                        <Badge
                                          className={`${
                                            event.apiDetails.response
                                              .statusCode === "200"
                                              ? "bg-emerald-100 text-emerald-700"
                                              : "bg-rose-100 text-rose-700"
                                          }`}
                                        >
                                          Status:{" "}
                                          {event.apiDetails.response.statusCode}
                                        </Badge>
                                      ) : (
                                        "Response received from system"
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 8. ADDITIONAL INFO (Table Data) */}
                              {event.tableData && !isIVR && (
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h5 className="text-xs font-bold text-gray-700 uppercase mb-3">
                                    Additional Details
                                  </h5>
                                  <div className="grid grid-cols-3 gap-4">
                                    {event.tableData.map((field) => (
                                      <div
                                        key={field.id}
                                        className="border-l-2 border-indigo-300 pl-3"
                                      >
                                        <div className="text-xs text-gray-600 mb-1">
                                          {field.fieldName}
                                        </div>
                                        <div className="text-sm font-bold text-gray-900">
                                          {field.changedTo ||
                                            field.changedFrom ||
                                            "-"}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Failure Details */}
                              {isFailed && event.details?.errorMessage && (
                                <div className="bg-rose-100 rounded-lg p-4 border-2 border-rose-300">
                                  <h5 className="text-xs font-bold text-rose-900 uppercase mb-2">
                                    Error Details
                                  </h5>
                                  <div className="text-sm text-rose-800">
                                    {event.details.errorMessage}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(displayGroups).length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No tasks match your filters
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or selecting a different stage
          </p>
          <Button onClick={clearAllFilters}>Clear All Filters</Button>
        </div>
      )}
    </div>
  );
}
