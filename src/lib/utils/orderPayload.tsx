import { TimelineEvent, ApiDetails, FieldRemarkRow } from "@/lib/types/order";
import { NoteTypes } from "../types";
import { emailToName, formatDateTime, sortTimelineByDate } from "./helpers";
import {
  isRepeatedTask,
  normalizeString,
  stripActionPrefix,
} from "@/components/orderActivity/utils/normalize";
import moment from "moment";
import { parseJson } from "@/components/orderActivity/utils/json";

type RemarkData = {
  tableData: FieldRemarkRow[];
};

const isTableData = (data: any): boolean =>
  Array.isArray(data) &&
  data.some((r) => r?.changedFrom !== undefined || r?.changedTo !== undefined);
const normalizeToArray = (data: any): any[] =>
  Array.isArray(data) ? data : [];

const getNoteSource = (notes: any) => {
  return (
    notes?.userRemarks ||
    notes?.remarks ||
    notes?.interfaceLogs ||
    notes?.caseActivity ||
    {}
  );
};

function getFieldValue(
  apiTimeline: any[],
  fieldName: string,
  takelastValue?: boolean,
): string {
  let orderStatus = "";
  for (const item of apiTimeline) {
    const rows = normalizeToArray(item?.notes?.remarks?.data).concat(
      normalizeToArray(item?.notes?.userRemarks?.data),
    );
    const row = rows.find(
      (r: any) => r.fieldName?.toLowerCase() === fieldName.toLowerCase(),
    );
    if (row?.changedTo && typeof row.changedTo === "string") {
      if (takelastValue) {
        orderStatus = row.changedTo;
      } else {
        return row.changedTo;
      }
    }
  }
  return orderStatus;
}
function resolveStatus(notesType: NoteTypes, notes: any): NoteTypes {
  if (notesType === "milestones") {
    const text = notes?.milestones?.data?.toLowerCase?.() || "";
    if (text.includes("fallout")) return "fallout";
  }
  if (notesType === "interfaceLogs") {
    const error = notes?.interfaceLogs?.data?.errorMessage;
    if (error && Object.keys(error).length > 0) return "fallout";
  }
  const rows = normalizeToArray(notes?.remarks?.data);
  const statusRow = rows.find((r: any) =>
    r.fieldName?.toLowerCase()?.includes("status"),
  );
  if (statusRow?.changedTo?.toLowerCase?.().includes("fallout")) {
    return "fallout";
  }
  return notesType;
}
// function resolveTitle(notesType: string, notes: any): string {
//   switch (notesType) {
//     case "interfaceLogs":
//       return notes?.interfaceLogs?.data?.taskName || "-";
//     case "milestones":
//       return notes?.milestones?.data
//         ? notes?.milestones?.data.split("Milestone - ")[1]
//         : "";
//     case "remarks":
//       return `${notes?.remarks?.title ?? notes?.remarks?.titile ?? notes?.remarks?.data ?? notes?.remarks?.type} ${((notes?.remarks?.title ?? notes?.remarks?.titile ?? notes?.remarks?.data) || notes?.remarks?.type || "").includes("Order Created by:") ? emailToName(notes?.remarks?.updatedBy || "-") : ""}`;
//     case "userRemarks":
//       return (
//         notes?.userRemarks?.type ??
//         notes?.userRemarks?.title ??
//         notes?.remarks?.titile ??
//         notes?.remarks?.data ??
//         ""
//       );
//     default:
//       return "";
//   }
// }

function resolveTitle(notesType: string, notes: any): string {
  switch (notesType) {
    case "interfaceLogs":
      return (
        notes?.interfaceLogs?.subTitle ||
        notes?.interfaceLogs?.data?.taskName ||
        "-"
      );

    case "milestones":
      return notes?.milestones?.data
        ? notes?.milestones?.data.split("Milestone - ")[1]
        : "";

    case "remarks":
    case "userRemarks":
    case "caseActivity": {
      const source = getNoteSource(notes);

      return source?.subTitle || source?.title || "";
    }

    default:
      return "";
  }
}

