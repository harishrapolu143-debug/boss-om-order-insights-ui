import {
  useState,
  useRef,
  useEffect,
  useCallback,
  FC,
  KeyboardEvent,
  ReactNode,
} from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type TaskStatus = "success" | "error" | "in-progress" | "pending";
type OrderStatus = "success" | "error" | "in-progress" | "pending";
type ResolvedBy = "system" | "user";
type NodeType = "task" | "milestone";
type TabKey = "details" | "requests" | "retries";

interface Attempt {
  attempt: number;
  status: "success" | "error";
  message: string;
  resolvedBy?: ResolvedBy;
}

interface TaskNotes {
  request: string;
  success: string;
  failure: string;
}

interface TaskNode {
  id: string;
  type: "task";
  label: string;
  source: string;
  destination: string;
  category: string;
  status: TaskStatus;
  attempts: Attempt[];
  notes: TaskNotes;
  duration: number | null;
  startTime: string | null;
  assignedTo?: string;
  eta?: string;
}

interface MilestoneNode {
  id: string;
  type: "milestone";
  label: string;
  status: TaskStatus;
}

type GraphNode = TaskNode | MilestoneNode;

interface OrderOwner {
  type: "system" | "user";
  name: string;
}

interface Order {
  orderNumber: string;
  status: OrderStatus;
  currentOwner: OrderOwner;
  createdAt: string;
  expectedCompletion: string;
  currentDelay: number;
  description: string;
  nodes: GraphNode[];
}

interface StatusMeta {
  bg: string;
  text: string;
  ring: string;
  dot: string;
  light: string;
  border: string;
  label: string;
}

interface GraphRow {
  items: TaskNode[];
  milestone: MilestoneNode | null;
}

interface DragStart {
  x: number;
  y: number;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}


// ─── LIGHT THEME COLOR TOKENS ─────────────────────────────────────────────────

const T = {
  // Backgrounds
  bgPage: "#f0f4f8", // page background — cool gray-blue
  bgSurface: "#ffffff", // cards, panels
  bgSurfaceAlt: "#f8fafc", // subtle secondary surface
  bgTopbar: "#ffffff", // top bar
  bgSummary: "#f8fafc", // summary strip
  bgCanvas: "#eef2f7", // graph canvas

  // Borders
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",

  // Text
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  textHint: "#b0bec5",

  // Code / monospace surfaces
  bgCode: "#f1f5f9",
  codeText: "#1e40af",

  // Node fill (unselected)
  nodeBg: "#ffffff",

  // Accents
  accentBlue: "#2563eb",
  accentPurple: "#7c3aed",

  // Tag chip
  chipBg: "#e8f0fe",
  chipText: "#1d4ed8",

  // Scrollbar
  scrollThumb: "#cbd5e1",
  scrollHover: "#94a3b8",
};

// ─── STATUS META ──────────────────────────────────────────────────────────────

