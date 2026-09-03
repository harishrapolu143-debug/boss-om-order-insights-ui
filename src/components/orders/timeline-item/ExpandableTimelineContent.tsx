import React, { memo, ReactNode } from "react";
import { TimelineEvent } from "@/lib/types/order";
import { normalizeValue } from "@/lib/utils/helpers";

interface ExpandableTimelineContentProps {
  event: TimelineEvent;
  isExpanded: boolean;
  isFallOut: boolean;
}

const formatValue = (val: unknown): ReactNode => {
  if (val === null || val === undefined || val === "") {
    return <span className="italic opacity-50">-</span>;
  }

  if (typeof val === "object") {
    return JSON.stringify(val, null, 2);
  }

  return String(val);
};

const ExpandableTimelineContent: React.FC<ExpandableTimelineContentProps> = ({
  event,
  isExpanded,
  isFallOut,
}) => {
  if (!event.isExpandable) {
    return null;
  }

  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? "max-h-500 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="border-t border-gray-200 p-4 space-y-4">
        {isFallOut && event.errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {event.errorMessage}
          </div>
        )}

        {event.apiDetails && (
          <div className="m-3 sm:m-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-400 bg-gray-300 px-4 sm:px-6 py-2 sm:py-3">
              <h5 className="text-[10px] sm:text-xs font-bold uppercase text-black">
                API Request & Response Details
              </h5>
            </div>

            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {event.apiDetails.url && (
                <div className="relative pl-4">
                  <div className="absolute left-0 top-0 h-full w-1 bg-amber-400" />
                  <p className="mb-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Endpoint URL
                  </p>
                  <div className="max-w-full overflow-x-auto break-all rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] sm:text-xs text-blue-700">
                    {event.apiDetails.url}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex flex-col">
                  <p className="mb-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Request Payload
                  </p>
                  <pre className="max-h-64 max-w-full overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-[11px] sm:text-[12px] font-mono whitespace-pre-wrap break-all">
                    <code>{normalizeValue(event.apiDetails.request ?? {})}</code>
                  </pre>
                </div>

                <div className="flex flex-col">
                  <p className="mb-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Response Data
                  </p>
                  <pre className="max-h-64 max-w-full overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-[11px] sm:text-[12px] font-mono whitespace-pre-wrap break-all">
                    <code>{normalizeValue(event.apiDetails.response ?? {})}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {event.tableData && event.tableData.length > 0 && (
          <div className="space-y-3">
            {event.tableData.map((row) => {
              const valTo = row.changedTo;
              const valFrom = row.changedFrom;
              const hasPreviousValue =
                valFrom !== null && valFrom !== undefined && valFrom !== "";

              return (
                <div
                  key={row.id}
                  className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] gap-2 text-sm"
                >
                  <span className="font-semibold text-gray-500">
                    {row.fieldLabel || row.fieldName}
                  </span>

                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="font-semibold text-gray-900 wrap-break-word">
                      {formatValue(valTo)}
                    </span>

                    {hasPreviousValue && (
                      <>
                        <span className="italic text-gray-600">was</span>
                        <span className="text-gray-600 wrap-break-word">
                          {formatValue(valFrom)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ExpandableTimelineContent);
