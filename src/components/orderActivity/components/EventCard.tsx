import React, { useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Check,
  Code,
  ExternalLink,
  Layers,
  Blocks,
  Calendar,
  OctagonAlert,
  RefreshCcw,
  XCircle,
  MoveHorizontal,
  MoveRight,
  Folder,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { CompactPayloadViewer } from "./CompactPayloadViewer";
import { motion } from "motion/react";
import { UserAvatar } from "./UserAvatar";
import { normalizeString } from "../utils/normalize";
import { logTypeConfig } from "./FilterBar";
import { isValidActivity } from "./TimelineView";
import {
  sortTimelineByDate,
} from "@/lib/utils/helpers";
import { TimelineEvent } from "@/lib/types/order";
import CustomerInteractionTable from "./CustomerInteractionTable";
import { isTransactionEvent } from "@/lib/utils/orderPayload";
import { parseJson } from "../utils/json";
import BrimViewer from "./BrimViewer";
import O2NotificationViewer from "./O2NotificationViewer";

type RetryAttempt = {
  message: string;
  attempt: string;
};

const flatGroupedData = (data: TimelineEvent[]) => {
  const flatData: TimelineEvent[] = [];
  data.forEach((i) => {
    flatData.push(i);
    if (i.groupedData) flatData.push(...flatGroupedData(i.groupedData));
  });
  return flatData;
};

const transformColorCode = (color = "gray") => {
  return {
    border: {
      "500": `border-${color}-500`,
    },
    text: {
      "500": `text-${color}-500`,
    },
    bg: {
      "500": `bg-${color}-500`,
    },
  };
};

const getIconColor = (status: string, isError?: boolean) => {
  if (isError) {
    return "text-red-500";
  }
  switch (status) {
    case "userRemarks":
      return "text-blue-500";
    case "milestones":
      return "text-purple-500";
    case "remarks":
      return "text-orange-500";
    case "dispatch":
      return "text-teal-500";
    default:
      return "text-gray-500";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "userRemarks":
    case "caseActivity":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "milestones":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "remarks":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "dispatch":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "error":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const isTitleBold = (data: TimelineEvent, title: string, isChild?: boolean) => {
  const hasGroupData = data.groupedData && data.groupedData.length > 0;
  return (
    hasGroupData ||
    (!hasGroupData &&
      ((typeof title === "string" &&
        normalizeString(title) === "order_completed") ||
        isTransactionEvent(data.category) ||
        !isChild))
  );
};

const EventContent = ({
  data,
  icon,
  onToggle,
  isExpanded,
  statusColor,
  isChild,
  isError,
}: {
  data: TimelineEvent;
  icon: React.ReactNode;
  onToggle: () => void;
  isExpanded: boolean;
  statusColor: string;
  isChild?: boolean;
  isError: boolean;
}) => {
  const [expandedSubEvents, setExpandedSubEvents] = useState<string[]>([]);
  const getSubEventIcon = (
    type: string,
    nodeType?: string,
    status?: string,
  ) => {
    const Icon =
      status && logTypeConfig[status]
        ? logTypeConfig[status].icon
        : nodeType && logTypeConfig[nodeType]
          ? logTypeConfig[nodeType].icon
          : FileText;
    switch (type) {
      case "task_created":
      case "task_completed":
      case "task_updated":
        return <Check className="w-5 h-5" />;
      case "error":
        return <OctagonAlert className="w-5 h-5" />;
      default:
        return <Icon className="w-5 h-5" />;
    }
  };

  const { isBrim, brimPayload } = useMemo(() => {
    const isBrim = normalizeString(data.category || "") === "brim";
    const brimPayload = isBrim ? parseJson(data.note?.payload) : undefined;
    return {
      isBrim:
        isBrim &&
        brimPayload &&
        typeof brimPayload === "object" &&
        Object.keys(brimPayload).length > 0,
      brimPayload,
    };
  }, [data]);

  const { isO2Notification, o2NotificationPayload } = useMemo(() => {
    const isO2Notification = normalizeString(data.category || "") === "o2";
    const o2NotificationPayload = isO2Notification
      ? parseJson(data.note?.payload)
      : undefined;
    return {
      isO2Notification:
        isO2Notification &&
        o2NotificationPayload &&
        typeof o2NotificationPayload === "object" &&
        Object.keys(o2NotificationPayload).length > 0,
      o2NotificationPayload,
    };
  }, [data]);

  const toggleSubEvent = (subEventId: string) => {
    setExpandedSubEvents((prev) =>
      prev.includes(subEventId)
        ? prev.filter((id) => id !== subEventId)
        : [...prev, subEventId],
    );
  };

  const notesContent = useMemo(() => {
    let tableRowcontent = [];
    let jsonContent = [];

    if (data?.note) {
      for (const key in data.note) {
        if (!Object.hasOwn(data.note, key)) continue;
        let value = data.note[key];
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);

            if (parsed && typeof parsed === "object") {
              value = parsed;
            }
          } catch {}
        }
        if (value && typeof value === "object") {
          jsonContent.push(
            <CompactPayloadViewer
              payload={value}
              title={key?.toUpperCase()}
              key={key}
            />,
          );
        } else {
          tableRowcontent.push(
            <tr key={key} className="hover:bg-gray-100 transition-colors">
              <td className="px-3 py-2 font-medium text-gray-900">{key}</td>
              <td className="px-3 py-2 text-gray-600">{value || ""}</td>
            </tr>,
          );
        }
      }
    }

    if (tableRowcontent.length === 0 && jsonContent.length === 0) return null;

    return (
      <>
        {tableRowcontent.length > 0 && (
          <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 mt-2">
            <table className="w-full text-xs">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">
                    Field
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tableRowcontent}
              </tbody>
            </table>
          </div>
        )}
        {jsonContent}
      </>
    );
  }, [data]);

  const restRequestContent = useMemo(() => {
    if (!data.apiDetails) return null;
    return (
      <>
        {typeof data.apiDetails.errorMessage === "string" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <p className="text-xs font-medium text-red-800 mb-0.5">
              Error Message
            </p>
            <p className="text-xs text-red-700 font-mono">
              {data.apiDetails.errorMessage}
            </p>
          </div>
        )}

        {typeof data.apiDetails.successMessage === "string" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <p className="text-xs font-medium text-green-800 mb-0.5">Success</p>
            <p className="text-xs text-green-700 font-mono">
              {data.apiDetails.successMessage}
            </p>
          </div>
        )}

        <div className="pt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">
            API Reference
          </p>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-3 space-y-3">
            {/* API Endpoint */}
            <div className="flex gap-2 items-center">
              <Badge className="bg-indigo-600 text-white border-indigo-700 text-xs font-mono flex-shrink-0">
                {data.apiDetails.method}
              </Badge>
              <code className="text-xs bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-900 flex-1 break-all">
                {data.apiDetails.url}
              </code>
            </div>

            {/* Request */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CompactPayloadViewer
                payload={data.apiDetails.request || {}}
                title="Request"
                icon={<Code className="w-3 h-3" />}
              />
              <CompactPayloadViewer
                payload={data.apiDetails.response || {}}
                title="Response"
                icon={<Check className="w-3 h-3" />}
              />
            </div>
          </div>
        </div>
      </>
    );
  }, [data]);

  const payloadViewer = useMemo(() => {
    if (!data.payload) return null;
    return (
      <div className="pt-3">
        <p className="text-xs font-medium text-gray-700 mb-2">Payload</p>
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-3 space-y-3">
          {/* Request */}
          <div>
            <CompactPayloadViewer payload={data.payload || {}} />
          </div>
        </div>
      </div>
    );
  }, [data]);

  // const { retryAttempt, attempt } = useMemo(() => {
  //   const retryAttempt: { attempt?: string; message?: string }[] = [];
  //   let attempt: string = "";
  //   if (Array.isArray(data.retryAttempt)) {
  //     data.retryAttempt.forEach((item) => {
  //       const isExist = (str?: string) => {
  //         if (typeof str === "string") {
  //           const [key] = str.split(":");
  //           return retryAttempt.some((a) => a.message?.startsWith(key));
  //         }
  //         return false;
  //       };
  //       const transformRetry = (str: string) => {
  //         const match = str.match(/^Retry\s+(\d+):\s*(.*)$/);
  //         if (match) {
  //           const retryCount = match[1];
  //           const message = match[2];
  //           return {
  //             attempt: retryCount,
  //             message,
  //           };
  //         }
  //         return null;
  //       };
  //       if (item.changedFrom && !isExist(item.changedFrom)) {
  //         const changedFrom = transformRetry(item.changedFrom);
  //         if (changedFrom) retryAttempt.push(changedFrom);
  //       }
  //       if (item.changedTo && !isExist(item.changedTo)) {
  //         const changedTo = transformRetry(item.changedTo);
  //         if (changedTo) retryAttempt.push(changedTo);
  //       }
  //     });
  //     attempt = retryAttempt.length.toString();
  //   }
  //   return {
  //     retryAttempt,
  //     attempt,
  //   };
  // }, [data.retryAttempt]);

  const { retryAttempt, attempt } = useMemo(() => {
    let retryAttempt: RetryAttempt[] = [];

    if (Array.isArray(data.retry)) {
      data.retry.forEach((r, idx) => {
        const match = r.match(/Retry\s+(\d+):\s*(.*)/);
        if (match) {
          retryAttempt.push({
            attempt: match[1],
            message: `Retry ${idx + 1} : ${match[2]}`,
          });
        }
      });
    }

    retryAttempt = retryAttempt.sort((a, b) =>
      a.message.localeCompare(b.message),
    );

    return {
      retryAttempt,
      // attempt: Number(retryAttempt.at(-1)?.attempt),
      attempt: retryAttempt.length,
    };
  }, [data.retry]);

  const timestamp = useMemo(() => {
    if (data.groupedData && data.groupedData.length > 0) {
      const groupedData = sortTimelineByDate(flatGroupedData(data.groupedData));
      return `${groupedData[0]?.timestamp} - ${groupedData.at(-1)?.timestamp}`;
    }
    return data.timestamp;
  }, [data.timestamp, data.groupedData]);

  const title = useMemo(() => {
    let rawString = data.titleFormatter
      ? data.titleFormatter(data)
      : (isChild
          ? data.subTaskTitle
          : (!data.groupedData || data.groupedData.length === 0) &&
              data.parentTitle
            ? data.parentTitle
            : data.title
        )?.trim() || "Untitled";
    if (typeof rawString === "string")
      rawString = rawString.replace(/\[code\]|\[\/code\]/g, "");

    return rawString;
  }, [data, isChild]);

  const safeTitle = (() => {
    const value = title as unknown;

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return (value as any[])
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.text || item?.label || item?.value || "",
        )
        .join(" ");
    }

    if (value && typeof value === "object") {
      const item = value as {
        text?: string;
        label?: string;
        value?: string;
      };

      return item.text || item.label || item.value || "";
    }

    return "";
  })();

  const formattedTitle = safeTitle
    .replace(/\[code\]/g, "")
    .replace(/\[\/code\]/g, "");

  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(formattedTitle);

  return (
    <div
      className={
        isChild
          ? `rounded-lg border  shadow-sm hover:shadow-md transition-shadow ${isError ? "bg-red-50 border-red-200" : "border-gray-200 bg-white"}`
          : ""
      }
    >
      <div
        className={` flex items-center gap-3  ${isError ? "bg-red-50" : ""} ${isChild ? "px-3 py-2.5 min-w-0 flex-1 " : "w-full px-4 py-3"}`}
      >
        {/* Icon */}
        {icon}

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            {hasHtml ? (
              <h3
                className={`text-gray-900 text-sm ${
                  isTitleBold(data, title, isChild)
                    ? "font-bold"
                    : "font-extralight"
                }`}
                dangerouslySetInnerHTML={{ __html: title }}
              ></h3>
            ) : (
              <h3
                className={`text-gray-900 text-sm ${
                  isTitleBold(data, title, isChild)
                    ? "font-bold"
                    : "font-extralight"
                }`}
              >
                {title}
              </h3>
            )}

            {data.groupedData && data.groupedData.length > 0 && (
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 border text-xs">
                <Layers className="w-3 h-3 mr-1" />
                {data.groupedData.length}{" "}
                {data.groupedData.length > 1 ? "Entries" : "Entry"}
              </Badge>
            )}
            {retryAttempt.length > 0 && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-300 border text-xs cursor-pointer">
                <RefreshCcw className="w-3 h-3 mr-1" />
                {attempt} {attempt > 1 ? "Attempts" : "Attempt"}
              </Badge>
            )}
            {(!data.groupedData ||
              (data.groupedData && data.groupedData.length === 0)) &&
              data.status !== "remarks" && (
                <Badge className={`${statusColor} border text-xs capitalize`}>
                  {logTypeConfig[data.status]?.label || data.status}
                </Badge>
              )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {!isChild && data.destinationSystem && data.sourceSystem && (
              <>
                <span className="flex gap-1 items-center">
                  {data.sourceSystem}
                  {data.groupedData && data.groupedData.length > 1 ? (
                    <MoveHorizontal className="w-3 h-3" />
                  ) : (
                    <MoveRight className="w-3 h-3" />
                  )}

                  {data.destinationSystem}
                </span>
                <span>•</span>
              </>
            )}
            {/* Show avatar for real users, hide for "System" */}
            {/* {!isChild && (data.user || data.updatedBy) && (
              <>
                {data.user ? (
                  <>
                    <UserAvatar name={data.user} size="xs" />
                    {data.user}
                  </>
                ) : data.updatedBy ? (
                  <span className="flex gap-1 items-center">
                    <ClockCheck className="w-4 h-4" /> {data.updatedBy}
                  </span>
                ) : null}
                <span>•</span>
              </>
            )} */}

            {!isChild && data.category && (
              <>
                <span className="flex gap-1 items-center">
                  <Blocks className="w-3 h-3" /> {data.category}
                  <span>•</span>
                </span>
              </>
            )}
            {timestamp && (
              <span className="flex gap-1 items-center">
                <Calendar className="w-3 h-3" />
                {timestamp}
              </span>
            )}
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={onToggle}
          disabled={!isValidActivity(data)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0 disabled:opacity-15 ${
            isExpanded
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isExpanded ? "Hide" : "Details"}
        </button>
      </div>
      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`px-4 pb-4 border-t ${isChild && isError ? "border-red-200 " : !isChild && isError ? "bg-red-50 border-red-200" : "border-gray-200"}`}
        >
          {/* Details Section */}
          {data.details && (
            <div className="pt-3 space-y-2">
              {data.details.taskDetails && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-0.5">
                    Task Details
                  </p>
                  <p className="text-xs text-gray-600">
                    {data.details.taskDetails}
                  </p>
                </div>
              )}

              {data.details.assignedGroup && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-0.5">
                    Assigned Group
                  </p>
                  <p className="text-xs text-gray-600">
                    {data.details.assignedGroup}
                  </p>
                </div>
              )}

              {data.details.workNotes && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-0.5">
                    Work Notes
                  </p>
                  <p className="text-xs text-gray-600">
                    {data.details.workNotes}
                  </p>
                </div>
              )}

              {data.details.caseId && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-0.5">
                    Case ID
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600">
                      {data.details.caseId}
                    </p>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
                      onClick={(e) => e.preventDefault()}
                    >
                      View Case <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {data.details.executionStatus && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-0.5">
                    Execution Status
                  </p>
                  <p className="text-xs text-gray-600">
                    {data.details.executionStatus}
                  </p>
                </div>
              )}

              {data.details.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-red-800 mb-0.5">
                    Error Message
                  </p>
                  <p className="text-xs text-red-700 font-mono">
                    {data.details.errorMessage}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Table Data Section - Field Changes */}
          {/* Only show field changes for non-grouped events */}
          {data.tableData && data.tableData.length > 0 && (
            <div className="pt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Field Changes
              </p>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Field Name
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Changed From
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Changed To
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.tableData.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-100 transition-colors"
                      >
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {row.fieldLabel}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {row.changedFrom || (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-900 font-medium">
                          {row.changedTo}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isBrim ? (
            <BrimViewer data={brimPayload} />
          ) : isO2Notification ? (
            <O2NotificationViewer data={o2NotificationPayload} />
          ) : (
            notesContent
          )}
          {/* RestRequest Section */}
          {restRequestContent}
          {/* 622 Payload */}
          {payloadViewer}
          {/*Customer Interaction */}
          {Array.isArray(data.customerInteraction) &&
            data.customerInteraction.length > 0 && (
              <CustomerInteractionTable
                interactions={data.customerInteraction}
              />
            )}

          {retryAttempt.length > 0 && (
            <div className="pt-3">
              <div className="bg-orange-50 border border-orange-300 p-4 rounded">
                {retryAttempt.map((r, index) => {
                  return (
                    <div key={index}>
                      {index > 0 && (
                        <div className="border-t border-gray-300 my-2"></div>
                      )}

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-orange-100 border-2 border-orange-500`}
                        >
                          <XCircle className="w-3.5 h-3.5 text-orange-600" />
                        </div>

                        <div className="flex-1 min-w-0 text-xs text-gray-700 leading-relaxed">
                          {r.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.groupedData && data.groupedData.length > 0 && (
            <div className="pt-3">
              {data.timelineHeader && (
                <p className="text-xs font-medium text-gray-700 mb-3">
                  {data.timelineHeader}
                </p>
              )}
              {/* Timeline View for Sub Tasks */}
              <div className="relative">
                {/* Timeline vertical line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                <div className="space-y-3">
                  {sortTimelineByDate(data.groupedData, true).map(
                    (subEvent, index) => {
                      const status =
                        subEvent?.iconStatus ||
                        normalizeString(subEvent?.subTaskTitle || "");
                      const isChildError =
                        data?.status === "fallout" &&
                        !data?.errorMessage?.toLowerCase().includes("success");
                      return (
                        <div
                          key={`${subEvent.id}-${index}`}
                          className="relative pl-12"
                        >
                          {/* Timeline dot */}
                          <div
                            // className={`absolute left-3 top-3 w-4 h-4 rounded-full border-2 bg-white ${
                            //   subEvent.statusColor
                            //     ? transformColorCode(subEvent.statusColor)
                            //         .border[500]
                            //     : status === "task_created"
                            //       ? "border-green-500"
                            //       : status === "task_completed"
                            //         ? "border-blue-500"
                            //         : status === "error"
                            //           ? "border-red-500"
                            //           : "border-orange-400"
                            // }`}
                            className={`absolute left-3 top-3 w-4 h-4 rounded-full border-2 bg-white text-amber-400`}
                          ></div>

                          <EventContent
                            icon={
                              (isChildError || status === "error") && (
                                <div
                                  // className={`rounded-full flex-shrink-0 ${
                                  //   subEvent.statusColor
                                  //     ? transformColorCode(subEvent.statusColor)
                                  //         .text[500]
                                  //     : status === "task_created"
                                  //       ? "text-green-500"
                                  //       : status === "task_completed"
                                  //         ? "text-blue-500"
                                  //         : status === "error"
                                  //           ? "text-red-500"
                                  //           : status === "task_updated"
                                  //             ? "border-orange-500"
                                  //             : getIconColor(subEvent.status)
                                  // } `}
                                  className={`rounded-full flex-shrink-0 ${
                                    transformColorCode(subEvent.statusColor)
                                      .text[500]
                                  } `}
                                >
                                  {getSubEventIcon(
                                    isChildError ? "error" : status,
                                    subEvent.notesType,
                                    subEvent.status,
                                  )}
                                </div>
                              )
                            }
                            data={subEvent}
                            statusColor={getStatusColor(
                              isChildError ? "error" : subEvent.status,
                            )}
                            onToggle={() => toggleSubEvent(subEvent.id)}
                            isExpanded={expandedSubEvents.includes(subEvent.id)}
                            isChild
                            isError={isChildError}
                          />
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

interface EventCardProps {
  event: TimelineEvent;
  isExpanded: boolean;
  onToggle: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isExpanded,
  onToggle,
}) => {
  if (!event) {
    return null;
  }

  const isError =
    event?.status === "fallout" &&
    !event?.errorMessage?.toLowerCase().includes("success");

  const getEventIcon = () => {
    if (isError) {
      return <OctagonAlert className="w-5 h-5" />;
    }

    if (event.status) {
      const Icon = logTypeConfig[event.status]?.icon;
      if (Icon) {
        return <Icon className="w-5 h-5" />;
      }
    }

    if (event.notesType) {
      const notesTypeLower = event.notesType;

      const Icon =
        logTypeConfig[notesTypeLower]?.icon || logTypeConfig.userRemarks.icon;

      return <Icon className="w-5 h-5" />;
    }

    return <Folder className="w-5 h-5" />;
  };

  const cardBgColor = "bg-white border-gray-200";

  if (isTransactionEvent(event.category)) {
    event.statusColor = "blue";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border shadow-sm ${cardBgColor}`}
    >
      <EventContent
        icon={
          <div
            // className={`rounded-full p-2 ${
            //   event.statusColor
            //     ? transformColorCode(event.statusColor).text[500]
            //     : getIconColor(event.status, isError)
            // } flex-shrink-0`}
            className={`rounded-full p-2 ${transformColorCode(event.statusColor).text[500]} flex-shrink-0`}
          >
            {getEventIcon()}
          </div>
        }
        data={event}
        isExpanded={isExpanded}
        onToggle={onToggle}
        statusColor={getStatusColor(event.status)}
        isError={isError}
      />
    </motion.div>
  );
};