export const isTransactionEvent = (category?: string) => {
  const normalizeCategory = normalizeString(category || "");
  return (
    normalizeCategory === "brim" ||
    normalizeCategory === "o2" ||
    normalizeCategory === "boss_dispatch" ||
    normalizeCategory === "neustar" ||
    normalizeCategory === "email"
  );
};

function resolveParentTitle(notesType: string, notes: any) {
  const source = getNoteSource(notes);

  const taskName = source?.taskName;
  const isCase = source?.isCase;

  if (!taskName) return {};

  return {
    groupKey: normalizeString(stripActionPrefix(taskName)),
    parentTitle: taskName,
    isCase,
  };
}

function resolveUser(notes: any) {
  const record: Record<string, string> = {};
  const source = getNoteSource(notes);

  const updatedBy = source?.updatedBy || "";

  if (typeof updatedBy === "string") {
    if (updatedBy.includes("@") || updatedBy.toLowerCase() !== "system") {
      record.user = emailToName(updatedBy);
    } else {
      record.updatedBy = updatedBy;
    }
  }

  return record;
}

function extractApiDetails(notes: any): ApiDetails | undefined {
  const data = notes?.interfaceLogs?.data;
  const message: Record<string, string> = {};
  if (!data) return undefined;
  const parseData = parseJson(data);
  const response = parseData.response;
  const taskTitle = data?.errorMessage || notes?.interfaceLogs?.taskTitle;
  if (
    data?.errorMessage ||
    taskTitle?.toLowerCase()?.includes("failed") ||
    response?.fault
  ) {
    message.errorMessage = taskTitle;
  } else {
    message.successMessage = taskTitle;
  }
  return {
    url: data.URL || "No URL provided",
    method: data.request ? "POST" : "GET",
    request: parseData.request,
    response: parseData.response,
    ...message,
  };
}
function extractFieldRemarks(notes: any) {
  const result: RemarkData = {
    tableData: [],
  };
  const rows = normalizeToArray(notes?.remarks?.data).concat(
    normalizeToArray(notes?.userRemarks?.data),
  );
  rows.forEach((row: any) => {
    const data = {
      fieldName: row.fieldName,
      fieldLabel: row.fieldLabel,
      changedFrom: row.changedFrom,
      changedTo: row.changedTo,
      id: Date.now().toString() + Math.random().toString(),
    };
    if (row.fieldName !== "u_retried_count") {
      result.tableData.push(data);
    }
  });
  return result;
}

const transformId = (item: any, idx: number) => {
  return `${item.orderNumber}-${item.orderVersion}-${idx}-${item.seqNumber}-${Date.now()}`;
};

const transformPayload = (item: any) => {
  return typeof item === "string" ? parseJson(item) : item;
};

const resolveVersionSummary = (data: any[]) => {
  if (Array.isArray(data) && data.length > 0) {
    return data.reduce((acc, item) => {
      if (item?.notesType === "versionSummary") {
        acc[item?.orderVersion] = item?.notes?.versionSummary;
      }
      return acc;
    }, {});
  }
};