const STATUS_META: Record<TaskStatus, StatusMeta> = {
  success: {
    bg: "#16a34a",
    text: "#fff",
    ring: "#16a34a",
    dot: "#16a34a",
    light: "#f0fdf4",
    border: "#bbf7d0",
    label: "Success",
  },
  error: {
    bg: "#dc2626",
    text: "#fff",
    ring: "#dc2626",
    dot: "#dc2626",
    light: "#fef2f2",
    border: "#fecaca",
    label: "Error",
  },
  "in-progress": {
    bg: "#2563eb",
    text: "#fff",
    ring: "#2563eb",
    dot: "#2563eb",
    light: "#eff6ff",
    border: "#bfdbfe",
    label: "In Progress",
  },
  pending: {
    bg: "#94a3b8",
    text: "#fff",
    ring: "#94a3b8",
    dot: "#94a3b8",
    light: "#f8fafc",
    border: "#e2e8f0",
    label: "Pending",
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function statusBadge(status: TaskStatus): ReactNode {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      style={{
        background: m.bg,
        color: m.text,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 9px",
        borderRadius: 20,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        display: "inline-block",
      }}
    >
      {m.label}
    </span>
  );
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function elapsed(ms: number | null): string | null {
  if (!ms) return null;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── OrderSearch ──────────────────────────────────────────────────────────────

interface OrderSearchProps {
  onSearch: (v: string) => void;
  loading: boolean;
}

const OrderSearch: FC<OrderSearchProps> = ({ onSearch, loading }) => {
  const [val, setVal] = useState<string>("NC4100400228");
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch(val.trim());
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{ position: "relative", flex: 1 }}>
        <span
          style={{
            position: "absolute",
            left: 11,
            top: "50%",
            transform: "translateY(-50%)",
            color: T.textMuted,
            fontSize: 15,
            pointerEvents: "none",
          }}
        >
          ⌕
        </span>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search order number — e.g. NC4100400228"
          style={{
            width: "100%",
            paddingLeft: 34,
            paddingRight: 12,
            height: 38,
            border: `1px solid ${T.borderStrong}`,
            borderRadius: 8,
            background: T.bgSurface,
            color: T.textPrimary,
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          }}
        />
      </div>
      <button
        onClick={() => onSearch(val.trim())}
        disabled={loading}
        style={{
          height: 38,
          padding: "0 18px",
          background: loading ? "#93c5fd" : T.accentBlue,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 5,
          boxShadow: "0 1px 3px rgba(37,99,235,0.3)",
          transition: "background 0.15s",
        }}
      >
        {loading ? "…" : "Trace"}
      </button>
    </div>
  );
};

// ─── OrderSummary ─────────────────────────────────────────────────────────────

interface OrderSummaryProps {
  order: Order;
}

const OrderSummary: FC<OrderSummaryProps> = ({ order }) => {
  const tasks = order.nodes.filter((n): n is TaskNode => n.type === "task");
  const done = tasks.filter((t) => t.status === "success").length;
  const pct = Math.round((done / tasks.length) * 100);
  const isErr = order.status === "error";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 0,
        background: T.bgSummary,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {/* Order # */}
      <div
        style={{ padding: "12px 20px", borderRight: `1px solid ${T.border}` }}
      >
        <div
          style={{
            fontSize: 10,
            color: T.textMuted,
            marginBottom: 3,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
          }}
        >
          Order
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: T.textPrimary,
            fontFamily: "monospace",
          }}
        >
          {order.orderNumber}
        </div>
        <div style={{ fontSize: 11, color: T.textSecondary, marginTop: 2 }}>
          {order.description}
        </div>
      </div>

      {/* Status */}
      <div
        style={{ padding: "12px 20px", borderRight: `1px solid ${T.border}` }}
      >
        <div
          style={{
            fontSize: 10,
            color: T.textMuted,
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
          }}
        >
          Status
        </div>
        {statusBadge(order.status)}
      </div>

      {/* Owner */}
      <div
        style={{ padding: "12px 20px", borderRight: `1px solid ${T.border}` }}
      >
        <div
          style={{
            fontSize: 10,
            color: T.textMuted,
            marginBottom: 5,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
          }}
        >
          Owner
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: T.chipBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
              color: T.chipText,
            }}
          >
            {order.currentOwner.type === "system"
              ? "⚙"
              : initials(order.currentOwner.name)}
          </div>
          <span style={{ fontSize: 13, color: T.textPrimary }}>
            {order.currentOwner.name}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div
        style={{ padding: "12px 20px", borderRight: `1px solid ${T.border}` }}
      >
        <div
          style={{
            fontSize: 10,
            color: T.textMuted,
            marginBottom: 3,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
          }}
        >
          Progress
        </div>
        <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 5 }}>
          {done}/{tasks.length} tasks
        </div>
        <div
          style={{
            height: 5,
            background: T.border,
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: isErr ? "#ef4444" : "#16a34a",
              borderRadius: 4,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>
          {pct}%
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: "12px 20px" }}>
        <div
          style={{
            fontSize: 10,
            color: T.textMuted,
            marginBottom: 3,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
          }}
        >
          Timeline
        </div>
        <div style={{ fontSize: 12, color: T.textSecondary }}>
          Started {fmt(order.createdAt)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: isErr ? "#ef4444" : "#16a34a",
            marginTop: 2,
            fontWeight: 500,
          }}
        >
          {isErr ? `⚠ +${order.currentDelay}min delay` : "✓ On schedule"}
        </div>
      </div>
    </div>
  );
};

