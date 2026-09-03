import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Terminal,
  FileText,
  MapPin,
  Tag,
  Layers,
  Server,
  Info,
  Percent,
  Hash,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TransactionStatus = "SUCCESS" | "PARTIAL" | "FAILED";

type Command = {
  commandId?: string;
  attempts?: number;
  programmingStatus?: string;
  message?: string;
  packetId?: string;
};

type O2Event = {
  sysId: number;
  serviceFacsId: string;
  serviceOrderNumber: string;
  serviceRequestNumber: number;
  lci: number;
  type: string;
  due: string;
  status: string;
  centralOffice: string;
  switchId: string;
  commands?: Command[];
};

type O2Transaction = {
  eventId: string;
  occurred: string;
  txId: string;
  user: string;
  event?: O2Event;
  type: string;
  version: string;
};

type Props = {
  data?: O2Transaction;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isCommandSuccess = (cmd: Command) => cmd.programmingStatus?.startsWith("000");

const deriveStatus = (commands?: Command[]): TransactionStatus => {
  if (Array.isArray(commands) && commands.length > 0) {
    const successCount = commands.filter(isCommandSuccess).length;
    if (successCount === commands.length) return "SUCCESS";
    if (successCount === 0) return "FAILED";
    return "PARTIAL";
  }
  return "PARTIAL";
};

const parseDateTime = (isoString: string) => {
  const d = new Date(isoString);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
};

const formatDue = (isoString?: string) => {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
};

const STATUS_META: Record<
  TransactionStatus,
  { Icon: React.ElementType; label: string; headerBg: string; headerBorder: string; textColor: string; badgeBg: string; badgeText: string; badgeBorder: string; dot: string }
> = {
  SUCCESS: {
    Icon: CheckCircle2,
    label: "Completed Successfully",
    headerBg: "bg-teal-50",
    headerBorder: "border-teal-200",
    textColor: "text-teal-700",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-700",
    badgeBorder: "border-teal-300",
    dot: "bg-teal-500",
  },
  PARTIAL: {
    Icon: AlertTriangle,
    label: "Partial Success",
    headerBg: "bg-amber-50",
    headerBorder: "border-amber-300",
    textColor: "text-amber-700",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-400",
    dot: "bg-amber-500",
  },
  FAILED: {
    Icon: XCircle,
    label: "Failed",
    headerBg: "bg-red-50",
    headerBorder: "border-red-200",
    textColor: "text-red-700",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    badgeBorder: "border-red-300",
    dot: "bg-red-500",
  },
};

// ─── KV field ─────────────────────────────────────────────────────────────────

const KV: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: React.ReactNode;
}> = ({ icon, iconColor, label, value }) => (
  <div className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-gray-50 transition-colors min-w-0">
    <span className={`mt-0.5 shrink-0 ${iconColor}`}>{icon}</span>
    <div className="min-w-0 flex-1">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 leading-none mb-0.5">{label}</div>
      <div className="text-[13px] font-medium text-gray-800 leading-snug truncate">{value}</div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const O2NotificationViewer: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const txStatus = deriveStatus(data.event?.commands);
  const successCount = data.event?.commands?.filter(isCommandSuccess).length || 0;
  const failedCount = (data.event?.commands?.length || 0) - successCount;
  const totalCommands = data.event?.commands?.length || 0;
  const meta = STATUS_META[txStatus];
  const StatusIcon = meta.Icon;
  const successRate = totalCommands > 0 ? Math.round((successCount / totalCommands) * 100) : 0;
  const dt = parseDateTime(data.occurred);

  return (
    <div className="flex flex-col bg-white overflow-hidden" style={{ maxHeight: "620px" }}>

      <div className="flex-1 overflow-y-auto">

        {/* ── Transaction info grid ─────────────────────────────── */}
        <div className="px-3 pt-3 pb-2 border-b border-gray-100">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 px-2">
            Transaction Information
          </div>
          <div className="grid grid-cols-3 gap-x-2">
            <KV
              icon={<FileText className="w-3.5 h-3.5" />}
              iconColor="text-blue-500"
              label="Service Order Number"
              value={
                <span className="text-blue-600 font-semibold">
                  {data.event?.serviceOrderNumber || "—"}
                </span>
              }
            />
            <KV
              icon={<FileText className="w-3.5 h-3.5" />}
              iconColor="text-blue-500"
              label="Service Request Number"
              value={
                <span className="text-blue-600 font-semibold">
                  {data.event?.serviceRequestNumber || "—"}
                </span>
              }
            />
            <KV
              icon={<Hash className="w-3.5 h-3.5" />}
              iconColor="text-gray-400"
              label="Service FACS ID"
              value={
                <span className="text-blue-600 font-semibold">
                  {data.event?.serviceFacsId || "—"}
                </span>
              }
            />
            <KV
              icon={<Layers className="w-3.5 h-3.5" />}
              iconColor="text-violet-500"
              label="LCI"
              value={
                <span className="text-blue-600 font-semibold">{data.event?.lci || "—"}</span>
              }
            />
            <KV
              icon={<Calendar className="w-3.5 h-3.5" />}
              iconColor="text-rose-500"
              label="Due"
              value={formatDue(data.event?.due)}
            />
            <KV
              icon={<Tag className="w-3.5 h-3.5" />}
              iconColor="text-sky-500"
              label="Type"
              value={
                <span className="text-blue-600 font-bold">{data.event?.type || "—"}</span>
              }
            />
            <KV
              icon={<MapPin className="w-3.5 h-3.5" />}
              iconColor="text-orange-500"
              label="Central Office"
              value={
                <span className="text-blue-600 font-semibold">
                  {data.event?.centralOffice || "—"}
                </span>
              }
            />
            <KV
              icon={<Server className="w-3.5 h-3.5" />}
              iconColor="text-indigo-500"
              label="Switch ID"
              value={
                <span className="text-blue-600 font-semibold">
                  {data.event?.switchId || "—"}
                </span>
              }
            />
            <KV
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              iconColor="text-teal-500"
              label="Status"
              value={
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                >
                  <StatusIcon className="w-2.5 h-2.5" />
                  {txStatus === "SUCCESS" ? "Completed" : txStatus === "PARTIAL" ? "Partial" : "Failed"}
                </span>
              }
            />
          </div>
        </div>

        {/* ── Commands section ──────────────────────────────────── */}
        {data.event && Array.isArray(data.event.commands) && data.event.commands.length > 0 && (
          <>
            {/* Commands metrics bar */}
            <div className="flex items-stretch border-b border-gray-100 divide-x divide-gray-100 bg-gray-50 shrink-0">
              <div className="flex items-center gap-1 px-3 py-1.5">
                <div className="w-5 h-5 rounded bg-gray-800 flex items-center justify-center">
                  <Terminal className="w-3 h-3 text-teal-300" />
                </div>
                <span className="text-[11px] font-bold text-gray-700 ml-1">Commands Summary</span>
              </div>
              {[
                { label: "Total", value: totalCommands, cls: "text-gray-800" },
                { label: "Success", value: successCount, cls: "text-teal-600" },
                { label: "Failed", value: failedCount, cls: failedCount > 0 ? "text-red-500" : "text-gray-700" },
                { label: "Rate", value: `${successRate}%`, cls: "text-blue-600" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="px-4 py-1.5 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</div>
                  <div className={`text-lg font-bold leading-tight ${cls}`}>{value}</div>
                </div>
              ))}

              {/* Inline status note */}
              <div className="flex items-center gap-1.5 px-3 ml-auto">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <p className="text-[11px] text-blue-600">
                  {txStatus === "SUCCESS"
                    ? "All commands processed successfully."
                    : txStatus === "PARTIAL"
                      ? `${successCount} succeeded · ${failedCount} failed.`
                      : "All commands failed. Check switch connectivity."}
                </p>
              </div>
            </div>

            {/* Commands table */}
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-gray-200">
                  {["#", "Command ID", "Packet ID", "Attempts", "Status", "Message"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 py-2 whitespace-nowrap first:pl-4 last:pr-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.event?.commands?.map((cmd, idx) => {
                  const ok = isCommandSuccess(cmd);
                  return (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="pl-4 py-2 pr-2 text-[11px] text-gray-400 tabular-nums">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <span className={`text-[13px] font-semibold font-mono ${ok ? "text-teal-700" : "text-red-600"}`}>
                          {cmd.commandId || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[13px] font-mono text-gray-600">{cmd.packetId || "—"}</td>
                      <td className="px-3 py-2 text-[13px] text-gray-700 tabular-nums">{cmd.attempts ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ok
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          {ok ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                          {ok ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td className="px-3 pr-4 py-2 text-[11px] text-gray-500 leading-snug">
                        {cmd.message || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default O2NotificationViewer;
