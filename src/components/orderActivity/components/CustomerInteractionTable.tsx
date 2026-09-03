import React, { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Phone,
  Calendar,
  Mail,
  CheckCircle2,
  PhoneCall,
  ChevronRight,
  Printer,
  X,
  ClipboardList,
  User,
  Package,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Hash,
  Tag,
  UserCheck,
  MessageCircle,
  File,
} from "lucide-react";
import { CustomerInteraction } from "@/lib/types/order";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChannelType = "Chat" | "Call" | "IVR" | "Email" | "Appointment" | "Order";

type Props = {
  interactions: CustomerInteraction[];
};


// ─── Channel config ───────────────────────────────────────────────────────────

const CHANNEL_CONFIG: Record<
  string,
  { icon: React.ElementType; bg: string; color: string }
> = {
  Chat: { icon: MessageSquare, bg: "bg-green-100", color: "text-green-600" },
  Call: { icon: Phone, bg: "bg-blue-100", color: "text-blue-600" },
  IVR: { icon: PhoneCall, bg: "bg-violet-100", color: "text-violet-600" },
  Email: { icon: Mail, bg: "bg-amber-100", color: "text-amber-600" },
  Appointment: { icon: Calendar, bg: "bg-rose-100", color: "text-rose-600" },
  Order: { icon: CheckCircle2, bg: "bg-teal-100", color: "text-teal-600" },
  Default: { icon: File, bg: "bg-gray-100", color: "text-gray-600" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseDateTime = (isoString: string) => {
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

// ─── Sub-components ───────────────────────────────────────────────────────────

const DetailSection: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}> = ({ icon, iconBg, title, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
    </div>
    <div className="pl-8">{children}</div>
  </div>
);

const SidebarField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
        {label}
      </p>
      <p className="text-xs font-medium text-gray-800 leading-snug">{value}</p>
    </div>
  </div>
);

const CHANNEL_OPTIONS: Array<ChannelType | "All"> = [
  "All",
  "Chat",
  "Call",
  "IVR",
  "Email",
  "Appointment",
  "Order",
];


// ─── Main Component ───────────────────────────────────────────────────────────

export const CustomerInteractionTable: React.FC<Props> = ({ interactions }) => {
  const [selectedId, setSelectedId] = useState<string>(
    interactions[0].interactionId,
  );
  const [channelFilter, setChannelFilter] = useState<ChannelType | "All">(
    "All",
  );
  const printRef = useRef<HTMLDivElement>(null);

  const selected = interactions.find((i) => i.interactionId === selectedId)!;
  const selectedCfg =
    CHANNEL_CONFIG[selected.channel] || CHANNEL_CONFIG.Default;
  const SelectedIcon = selectedCfg.icon;
  const selectedDateTime = parseDateTime(selected.interactedDate);
  const filteredInteractions =
    channelFilter === "All"
      ? interactions
      : interactions.filter((i) => i.channel === channelFilter);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((r) => r.cssText)
            .join("");
        } catch {
          return "";
        }
      })
      .join("");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${selected?.interactionTitle ?? "Interaction Details"}</title>
          <style>${styles}</style>
        </head>
        <body style="margin:0;padding:16px;">
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  useEffect(() => {
    if (
      filteredInteractions.length > 0 &&
      filteredInteractions.every((i) => i.interactionId !== selectedId)
    ) {
      setSelectedId(filteredInteractions[0].interactionId);
    }
  }, [filteredInteractions]);

  return (
    <div className="flex overflow-hidden bg-white" style={{ height: "620px" }}>
      {/* ── Left panel: interaction list ── */}
      <div className="w-90 shrink-0 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <h3 className="text-sm font-bold text-gray-900">
            Customer Interactions ({interactions.length})
          </h3>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
            This section shows all the interactions performed by the customer
            during the order lifecycle.
          </p>
          <div className="mt-3 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 text-[11px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1 hover:bg-gray-50 transition-colors">
                  {channelFilter === "All" ? "All Channels" : channelFilter}
                  <Filter className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                {CHANNEL_OPTIONS.map((ch) => (
                  <DropdownMenuItem
                    key={ch}
                    onSelect={() => setChannelFilter(ch)}
                    className={
                      channelFilter === ch ? "font-semibold text-amber-600" : ""
                    }
                  >
                    {ch === "All" ? "All Channels" : ch}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Scrollable list */}
        {filteredInteractions.length > 0 ? (
          <div className="flex-1 overflow-y-auto py-2">
            {filteredInteractions.map((item, index) => {
              const cfg = CHANNEL_CONFIG[item.channel];
              const Icon = cfg.icon;
              const isSelected = item.interactionId === selectedId;
              const isLast = index === interactions.length - 1;
              const isLatest = index === 0;
              const { date, time } = parseDateTime(item.interactedDate);

              return (
                <div key={item.interactionId} className="relative flex px-3">
                  {/* Icon + timeline connector column */}
                  <div className="flex flex-col items-center mr-3 pt-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${cfg.bg}`}
                    >
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    {!isLast && (
                      <div
                        className="w-px flex-1 bg-gray-200 mt-1"
                        style={{ minHeight: "24px" }}
                      />
                    )}
                  </div>

                  {/* Card */}
                  <div
                    onClick={() => setSelectedId(item.interactionId)}
                    className={`flex-1 flex items-start gap-2 mb-2 mt-1 p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border border-amber-400 bg-amber-50/30"
                        : "border border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {date} • {time}
                        </span>
                        {isLatest && (
                          <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-gray-900">
                        {item.interactionTitle}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.comments}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              No interactions found
            </p>
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
              No {channelFilter} interactions are available for this order.
            </p>
            <button
              onClick={() => setChannelFilter("All")}
              className="mt-4 text-[11px] text-amber-600 font-semibold hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* ── Right panel: detail view ── */}
      {filteredInteractions.length > 0 && (
        <div className="flex-1 flex flex-col overflow-hidden" ref={printRef}>
          {/* Detail header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedCfg.bg}`}
              >
                <SelectedIcon className={`w-5 h-5 ${selectedCfg.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-gray-900">
                    {selected.interactionTitle}
                  </h2>
                  <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                    #{selected.interactionId}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {selectedDateTime.date} • {selectedDateTime.time}
                  &nbsp;&nbsp;|&nbsp;&nbsp;Channel: {selected.channel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
            </div>
          </div>

          {/* Main content + sidebar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <DetailSection
                icon={<ClipboardList className="w-3.5 h-3.5 text-gray-500" />}
                iconBg="bg-gray-100"
                title="What happened?"
              >
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selected.summary.whatHappened}
                </p>
              </DetailSection>

              <DetailSection
                icon={<User className="w-3.5 h-3.5 text-blue-500" />}
                iconBg="bg-blue-50"
                title="What action was taken?"
              >
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selected.summary.actionTaken}
                </p>
              </DetailSection>

              <DetailSection
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-violet-500" />}
                iconBg="bg-violet-50"
                title="Interaction outcome"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {selected.summary.interactionOutcome}
                      </p>
                      {selected.relatedRecords.supportTicket.number && (
                        <p className="text-sm text-gray-600 mt-0.5">
                          {selected.relatedRecords.supportTicket.label}:{" "}
                          <span className="text-teal-600 font-medium underline cursor-pointer">
                            {selected.relatedRecords.supportTicket.number}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </DetailSection>

              <DetailSection
                icon={<Package className="w-3.5 h-3.5 text-amber-500" />}
                iconBg="bg-amber-50"
                title="Business impact"
              >
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selected.summary.businessImpact}
                </p>
              </DetailSection>
            </div>

            {/* Sidebar: interaction details */}
            <div className="w-55 shrink-0 border-l border-gray-100 overflow-y-auto px-4 py-5">
              <h4 className="text-xs font-bold text-gray-900 mb-4">
                Interaction details
              </h4>
              <div className="space-y-4">
                <SidebarField
                  icon={<User className="w-3.5 h-3.5" />}
                  label="Customer"
                  value={selected.customerName}
                />
                <SidebarField
                  icon={<Hash className="w-3.5 h-3.5" />}
                  label="Account Number"
                  value={selected.accountNumber}
                />
                <SidebarField
                  icon={<Tag className="w-3.5 h-3.5" />}
                  label="Reason"
                  value={selected.reason}
                />
                <SidebarField
                  icon={<UserCheck className="w-3.5 h-3.5" />}
                  label="Handled by"
                  value={selected.agentName}
                />
                <SidebarField
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  label="Outcome"
                  value={selected.outcome}
                />
                <SidebarField
                  icon={<MessageCircle className="w-3.5 h-3.5" />}
                  label="Comments"
                  value={selected.comments}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          {/* <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                Was this information helpful?
              </span>
              <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
                Yes
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                <ThumbsDown className="w-3.5 h-3.5" />
                No
              </button>
            </div>
            <button className="bg-amber-400 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors">
              Close
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default CustomerInteractionTable;
