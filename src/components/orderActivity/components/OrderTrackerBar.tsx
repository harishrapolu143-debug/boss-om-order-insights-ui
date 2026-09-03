import React, { useMemo, useRef, useState } from "react";
import {
  GitBranch,
  CalendarIcon,
  Info,
  ChevronDown,
  Activity,
  ExternalLink,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { useAppSelector } from "@/lib/utils/reduxUtils/hooks";
import moment from "moment";
import { OrderRecord, VersionHistory } from "@/lib/redux/slices/orderSlice";
import { cn } from "./ui/utils";

const MAX_VISIBLE = 4;

// ── Detail modal (matches screenshot design) ──────────────────────────────────
function VersionDetailModal({
  version,
  onClose,
}: {
  version: VersionHistory | null;
  onClose: () => void;
}) {
  const open = Boolean(version);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-3xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            {" "}
            <div className="flex items-start gap-3 mb-4 pr-6">
              <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                {/* Sparkle / star icon */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f4b73f"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v4" />
                  <path d="M12 17v4" />
                  <path d="M4 12h4" />
                  <path d="M16 12h4" />
                  <path d="M5.5 5.5l2.8 2.8" />
                  <path d="M15.7 15.7l2.8 2.8" />
                  <path d="M18.5 5.5l-2.8 2.8" />
                  <path d="M8.3 15.7l-2.8 2.8" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-800 leading-tight">
                  Version {version?.u_version} Summary
                </h2>
                <p className="text-sm font-semibold text-gray-500 mt-0.5">
                  Detailed breakdown of Version {version?.u_version} changes
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        {/* Reason box */}
        {version?.u_notes && (
          <div className="border-l-[3px] border-amber-400 pl-4 mb-5">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest ">
              Reason for Version Increment
            </p>
            <p className="text-sm  text-gray-600 leading-relaxed">
              {version?.u_notes}
            </p>
          </div>
        )}

        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { label: "Version", key: "u_version" },
            { label: "Sales Channel", key: "u_sales_channel" },
            { label: "Request Type", key: "u_request_type" },
            { label: "Agent Id", key: "u_agent_id" },
          ].map((field) => (
            <div
              key={field.label}
              className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5"
            >
              <p className="text-xs font-bold text-gray-400 mb-1">
                {field.label}
              </p>
              <p className="text-sm font-extrabold text-gray-800">
                {version?.[field.key as keyof VersionHistory] || "-"}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type Props = {
  order?: OrderRecord;
  isLoading?: boolean;
  daysPastDue: number;
  isExpanded?: boolean;
  onToggle?: () => void;
};

// ── Main component ────────────────────────────────────────────────────────────
export const OrderTrackerBar = ({
  order,
  isLoading,
  daysPastDue,
  isExpanded = false,
  onToggle,
}: Props) => {
  const [selectedVersion, setSelectedVersion] = useState<VersionHistory | null>(
    null,
  );
  const [overflowOpen, setOverflowOpen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const versions = useAppSelector((state) => state.order.versionHistory) || [];
  const currentOrderVersion = useAppSelector(
    (state) => state.order.currentOrderVersion,
  );
  const visibleVersions = versions.slice(0, MAX_VISIBLE);
  const overflowVersions = versions.slice(MAX_VISIBLE);
  const remaining = overflowVersions.length;
  const latestVersion = currentOrderVersion;

  const { orderMilestones, bossOMPage } = useAppSelector(
    (state) => state.order,
  );
  const handleExpand = () => {
    window.parent.postMessage(
      {
        type: "BUTTON_CLICKED",
        payload: {},
      },
      "*",
    );
  };

  const progress: number = orderMilestones?.completionPercentage || 0;

  const openVersion = (v: VersionHistory) => {
    setOverflowOpen(false);
    setSelectedVersion(v);
  };

  const handleOverflowEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setOverflowOpen(true);
  };

  const handleOverflowLeave = () => {
    hideTimer.current = setTimeout(() => setOverflowOpen(false), 150);
  };

  const countDays = (from: any) => {
    if (!from) return "-";
    const fromDate = moment(from);
    const today = moment();
    return today.diff(fromDate, "days");
  };

  const VersionCard = () => {
    return (
      <aside
        className="version-card bg-white border border-[#d7e0ee] px-6 py-4 rounded-sm flex-1"
        aria-label="Order version history"
      >
        <div className="version-card-top mb-2">
          <div>
            {/* <div className="version-card-label">Order Version</div> */}
            <div className="version-card-current">
              Current Version: <strong>{latestVersion}</strong>
            </div>
          </div>
          {/* <Sparkles className="text-orange-400" /> */}
        </div>

        <div className="version-grid">
          {visibleVersions.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-2 gap-1 text-gray-400">
              <GitBranch className="w-5 h-5 opacity-50" />
              <span className="text-xs font-semibold">
                No version history available
              </span>
            </div>
          ) : (
            visibleVersions.map((item) => (
              <button
                key={item.u_version}
                type="button"
                className={`version-chip flex-1 version-chip-button${latestVersion === item.u_version ? " active" : ""}`}
                onClick={() => openVersion(item)}
              >
                <div className="version-chip-title">
                  Version {item.u_version}
                </div>
                <div className="version-chip-note">{item.u_notes}</div>
              </button>
            ))
          )}

          {remaining > 0 && (
            <Popover open={overflowOpen} onOpenChange={() => {}}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="version-chip version-chip-button version-chip-more"
                  onMouseEnter={handleOverflowEnter}
                  onMouseLeave={handleOverflowLeave}
                >
                  <div className="version-chip-title">+{remaining}</div>
                  <div className="version-chip-note">more</div>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={6}
                className="version-overflow-popover"
                onMouseEnter={handleOverflowEnter}
                onMouseLeave={handleOverflowLeave}
              >
                {overflowVersions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="version-chip version-chip-button"
                    onClick={() => openVersion(item)}
                  >
                    <div className="version-chip-title">
                      Version {item.u_version}
                    </div>
                    <div className="version-chip-note">{item.u_notes}</div>
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </aside>
    );
  };

  if (isLoading && isExpanded) {
    return (
      <div className="grid grid-cols-2 gap-4 p-4 border-b border-[#d7e0ee]">
        <div className="flex items-center gap-4 bg-white border border-[#d7e0ee] px-6 py-4 rounded-sm flex-1 h-full">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="h-6 bg-gray-300 rounded-full flex-1  animate-pulse"
            />
          ))}
        </div>
        <div className="flex items-center gap-4 bg-white border border-[#d7e0ee] px-6 py-4 rounded-sm flex-1 h-full">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="h-6 bg-gray-300 rounded-full flex-1  animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const enableVersionCard = Number(latestVersion) > 1;
  const enableProgressCard = orderMilestones?.isHaveMilestones;
  if (!enableVersionCard && !enableProgressCard) return null;
  const falloutDays = Number(
    countDays(orderMilestones?.falloutDetails?.sys_created_on),
  );

  return (
    <>
      <header className="border-b border-[#d7e0ee]">
        <div
          className={cn(
            "w-full flex items-center justify-between px-6 py-3 transition-colors duration-200 group",
            isExpanded
              ? "bg-[#f8faff] border-b border-[#e8eef8]"
              : "bg-white hover:bg-[#f5f8ff]",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#e8f0fb] flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 text-[#1e66d1]" />
            </div>
            <span className="text-sm font-bold text-[#22304a]">
              Order Tracking Summary
            </span>
            <span className="hidden sm:inline text-xs text-[#8fa3c0] font-medium">
              — Provides a quick overview of the version summary, order
              progress, key dates, and tracking information.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {bossOMPage && (
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
            <label
              className="toggle-wrap"
              aria-label="Toggle milestone details"
            >
              <span>{isExpanded ? "Details On" : "Details Off"}</span>
              <input type="checkbox" checked={isExpanded} onChange={onToggle} />
              <span className={`switch ${isExpanded ? "on" : "off"}`}>
                <span className="switch-thumb" aria-hidden="true" />
              </span>
            </label>
          </div>
        </div>

        <div
          id="order-summary-panel"
          role="region"
          className="grid"
          style={{
            gridTemplateRows: isExpanded ? "1fr" : "0fr",
            transition: "grid-template-rows 300ms ease-in-out",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div className="grid grid-cols-2 gap-4 p-4 max-w-400 mx-auto">
              <div>{enableVersionCard && <VersionCard />}</div>
              {(enableProgressCard || enableVersionCard) && (
                <div className="flex items-center gap-4 bg-white border border-[#d7e0ee] px-6 py-4 rounded-sm flex-1 h-full">
                  {enableProgressCard && (
                    <>
                      <div className="summary-cell progress-cell">
                        <div className="summary-label">Overall Progress</div>
                        <div className="progress-row">
                          <div className="progress-value">{progress}%</div>
                          <div className="progress-bar">
                            <span style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="summary-sep" />
                    </>
                  )}
                  <div className="summary-cell date-cell">
                    <CalendarIcon width={20} height={20} />
                    <div>
                      <div className="summary-label">Order Date</div>
                      <div className="summary-value text-sm">
                        {moment(order?.sys_created_on).format("MMM Do YYYY")}
                      </div>
                    </div>
                  </div>
                  {order?.u_due_date && (
                    <div
                      className={cn(
                        "past-due",
                        daysPastDue > 0 ? "expired" : "",
                      )}
                    >
                      <div className="past-due-dot" />
                      {daysPastDue > 0 ? (
                        <div>
                          <div className="past-due-title">PAST DUE</div>
                          <div className="past-due-text text-sm">
                            This order is past due by{" "}
                            <strong>{daysPastDue} days</strong>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="past-due-title">DUE DATE</div>
                          <div className="past-due-text text-sm">
                            {moment(order?.u_due_date).format("MMM Do YYYY")}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <VersionDetailModal
        version={selectedVersion}
        onClose={() => setSelectedVersion(null)}
      />
    </>
  );
};