// ─── TaskNodeComponent ────────────────────────────────────────────────────────

interface TaskNodeProps {
  node: TaskNode;
  isSelected: boolean;
  onClick: (n: TaskNode) => void;
}

const TaskNodeComponent: FC<TaskNodeProps> = ({
  node,
  isSelected,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const m = STATUS_META[node.status];
  const hasRetry = node.attempts.length > 1;
  const retryErrCnt = node.attempts.filter((a) => a.status === "error").length;
  const isPulse = node.status === "in-progress";

  const circleBg = isSelected ? m.bg : hovered ? m.light : T.nodeBg;
  const circleBorder = isSelected ? m.bg : m.dot;
  const labelColor = isSelected
    ? m.bg
    : hovered
      ? T.textPrimary
      : T.textSecondary;

  return (
    <div
      onClick={() => onClick(node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={node.label}
      style={{
        position: "relative",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
      }}
    >
      {isPulse && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: `2px solid ${m.ring}`,
            animation: "pulse 1.4s ease-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: circleBg,
          border: `2px solid ${circleBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isSelected
            ? `0 0 0 3px ${m.bg}33, 0 2px 8px rgba(0,0,0,0.12)`
            : hovered
              ? "0 2px 8px rgba(0,0,0,0.10)"
              : "0 1px 3px rgba(0,0,0,0.07)",
          transition: "all 0.18s ease",
          position: "relative",
          zIndex: 1,
        }}
      >
        {node.status === "success" && (
          <span
            style={{
              fontSize: 13,
              color: isSelected ? "#fff" : "#16a34a",
              fontWeight: 700,
            }}
          >
            ✓
          </span>
        )}
        {node.status === "error" && (
          <span
            style={{
              fontSize: 13,
              color: isSelected ? "#fff" : "#dc2626",
              fontWeight: 700,
            }}
          >
            ✕
          </span>
        )}
        {node.status === "in-progress" && (
          <span style={{ fontSize: 9, color: "#2563eb" }}>●</span>
        )}
        {node.status === "pending" && (
          <span style={{ fontSize: 9, color: T.textHint }}>○</span>
        )}
      </div>

      {hasRetry && (
        <div
          style={{
            position: "absolute",
            top: -5,
            right: -7,
            background:
              retryErrCnt > 0 && node.status === "error"
                ? "#dc2626"
                : "#d97706",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            width: 15,
            height: 15,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            border: `1.5px solid ${T.bgSurface}`,
          }}
        >
          {node.attempts.length}
        </div>
      )}

      <div
        style={{
          fontSize: 10,
          color: labelColor,
          textAlign: "center",
          maxWidth: 74,
          lineHeight: 1.3,
          fontWeight: isSelected ? 600 : 400,
          transition: "color 0.15s ease",
        }}
      >
        {node.label.length > 20 ? `${node.label.slice(0, 18)}…` : node.label}
      </div>
    </div>
  );
};

// ─── MilestoneNodeComponent ───────────────────────────────────────────────────

interface MilestoneNodeProps {
  node: MilestoneNode;
}

const MilestoneNodeComponent: FC<MilestoneNodeProps> = ({ node }) => {
  const m = STATUS_META[node.status];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 8,
          transform: "rotate(45deg)",
          background: m.light,
          border: `2px solid ${m.dot}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <span
          style={{ transform: "rotate(-45deg)", fontSize: 16, color: m.dot }}
        >
          ◆
        </span>
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: m.dot,
          textAlign: "center",
          maxWidth: 80,
          lineHeight: 1.3,
        }}
      >
        {node.label}
      </div>
    </div>
  );
};

// ─── Connector ────────────────────────────────────────────────────────────────

interface ConnectorProps {
  status: TaskStatus;
  wide?: boolean;
}

const Connector: FC<ConnectorProps> = ({ status, wide = false }) => {
  const m = STATUS_META[status];
  return (
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      <div
        style={{
          width: wide ? 48 : 30,
          height: 2,
          background: `linear-gradient(90deg, ${m.dot}66, ${m.dot})`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -4,
            top: -4,
            width: 0,
            height: 0,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft: `6px solid ${m.dot}`,
          }}
        />
      </div>
    </div>
  );
};

// ─── GraphView ────────────────────────────────────────────────────────────────

interface GraphViewProps {
  nodes: GraphNode[];
  selectedId: string | undefined;
  onSelect: (n: TaskNode) => void;
}

const GraphView: FC<GraphViewProps> = ({ nodes, selectedId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({
    x: 24,
    y: 0,
    scale: 1,
  });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<DragStart | null>(null);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setTransform((t) => ({
      ...t,
      scale: Math.max(0.4, Math.min(2, t.scale + -e.deltaY * 0.001)),
    }));
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-node]")) return;
      setDragging(true);
      dragStart.current = {
        x: e.clientX - transform.x,
        y: e.clientY - transform.y,
      };
    },
    [transform],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !dragStart.current) return;
      setTransform((t) => ({
        ...t,
        x: e.clientX - dragStart.current!.x,
        y: e.clientY - dragStart.current!.y,
      }));
    },
    [dragging],
  );

  const onMouseUp = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // Group nodes into rows split by milestones
  const rows: GraphRow[] = [];
  let current: TaskNode[] = [];
  for (const n of nodes) {
    if (n.type === "milestone") {
      rows.push({ items: current, milestone: n as MilestoneNode });
      current = [];
    } else current.push(n as TaskNode);
  }
  if (current.length) rows.push({ items: current, milestone: null });

  const zoom = (d: number) =>
    setTransform((t) => ({
      ...t,
      scale: Math.max(0.4, Math.min(2, t.scale + d)),
    }));

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        flex: 1,
        overflow: "hidden",
        position: "relative",
        cursor: dragging ? "grabbing" : "grab",
        background: T.bgCanvas,
      }}
    >
      {/* Subtle dot grid */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.9" fill="#c8d6e5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Panning / zooming canvas */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          transition: dragging ? "none" : "transform 0.05s",
          padding: "60px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 48,
          minWidth: "max-content",
        }}
      >
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: "flex", alignItems: "center" }}>
            {row.items.map((node, ni) => {
              const prevStatus: TaskStatus =
                ni > 0 ? row.items[ni - 1].status : "pending";
              return (
                <div
                  key={node.id}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {ni > 0 && <Connector status={prevStatus} />}
                  <div data-node="true">
                    <TaskNodeComponent
                      node={node}
                      isSelected={selectedId === node.id}
                      onClick={onSelect}
                    />
                  </div>
                </div>
              );
            })}
            {row.milestone && (
              <>
                <Connector
                  status={row.items[row.items.length - 1]?.status ?? "pending"}
                  wide
                />
                <MilestoneNodeComponent node={row.milestone} />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Zoom controls */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {(["+", "−", "⊙"] as const).map((btn, i) => (
          <button
            key={i}
            onClick={() => {
              if (i === 0) zoom(0.15);
              if (i === 1) zoom(-0.15);
              if (i === 2) setTransform({ x: 24, y: 0, scale: 1 });
            }}
            style={{
              width: 28,
              height: 28,
              border: `1px solid ${T.borderStrong}`,
              background: T.bgSurface,
              color: T.textSecondary,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: i === 2 ? 13 : 17,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {btn}
          </button>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          fontSize: 10,
          color: T.textHint,
        }}
      >
        Scroll to zoom · Drag to pan
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          background: T.bgSurface,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: "5px 12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {(Object.entries(STATUS_META) as [TaskStatus, StatusMeta][]).map(
          ([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                color: T.textSecondary,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: v.dot,
                }}
              />
              {v.label}
            </div>
          ),
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 10,
            color: T.textSecondary,
          }}
        >
          <div
            style={{
              width: 9,
              height: 9,
              background: "#f1f5f9",
              border: `1.5px solid ${T.textSecondary}`,
              transform: "rotate(45deg)",
            }}
          />
          Milestone
        </div>
      </div>
    </div>
  );
};