const resolveTitleFormatter = (title: string, category: string) => {
  if (category === "boss_dispatch") {
    return function (event: TimelineEvent) {
      const note = event?.note;
      let assignedTo, taskStatus, dueDate;
      if (note?.TARN || note?.technicianName) {
        if (note?.TARN && note?.technicianName) {
          assignedTo = `TARN ${note?.TARN} assigned to ${note?.technicianName}`;
        } else if (note?.TARN) {
          assignedTo = `TARN ${note?.TARN}`;
        } else if (note?.technicianName) {
          assignedTo = `Assigned to ${note?.technicianName}`;
        }
      }

      if (note?.taskStatus) {
        taskStatus = `status ${note?.taskStatus}`;
      }

      if (note?.dueDate) {
        dueDate = `(${moment(note?.dueDate).format("MMMM Do YYYY, h:mm:ss a")})`;
      }

      return `${assignedTo ? assignedTo : ""}${taskStatus ? `${assignedTo ? ", " : ""}${taskStatus}` : ""} ${dueDate ? dueDate : ""}`;
    };
  }
  if (isTransactionEvent(category)) {
    return function () {
      let formattedTitle = title;
      if (typeof formattedTitle === "string")
        formattedTitle = formattedTitle.replace(/\s+(received|recevied)$/i, "");
      return formattedTitle;
    };
  }
  if (typeof title === "string") {
    const pattern = /Sales Channel:\s*.+?Agent:\s*.+/;

    if (pattern.test(title)) {
      return function TimelineEventRenderer(event: TimelineEvent) {
        let hasAgent = false;

        let output = event.title
          .replace(
            /(Sales Channel:\s*)([^,]*)(,?)(?=\s*(By the Agent:|Agent:)|$)/,
            (_, prefix, value) => {
              return `${prefix}<b class='font-bold italic'>${value.trim()}</b>`;
            },
          )
          .replace(/(By the Agent:|Agent:)\s*(.*)$/, (_, prefix, email) => {
            if (
              !email ||
              !email.trim() ||
              email === "null" ||
              email === "undefined"
            ) {
              hasAgent = false;
              return "";
            }

            const username = emailToName(email);

            if (!username) {
              hasAgent = false;
              return "";
            }

            hasAgent = true;
            return `${prefix} <b class="font-bold italic">${username}</b>`;
          });

        if (hasAgent) {
          output = output.replace(
            /(<\/b>)(?=\s*(By the Agent:|Agent:))/,
            "$1,",
          );
        }
        if (typeof title === "string" && title.includes("Order Created")) {
          output = `<span class="font-bold">${output}</span>`;
        }

        return <span dangerouslySetInnerHTML={{ __html: output }} />;
      };
    }
  }
};

