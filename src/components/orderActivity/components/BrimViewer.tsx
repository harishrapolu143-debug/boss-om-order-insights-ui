import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Building2,
  Briefcase,
  Users,
  List,
  Percent,
  Inbox,
  Code2,
} from "lucide-react";
import PayloadViewerModal from "./PayloadViewerModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type TransactionStatus = "SUCCESS" | "PARTIAL" | "FAILED";

type ApiOrderItem = {
  productID: string;
  subscriptionNumbers: string;
  ProductType: string;
  ProductSubType: string;
  Status: "Success" | "Failed";
  Message: string;
};

type BrimApiResponse = {
  success: string;
  accountNumber: string;
  BAN: string;
  bossOrderId: string;
  jobId: string;
  SuccessCount?: number;
  FailedCount?: number;
  SuccessOrder?: ApiOrderItem[];
  FailedOrder?: ApiOrderItem[];
  dateTime: string;
};

type Props = {
  data?: BrimApiResponse;
};
// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TransactionStatus,
  {
    Icon: React.ElementType;
    squareBg: string;
    circleBg: string;
    titleColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    summaryCardBg: string;
    summaryCardBorder: string;
  }
> = {
  SUCCESS: {
    Icon: CheckCircle2,
    squareBg: "bg-teal-100",
    circleBg: "bg-teal-400",
    titleColor: "text-teal-600",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-600",
    badgeBorder: "border-teal-300",
    summaryCardBg: "bg-white",
    summaryCardBorder: "border-gray-200",
  },
  PARTIAL: {
    Icon: AlertTriangle,
    squareBg: "bg-amber-100",
    circleBg: "bg-amber-500",
    titleColor: "text-amber-700",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-400",
    summaryCardBg: "bg-amber-50",
    summaryCardBorder: "border-amber-200",
  },
  FAILED: {
    Icon: XCircle,
    squareBg: "bg-red-100",
    circleBg: "bg-red-400",
    titleColor: "text-red-600",
    badgeBg: "bg-red-50",
    badgeText: "text-red-600",
    badgeBorder: "border-red-300",
    summaryCardBg: "bg-red-50",
    summaryCardBorder: "border-red-200",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatus = (t: BrimApiResponse): TransactionStatus =>
  (t.SuccessCount || 0) > 0 && t.FailedCount === 0
    ? "SUCCESS"
    : (t.SuccessCount || 0) > 0 && (t.FailedCount || 0) > 0
      ? "PARTIAL"
      : "FAILED";

const parseDateTime = (isoString?: string) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date: dateStr, time: timeStr };
};

const OrderIcon: React.FC<{ success: boolean }> = ({ success }) => (
  <div className="relative w-10 h-10 shrink-0">
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        success ? "bg-teal-100" : "bg-red-100"
      }`}
    >
      <FileText
        className={`w-5 h-5 ${success ? "text-teal-500" : "text-red-500"}`}
      />
    </div>
    <div
      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
        success ? "bg-teal-400" : "bg-red-400"
      }`}
    >
      {success ? (
        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
      ) : (
        <XCircle className="w-2.5 h-2.5 text-white" />
      )}
    </div>
  </div>
);

const OrderCol: React.FC<{
  label: string;
  value: string;
  colored?: boolean;
  success?: boolean;
}> = ({ label, value, colored = false, success = true }) => (
  <div className="shrink-0 text-[11px]">
    <p className="font-semibold uppercase tracking-wider text-gray-400 mb-1">
      {label}
    </p>
    <p
      className={`font-medium leading-snug ${colored ? (success ? "text-teal-500" : "text-red-500") : "text-gray-800"}`}
    >
      {value || "-"}
    </p>
  </div>
);