// ─── RetryTimeline ────────────────────────────────────────────────────────────

interface RetryTimelineProps {
  attempts: Attempt[];
}

const RetryTimeline: FC<RetryTimelineProps> = ({ attempts }) => {
  if (attempts.length === 0) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.textMuted,
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        Execution History
      </div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 0,
            bottom: 0,
            width: 1,
            background: T.border,
          }}
        />
        {attempts.map((a, i) => {
          const m = STATUS_META[a.status];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                marginBottom: i < attempts.length - 1 ? 12 : 0,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: m.light,
                  border: `2px solid ${m.dot}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: m.dot,
                }}
              >
                {a.attempt}
              </div>
              <div
                style={{
                  flex: 1,
                  background: T.bgSurfaceAlt,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  {statusBadge(a.status)}
                  {a.resolvedBy && (
                    <span style={{ fontSize: 10, color: T.textMuted }}>
                      {a.resolvedBy === "system"
                        ? "⚙ Auto-retry"
                        : "👤 Manual fix"}{" "}
                      by {a.resolvedBy === "system" ? "System" : a.resolvedBy}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: T.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  {a.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── TaskDetailsPanel ─────────────────────────────────────────────────────────

interface TaskDetailsPanelProps {
  node: TaskNode | null;
  onClose: () => void;
}

const TaskDetailsPanel: FC<TaskDetailsPanelProps> = ({ node, onClose }) => {
  const [tab, setTab] = useState<TabKey>("details");

  if (!node) {
    return (
      <div
        style={{
          flex: "0 0 520px",
          background: T.bgSurface,
          borderLeft: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          color: T.textHint,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>⋯</div>
        <div style={{ fontSize: 13, color: T.textMuted }}>
          Click any task node to inspect details
        </div>
      </div>
    );
  }

  const m = STATUS_META[node.status];
  const failed = node.status === "error";
  const tabs: TabKey[] = ["details", "requests", "retries"];

  const propRows: [string, string | number][] = [
    ["Source System", node.source],
    ["Destination", node.destination],
    ["Category", node.category],
    ["Status", node.status],
    ["Attempts", node.attempts.length],
    ["Duration", elapsed(node.duration) ?? "—"],
    ["Started", node.startTime ?? "—"],
  ];

  return (
    <div
      style={{
        flex: "0 0 520px",
        background: T.bgSurface,
        borderLeft: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${T.border}`,
          background: T.bgSurfaceAlt,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: T.textPrimary,
                lineHeight: 1.4,
                marginBottom: 7,
              }}
            >
              {node.label}
            </div>
            <div
              style={{
                display: "flex",
                gap: 7,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {statusBadge(node.status)}
              <span
                style={{
                  fontSize: 11,
                  color: T.textSecondary,
                  background: T.border,
                  padding: "2px 9px",
                  borderRadius: 20,
                }}
              >
                {node.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: T.textMuted,
              cursor: "pointer",
              fontSize: 20,
              padding: "0 0 0 8px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Source → Destination */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginTop: 12,
            fontSize: 12,
          }}
        >
          <span
            style={{
              background: T.chipBg,
              color: T.chipText,
              padding: "3px 9px",
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {node.source}
          </span>
          <span style={{ color: T.textHint, fontSize: 14 }}>→</span>
          <span
            style={{
              background: T.chipBg,
              color: T.chipText,
              padding: "3px 9px",
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {node.destination}
          </span>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 10,
            fontSize: 11,
            color: T.textMuted,
          }}
        >
          {node.startTime && <span>⏱ Started {node.startTime}</span>}
          {node.duration && <span>⚡ {elapsed(node.duration)}</span>}
          {node.attempts.length > 0 && (
            <span
              style={{
                color: node.attempts.length > 1 ? "#d97706" : T.textMuted,
              }}
            >
              ↺ {node.attempts.length} attempt
              {node.attempts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${T.border}`,
          background: T.bgSurface,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "none",
              border: "none",
              borderBottom:
                tab === t ? `2px solid ${m.dot}` : "2px solid transparent",
              color: tab === t ? T.textPrimary : T.textMuted,
              fontSize: 12,
              fontWeight: tab === t ? 600 : 400,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {/* Details */}
        {tab === "details" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {failed && (
              <div
                style={{
                  background: "#fff5f5",
                  border: `1px solid #fecaca`,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#dc2626",
                    marginBottom: 5,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span>⚠</span> Task Failed
                </div>
                <div
                  style={{ fontSize: 12, color: "#b91c1c", lineHeight: 1.6 }}
                >
                  {node.notes.failure}
                </div>
                {(node.assignedTo || node.eta) && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: T.textMuted,
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {node.assignedTo && (
                      <span>
                        Assigned:{" "}
                        <span style={{ color: T.textPrimary, fontWeight: 600 }}>
                          {node.assignedTo}
                        </span>
                      </span>
                    )}
                    {node.eta && (
                      <span>
                        ETA:{" "}
                        <span style={{ color: "#d97706", fontWeight: 600 }}>
                          {node.eta}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {node.notes.success && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: `1px solid #bbf7d0`,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#16a34a",
                    marginBottom: 5,
                  }}
                >
                  ✓ Success Notes
                </div>
                <div
                  style={{ fontSize: 12, color: "#15803d", lineHeight: 1.6 }}
                >
                  {node.notes.success}
                </div>
              </div>
            )}

            <div>
              <div
                style={{
                  fontSize: 10,
                  color: T.textMuted,
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontWeight: 700,
                }}
              >
                Task Properties
              </div>
              {propRows.map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: `1px solid ${T.border}`,
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: T.textMuted }}>{k}</span>
                  <span
                    style={{
                      color: T.textPrimary,
                      fontFamily:
                        typeof v === "number" ? "monospace" : "inherit",
                      fontWeight: 500,
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests */}
        {tab === "requests" && (
          <div>
            <div
              style={{
                fontSize: 10,
                color: T.textMuted,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontWeight: 700,
              }}
            >
              Request Payload
            </div>
            <div
              style={{
                background: T.bgCode,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: 12,
                fontFamily: "monospace",
                fontSize: 11,
                color: T.codeText,
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                overflowX: "auto",
              }}
            >
              {node.notes.request || "No request data available"}
            </div>
            {node.notes.success && (
              <>
                <div
                  style={{
                    fontSize: 10,
                    color: T.textMuted,
                    margin: "14px 0 8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontWeight: 700,
                  }}
                >
                  Response
                </div>
                <div
                  style={{
                    background: "#f0fdf4",
                    border: `1px solid #bbf7d0`,
                    borderRadius: 8,
                    padding: 12,
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#15803d",
                    lineHeight: 1.8,
                  }}
                >
                  {node.notes.success}
                </div>
              </>
            )}
          </div>
        )}

        {/* Retries */}
        {tab === "retries" &&
          (node.attempts.length > 0 ? (
            <RetryTimeline attempts={node.attempts} />
          ) : (
            <div
              style={{
                textAlign: "center",
                color: T.textMuted,
                fontSize: 13,
                paddingTop: 32,
              }}
            >
              No execution history yet
            </div>
          ))}
      </div>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function OrderTrackerGraph() {
  const [order, setOrder] = useState<Order | null>({
    orderNumber: "NC4100400228",
    status: "error",
    currentOwner: { type: "user", name: "Sarah Mitchell" },
    createdAt: "2025-04-02T09:14:00Z",
    expectedCompletion: "2025-04-02T11:00:00Z",
    currentDelay: 87,
    description: "Enterprise SaaS Bundle — Acme Corp",
    nodes: [
      {
        id: "n1",
        type: "task",
        label: "Create Dispatch Planning Job",
        source: "OMS",
        destination: "Dispatch Engine",
        category: "Planning",
        status: "success",
        attempts: [
          {
            attempt: 1,
            status: "success",
            message: "Job queued successfully. Dispatch ID: DPJ-2024-00391.",
            resolvedBy: "system",
          },
        ],
        notes: {
          request:
            "POST /dispatch/jobs { order: NC4100400228, priority: HIGH }",
          success: "Dispatch job created with ID DPJ-2024-00391 in 316ms.",
          failure: "",
        },
        duration: 316,
        startTime: "09:14:02",
      },
      {
        id: "n2",
        type: "task",
        label: "Validate Customer Account",
        source: "OMS",
        destination: "CRM",
        category: "Validation",
        status: "success",
        attempts: [
          {
            attempt: 1,
            status: "success",
            message:
              "Account ACME-001 verified. Credit limit: $50,000. Standing: Good.",
            resolvedBy: "system",
          },
        ],
        notes: {
          request: "GET /crm/accounts/ACME-001/validate",
          success: "Account validated. Credit check passed.",
          failure: "",
        },
        duration: 148,
        startTime: "09:14:03",
      },
      {
        id: "m1",
        type: "milestone",
        label: "Order Initialized",
        status: "success",
      },
      {
        id: "n3",
        type: "task",
        label: "Create IMPROV Account",
        source: "OMS",
        destination: "IMPROV",
        category: "Provisioning",
        status: "success",
        attempts: [
          {
            attempt: 1,
            status: "error",
            message:
              "IMPROV service timeout after 30s. Connection refused on port 8443.",
            resolvedBy: "system",
          },
          {
            attempt: 2,
            status: "success",
            message: "Account provisioned successfully. IMPROV ID: IMP-77429.",
            resolvedBy: "system",
          },
        ],
        notes: {
          request:
            "POST /improv/accounts { tenant: acme-corp, tier: enterprise }",
          success: "Account IMP-77429 created with Enterprise SKU.",
          failure:
            "Service timeout — IMPROV pod was restarting during scheduled maintenance window.",
        },
        duration: 31240,
        startTime: "09:14:05",
      },
      {
        id: "n4",
        type: "task",
        label: "Update Correlation ID",
        source: "IMPROV",
        destination: "OMS",
        category: "Sync",
        status: "success",
        attempts: [
          {
            attempt: 1,
            status: "success",
            message: "Correlation updated: OMS-NC4100400228 ↔ IMP-77429.",
            resolvedBy: "system",
          },
        ],
        notes: {
          request:
            "PATCH /oms/orders/NC4100400228 { correlationId: IMP-77429 }",
          success: "Bidirectional correlation established.",
          failure: "",
        },
        duration: 92,
        startTime: "09:14:36",
      },
      {
        id: "n5",
        type: "task",
        label: "Provision License Keys",
        source: "License Server",
        destination: "IMPROV",
        category: "Licensing",
        status: "success",
        attempts: [
          {
            attempt: 1,
            status: "success",
            message: "24 license keys generated and assigned to IMP-77429.",
            resolvedBy: "system",
          },
        ],
        notes: {
          request:
            "POST /license/generate { accountId: IMP-77429, quantity: 24, sku: ENT-SAAS }",
          success: "License pool activated. Expiry: 2026-04-02.",
          failure: "",
        },
        duration: 520,
        startTime: "09:14:37",
      },
      {
        id: "m2",
        type: "milestone",
        label: "Provisioning Complete",
        status: "success",
      },
      {
        id: "n6",
        type: "task",
        label: "Configure SSO Integration",
        source: "IdP Service",
        destination: "IMPROV",
        category: "Identity",
        status: "success",
        attempts: [
          {
            attempt: 1,
            status: "success",
            message: "SAML 2.0 SSO configured for acme-corp.improv.io.",
            resolvedBy: "system",
          },
        ],
        notes: {
          request:
            "POST /idp/sso { tenant: acme-corp, protocol: SAML2, entityId: acme-corp }",
          success: "SSO endpoint live at https://acme-corp.improv.io/sso",
          failure: "",
        },
        duration: 834,
        startTime: "09:14:38",
      },
      {
        id: "n7",
        type: "task",
        label: "Seed Initial Data",
        source: "Template Engine",
        destination: "IMPROV",
        category: "Provisioning",
        status: "success",
        attempts: [
          {
            attempt: 1,
            status: "success",
            message: "14 default templates and 3 workspace structures seeded.",
            resolvedBy: "system",
          },
        ],
        notes: {
          request:
            "POST /improv/seed { accountId: IMP-77429, template: enterprise-v2 }",
          success: "Data seeded in 1.2s. Ready for onboarding.",
          failure: "",
        },
        duration: 1203,
        startTime: "09:14:39",
      },
      {
        id: "n8",
        type: "task",
        label: "Notify Order Ready",
        source: "Notification Service",
        destination: "Customer / CSM",
        category: "Notification",
        status: "error",
        attempts: [
          {
            attempt: 1,
            status: "error",
            message:
              "SMTP relay rejected: recipient mailbox over quota (5GB limit). Error 552.",
            resolvedBy: "system",
          },
          {
            attempt: 2,
            status: "error",
            message:
              "Fallback SMS gateway unreachable. HTTP 503 from vendor API.",
            resolvedBy: "system",
          },
          {
            attempt: 3,
            status: "error",
            message: "Push notification delivery failed. Device token expired.",
            resolvedBy: "system",
          },
        ],
        notes: {
          request:
            "POST /notify { to: sarah@acme-corp.com, template: order-ready, orderId: NC4100400228 }",
          success: "",
          failure:
            "All three notification channels exhausted. Manual intervention required. Assigned to Sarah Mitchell.",
        },
        duration: null,
        startTime: "09:15:40",
        assignedTo: "Sarah Mitchell",
        eta: "~30min",
      },
      {
        id: "n9",
        type: "task",
        label: "Send Welcome Email",
        source: "Notification Service",
        destination: "Customer",
        category: "Notification",
        status: "pending",
        attempts: [],
        notes: {
          request: "POST /email/welcome { accountId: IMP-77429 }",
          success: "",
          failure: "",
        },
        duration: null,
        startTime: null,
      },
      {
        id: "n10",
        type: "task",
        label: "Update CRM Opportunity",
        source: "OMS",
        destination: "CRM",
        category: "Sync",
        status: "pending",
        attempts: [],
        notes: {
          request:
            "PATCH /crm/opportunities/OPP-8821 { stage: Closed-Won, provisioned: true }",
          success: "",
          failure: "",
        },
        duration: null,
        startTime: null,
      },
      {
        id: "n11",
        type: "task",
        label: "Generate Invoice",
        source: "Billing Engine",
        destination: "Customer / Finance",
        category: "Billing",
        status: "pending",
        attempts: [],
        notes: {
          request:
            "POST /billing/invoices { orderId: NC4100400228, amount: 48000 }",
          success: "",
          failure: "",
        },
        duration: null,
        startTime: null,
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<TaskNode | null>(null);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: T.bgPage,
        color: T.textPrimary,
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
        ::-webkit-scrollbar            { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track      { background: ${T.bgSurfaceAlt}; }
        ::-webkit-scrollbar-thumb      { background: ${T.scrollThumb}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover{ background: ${T.scrollHover}; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Summary */}
      {/* {order && <OrderSummary order={order} />} */}

      {/* Main */}
      {order ? (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <GraphView
            nodes={order.nodes}
            selectedId={selectedNode?.id}
            onSelect={setSelectedNode}
          />
          <TaskDetailsPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            textAlign: "center",
            padding: 40,
          }}
        >
          {loading ? (
            <div style={{ fontSize: 14, color: T.textMuted }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>⬡</div>
              Loading trace…
            </div>
          ) : (
            <>
              <div style={{ fontSize: 52, opacity: 0.12, color: T.accentBlue }}>
                ⬡
              </div>
              <div style={{ fontSize: 15, color: T.textSecondary }}>
                Enter an order number to begin tracing
              </div>
              <div style={{ fontSize: 12, color: T.textHint }}>
                Try: NC4100400228
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