export function mapApiTimelineToUi(
  apiTimeline: any[],
  loadedDetails: any = [],
  orderId?: string,
) {
  const timeline: TimelineEvent[] = [];
  const fulfillmentTaskMap = new Map<
    string,
    {
      statusCode: string;
      fallout: boolean;
      done: boolean;
      falloutReason: string;
      created: string;
    }
  >();
  if (Array.isArray(apiTimeline)) {
    apiTimeline.forEach((item, index) => {
      if (
        loadedDetails.indexOf(item.notesType) === -1 &&
        item.notesType !== "versionSummary"
      ) {
        const {
          notesType,
          notes,
          created,
          orderVersion,
          sourceSystem,
          destinationSystem,
          ...rest
        } = item;
        const title = resolveTitle(notesType, notes);
        const taskName =
          notes?.remarks?.taskName ||
          notes?.remarks?.data?.taskName ||
          notes?.userRemarks?.taskName ||
          notes?.userRemarks?.data?.taskName ||
          notes?.interfaceLogs?.taskName ||
          notes?.interfaceLogs?.data?.taskName;

        const statusCode =
          notes?.remarks?.statusCode ||
          notes?.remarks?.data?.statusCode ||
          notes?.userRemarks?.statusCode ||
          notes?.userRemarks?.data?.statusCode ||
          notes?.interfaceLogs?.statusCode ||
          notes?.userRemarks?.data?.statusCode;

        const falloutReason =
          notes?.remarks?.subTitle ||
          notes?.remarks?.title ||
          notes?.userRemarks?.subTitle ||
          notes?.userRemarks?.title ||
          notes?.interfaceLogs?.subTitle ||
          notes?.interfaceLogs?.title ||
          "";

        if (taskName) {
          const existing = fulfillmentTaskMap.get(taskName);

          if (
            !existing ||
            new Date(item.created).getTime() >
              new Date(existing.created).getTime()
          ) {
            fulfillmentTaskMap.set(taskName, {
              statusCode,
              fallout: statusCode === "red",
              done: statusCode === "blue",
              falloutReason,
              created: item.created,
            });
          }
        }
        const normalizeTitle = normalizeString(title || "");
        const status = resolveStatus(notesType, notes);
        const remarksData = notes?.remarks?.data;
        const userRemarksData = notes?.userRemarks?.data;
        const caseActivityData = notes?.caseActivity?.data;
        const isTable =
          isTableData(remarksData) ||
          isTableData(userRemarksData) ||
          isTableData(caseActivityData);
        const isApi = !!notes?.interfaceLogs?.data;
        let event: TimelineEvent = {
          id: transformId(item, index),
          timestamp: created
            ? formatDateTime(new Date(created).toISOString())
            : "",
          actualTimestamp: created ? new Date(created).toISOString() : "",
          status,
          title,
          version: Number(orderVersion),
          notesType,
          titleFormatter: resolveTitleFormatter(
            title,
            normalizeString(item.category),
          ),
          ...rest,
          ...resolveUser(notes),
          ...resolveParentTitle(notesType, notes),
          retry: notes?.remarks?.retry
            ? notes?.remarks?.title
            : notes?.userRemarks?.retry
              ? notes?.userRemarks?.title
              : undefined,
          destinationSystem:
            destinationSystem ||
            notes?.remarks?.destinationSystem ||
            notes?.userRemarks?.destinationSystem,
          sourceSystem:
            sourceSystem ||
            notes?.remarks?.sourceSystem ||
            notes?.userRemarks?.sourceSystem,
          statusColor:
            notes?.remarks?.statusCode ||
            notes?.userRemarks?.statusCode ||
            notes?.interfaceLogs?.data?.statusCode ||
            notes?.caseActivity?.statusCode,
          payload: transformPayload(
            notes?.remarks?.payload || notes?.userRemarks?.payload,
          ),
          customerInteraction: notes?.remarks?.customerInteraction,
        };
        if (!isApi && !isTable) {
          event.note = userRemarksData || remarksData || caseActivityData;
        }
        // API
        if (isApi) {
          event.apiDetails = extractApiDetails(notes);
        }
        // TABLE
        if (isTable) {
          (event as any) = { ...event, ...extractFieldRemarks(notes) };
        }
        // Fallout
        if (event.status === "fallout") {
          event.errorMessage =
            notes?.interfaceLogs?.data?.errorMessage ||
            notes?.remarks?.data?.errorMessage;
        }
        if (
          typeof event.title === "string" &&
          normalizeString(event.title) !== "order_updated"
        ) {
          timeline.push(event);
        }
      }
    });
  }

  const dispatchInfoMatch = Array.isArray(apiTimeline)
    ? apiTimeline
        .sort((a, b) => {
          const aTime = new Date(a.created).getTime();
          const bTime = new Date(b.created).getTime();

          if (aTime < bTime) return 1;
          if (aTime > bTime) return -1;
          return 0;
        })
        .find((r) => normalizeString(r?.category || "") === "boss_dispatch")
    : {};
  const dispatchInfo =
    dispatchInfoMatch?.notes?.userRemarks?.data ||
    dispatchInfoMatch?.notes?.remarks?.data ||
    {};
  const sortedTimeline = sortTimelineByDate(timeline);
  return {
    id: "1",
    orderId: apiTimeline[0]?.orderNumber || orderId || "",
    orderAction: getFieldValue(apiTimeline, "Order Action"),
    serviceType: getFieldValue(apiTimeline, "Service Type"),
    dispatchStatus: dispatchInfo?.taskStatus,
    networkType: getFieldValue(apiTimeline, "Network Type"),
    createdAt: sortedTimeline[0]
      ? new Date(sortedTimeline[0].timestamp).toISOString()
      : "",
    timeline,
    assignedTechnician: dispatchInfo?.technicianName,
    noteTypeCall: false,
    dueDate: dispatchInfo?.dueDate
      ? new Date(dispatchInfo.dueDate).toISOString()
      : undefined,
    versionSummary: resolveVersionSummary(apiTimeline),
    fulfillmentTaskMap,
  };
}