const OrdersSection: React.FC<{
  title: string;
  count?: number;
  orders?: ApiOrderItem[];
  success: boolean;
}> = ({ title, count, orders, success }) => {
  const HeaderIcon = success ? CheckCircle2 : XCircle;
  const headerIconBg = success ? "bg-teal-400" : "bg-red-400";
  const headerTextColor = success ? "text-teal-600" : "text-red-500";

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${headerIconBg}`}
        >
          <HeaderIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className={`text-sm font-bold ${headerTextColor}`}>
          {title} ({count})
        </h3>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {orders && orders.length > 0 ? (
          orders.map((order, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 px-4 py-4 ${
                idx < orders.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <OrderIcon success={order.Status === "Success"} />
              <div className="flex items-start gap-5 flex-1 min-w-0 flex-wrap">
                <OrderCol
                  label="Subscription Number"
                  value={order.subscriptionNumbers}
                  colored
                  success={order.Status === "Success"}
                />
                <OrderCol
                  label="Product ID"
                  value={order.productID}
                  colored
                  success={order.Status === "Success"}
                />
                <OrderCol
                  label="Product Type"
                  value={order.ProductType}
                  colored
                  success={order.Status === "Success"}
                />
                <OrderCol
                  label="Product Sub Type"
                  value={order.ProductSubType}
                  colored
                  success={order.Status === "Success"}
                />
                <div className="shrink-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      order.Status === "Success"
                        ? "bg-teal-50 text-teal-600 border-teal-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {order.Status}
                  </span>
                </div>
                <div className="flex-1 min-w-45">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Message
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {order.Message}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-4 py-4 px-4 text-center">
            <Inbox className="w-6 h-6 text-gray-500" />
            <p className="text-[11px]  text-gray-500">
              No {success ? "successful" : "failed"} orders in this transaction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const BrimViewer: React.FC<Props> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!data) return null;
  const selected = data;
  const status = getStatus(selected);
  const cfg = STATUS_CONFIG[status];
  const SelectedIcon = cfg.Icon;
  const selectedDateTime = parseDateTime(selected.dateTime);
  const totalOrders =
    (selected.SuccessCount || 0) + (selected.FailedCount || 0);
  const successRate =
    totalOrders > 0
      ? Math.round(((selected.SuccessCount || 0) / totalOrders) * 100)
      : 0;

  const renderSummaryText = () => {
    if (status === "SUCCESS") {
      const order = selected.SuccessOrder?.[0];
      if (order && selected.SuccessCount === 1) {
        return (
          <>
            BRM transaction completed successfully. Subscription order{" "}
            <strong>{order.subscriptionNumbers || "-"}</strong> was created for
            BAN <strong>{selected.BAN || "-"}</strong> under Account{" "}
            <strong>{selected.accountNumber || "-"}</strong>. Product ID{" "}
            <strong>{order.productID || "-"}</strong> with Product Type{" "}
            <strong>{order.ProductType || "-"}</strong> and Product Sub Type{" "}
            <strong>{order.ProductSubType || "-"}</strong> was processed
            successfully.
          </>
        );
      }
      return (
        <>
          BRM transaction completed successfully.{" "}
          <strong>{selected.SuccessCount || "-"}</strong> subscription orders
          were created for BAN <strong>{selected.BAN || "-"}</strong> under
          Account <strong>{selected.accountNumber || "-"}</strong>.
        </>
      );
    }
    if (status === "PARTIAL") {
      return (
        <>
          BRM transaction for Account{" "}
          <strong>{selected.accountNumber || "-"}</strong> completed with
          partial success. <strong>{selected.SuccessCount || "-"}</strong> of{" "}
          <strong>{totalOrders}</strong> subscription orders succeeded.{" "}
          <strong>{selected.FailedCount || "-"}</strong> order(s) failed. Review
          failed orders for details.
        </>
      );
    }
    return (
      <>
        BRM transaction for Account{" "}
        <strong>{selected.accountNumber || "-"}</strong> failed.{" "}
        <strong>{selected.FailedCount || "-"}</strong> subscription order(s)
        could not be processed.
      </>
    );
  };

  return (
    <div
      className="flex overflow-hidden bg-white"
      style={{ maxHeight: "500px" }}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {/* Summary card */}
          <div
            className={`border ${cfg.summaryCardBorder} ${cfg.summaryCardBg} rounded-lg p-4`}
          >
            <p className="text-[11px]  text-gray-700">
              {renderSummaryText()}
            </p>
          </div>

          <div className="flex items-stretch border-b border-gray-100 divide-x divide-gray-100 bg-gray-50 shrink-0">
            {/* Identity fields */}
            {[
              {
                label: "Account",
                value: data.accountNumber,
                Icon: Building2,
                color: "text-blue-600",
              },
              {
                label: "BAN",
                value: data.BAN,
                Icon: Users,
                color: "text-violet-600",
              },
              {
                label: "BOSS Order ID",
                value: data.bossOrderId,
                Icon: FileText,
                color: "text-slate-600",
              },
              {
                label: "Job ID",
                value: data.jobId,
                Icon: Briefcase,
                color: "text-teal-600",
              },
            ].map(({ label, value, Icon, color }) => (
              <div key={label} className="flex-1 px-3 py-2 min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                  <Icon className={`w-3 h-3 ${color} shrink-0`} />
                  {label}
                </div>
                <div className={`text-[13px] font-bold ${color} truncate`}>
                  {value || "—"}
                </div>
              </div>
            ))}
            {/* Metric chips */}
            <div className="flex items-center gap-0 divide-x divide-gray-100">
              {[
                {
                  label: "Success",
                  value: data.SuccessCount ?? "—",
                  cls: "text-teal-600",
                },
                {
                  label: "Failed",
                  value: data.FailedCount ?? "—",
                  cls:
                    (data.FailedCount || 0) > 0
                      ? "text-red-500"
                      : "text-gray-700",
                },
                { label: "Total", value: totalOrders, cls: "text-gray-800" },
                {
                  label: "Rate",
                  value: `${successRate}%`,
                  cls: "text-amber-600",
                },
              ].map(({ label, value, cls }) => (
                <div key={label} className="px-4 py-2 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                    {label}
                  </div>
                  <div className={`text-xl font-bold leading-tight ${cls}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Successful Orders */}
          <OrdersSection
            title="Successful Orders"
            count={selected.SuccessCount}
            orders={selected.SuccessOrder}
            success
          />

          {/* Failed Orders */}
          <OrdersSection
            title="Failed Orders"
            count={selected.FailedCount}
            orders={selected.FailedOrder}
            success={false}
          />
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-6 pt-3 flex justify-end">
          <button
            className="flex items-center gap-2 text-xs font-semibold text-blue-600 border border-blue-200 bg-white rounded-md px-4 py-2 hover:bg-blue-50 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Code2 className="w-3.5 h-3.5" />
            View Full Details (JSON)
          </button>
        </div>
      </div>
      <PayloadViewerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        payload={data}
        title="BRIM"
      />
    </div>
  );
};

export default BrimViewer;
