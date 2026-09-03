import {
  AlertTriangle,
  ArrowUp,
  Folder,
  Info,
  RefreshCcw,
  Save,
  Tag,
  Ticket,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../orderActivity/components/ui/tooltip";
import { useAppSelector } from "@/lib/redux/hooks";
import { OrderRecord } from "@/lib/redux/slices/orderSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../orderActivity/components/ui/dialog";
import { formatDateTime } from "@/lib/utils/helpers";
import { normalizeString } from "../orderActivity/utils/normalize";
import { cn } from "../orderActivity/components/ui/utils";

const blue = "#1e66d1";
const green = "#169a1f";
const slate = "#6b7280";
const red = "#dc2626";
const softBlue = "#e8f1ff";
const softGreen = "#eaf8ea";
const softGray = "#eef2f7";
const softRed = "#fef2f2";
const gold = "#f4b73f";
const softGold = "#fef9ec";

const STEP_STATE = {
  COMPLETED: "completed",
  ACTIVE: "active",
  PENDING: "pending",
  ERROR: "error",
  OPTIONAL: "optional",
  CANCELED: "canceled",
} as const;

type StepState = (typeof STEP_STATE)[keyof typeof STEP_STATE];

interface IconProps {
  children: React.ReactNode;
  size?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  viewBox?: string;
}

interface BackendTask {
  taskName: string;
  taskSequence: number;
  taskType: "MANDATORY" | "OPTIONAL";
  done?: boolean;
  inprogress?: boolean;
  fallout?: boolean;
  falloutReason?: string;
  link?: any;
}

interface BackendMilestone {
  milestoneName: string;
  milestoneSequence: number;
  tasks: BackendTask[];
}

type Task = {
  text: string;
  done: boolean;
  inprogress?: boolean;
  fallout: boolean;
  falloutReason: string;
  taskType?: "MANDATORY" | "OPTIONAL";
  link?: any;
};

type ApiResponse = {
  data: {
    milestones: BackendMilestone[];
  };
};

interface OrderTrackerProps {
  onRefresh: () => void;
  isLoading: boolean;
  isFromBossOM?: boolean;
}

interface StepData {
  timelineTitle: string;
  cardTitle: string;
  description: string;
  state: StepState;
  note?: any;
  noteClass?: string;
  tasks: Task[];
  link?: any;
  falloutLink?: string;
  timelineIconFn: (color: string, size?: number) => React.ReactNode;
}

interface StepCircleProps {
  state: StepState;
  iconFn: (color: string) => React.ReactNode;
}

interface StatusPillProps {
  text: string;
  color?: string;
  fill?: string;
}

interface TaskItemProps {
  done: boolean;
  fallout?: boolean;
  inprogress?: boolean;
  text: string;
  accent?: string;
  falloutReason?: string;
  link?: any;
  onOpenModal: (link: any) => void;
}

interface DetailCardProps {
  title: string;
  description: string;
  accent: string;
  fill: string;
  iconFn: (color: string, size?: number) => React.ReactNode;
  tasks: Task[];
  onOpenModal: (link: any) => void;
}

interface TimelineStepProps {
  number: number;
  title: string;
  state: StepState;
  iconFn: (color: string, size?: number) => React.ReactNode;
  pillText: string;
  pillColor: string;
  pillFill: string;
  note: any;
  noteClass?: string;
}
interface CaseModalProps {
  open: boolean;
  setIsModalOpen: (open: boolean) => void;
  link?: any;
}

function Icon({
  children,
  size = 24,
  stroke = blue,
  fill = "none",
  strokeWidth = 2.2,
  viewBox = "0 0 24 24",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const makeLargeRefreshIcon = (color: string, size = 28) => (
  <Icon size={size} viewBox="0 0 64 64" strokeWidth={2.4} stroke={color}>
    <path d="M44 22a14 14 0 1 0 4 12" />
    <path d="M48 16v10h-10" />
  </Icon>
);

const makeLargeSuspendedIcon = (color: string, size = 28) => (
  <Icon size={size} viewBox="0 0 64 64" strokeWidth={2.4} stroke={color}>
    <circle cx="32" cy="32" r="16" />
    <path d="M22 42L42 22" />
  </Icon>
);

const makeLargeDocumentIcon = (color: string, size = 28) => (
  <Icon size={size} viewBox="0 0 64 64" strokeWidth={2.4} stroke={color}>
    <rect x="17" y="10" width="30" height="44" rx="4" />
    <path d="M25 18h14M25 26h14M25 34h8" />
    <path d="M20 46h24" />
    <path d="M24 10v8h16" />
    <path d="M24 42l3 3 6-7" />
  </Icon>
);

const makeLargeServerIcon = (color: string, size = 28) => (
  <Icon size={size} viewBox="0 0 64 64" strokeWidth={2.4} stroke={color}>
    <rect x="14" y="12" width="36" height="10" rx="3" />
    <rect x="14" y="26" width="36" height="10" rx="3" />
    <rect x="14" y="40" width="36" height="10" rx="3" />
    <circle cx="23" cy="17" r="1.6" fill={color} stroke="none" />
    <circle cx="23" cy="31" r="1.6" fill={color} stroke="none" />
    <circle cx="23" cy="45" r="1.6" fill={color} stroke="none" />
  </Icon>
);

const makeLargeTruckIcon = (color: string, size = 28) => (
  <Icon size={size} viewBox="0 0 64 64" strokeWidth={2.4} stroke={color}>
    <path d="M8 40h28V26H8z" />
    <path d="M36 30h10l6 7v3H36z" />
    <circle cx="20" cy="44" r="4" />
    <circle cx="44" cy="44" r="4" />
    <path d="M46 18v12" />
  </Icon>
);

const makeLargeHouseIcon = (color: string, size = 28) => (
  <Icon size={size} viewBox="0 0 64 64" strokeWidth={2.4} stroke={color}>
    <path d="M12 30 32 14l20 16" />
    <path d="M18 28v22h28V28" />
    <rect x="24" y="34" width="16" height="16" rx="2" />
  </Icon>
);

const makeLargeBillingIcon = (color: string, size = 28) => (
  <Icon size={size} viewBox="0 0 64 64" strokeWidth={2.4} stroke={color}>
    <rect x="10" y="16" width="44" height="32" rx="4" />
    <path d="M10 26h44" />
    <circle cx="42" cy="39" r="6" />
  </Icon>
);

const makeLargeShieldIcon = (color: string, size = 28) => (
  <Icon size={size} viewBox="0 0 64 64" strokeWidth={2.8} stroke={color}>
    <circle cx="32" cy="32" r="22" />
    <path d="m22 33 7 7 13-15" />
  </Icon>
);

const milestoneConfig = {
  order_created: {
    timelineTitle: "Order Creation",
    description: "Customer and order are created in enterprise systems.",
    timelineIconFn: makeLargeDocumentIcon,
    cardTitle: "Order Creation",
    completedTimelineTitle: "Order Created",
    completedCardTitle: "Order Created",
  },
  pre_provisioning: {
    timelineTitle: "Pre-Provisioning",
    description: "Services, resources and network parameters are configured.",
    timelineIconFn: makeLargeServerIcon,
    cardTitle: "Pre-Provisioning",
    completedTimelineTitle: "Pre-Provisioned",
    completedCardTitle: "Pre-Provisioned",
  },
  dispatched: {
    timelineTitle: "Dispatch",
    description: "Field work is scheduled and dispatched to the technician.",
    timelineIconFn: makeLargeTruckIcon,
    cardTitle: "Dispatch",
    completedTimelineTitle: "Dispatched",
    completedCardTitle: "Dispatched",
  },

  installed_activated: {
    timelineTitle: "Activation",
    description:
      "Service is installed, activated and confirmed on the network.",
    timelineIconFn: makeLargeHouseIcon,
    cardTitle: "Installing & Activating",
    completedTimelineTitle: "Installed & Activated",
    completedCardTitle: "Installed & Activated",
  },
  restored_reactivated: {
    timelineTitle: "Reactivation",
    description:
      "Service has been restored, reactivated, and confirmed available on the network.",
    timelineIconFn: makeLargeRefreshIcon,
    cardTitle: "Restoration & Reactivation",
    completedTimelineTitle: "Restored & Reactivated",
    completedCardTitle: "Restored & Reactivated",
  },
  suspended_disabled: {
    timelineTitle: "Suspension",
    description:
      "Service has been suspended and network access has been disabled.",
    timelineIconFn: makeLargeSuspendedIcon,
    cardTitle: "Suspension",
    completedTimelineTitle: "Suspended & Disabled",
    completedCardTitle: "Suspended & Disabled",
  },
  billing: {
    timelineTitle: "Billing",
    description: "BRIM tasks are processed.",
    timelineIconFn: makeLargeBillingIcon,
    cardTitle: "Billing",
    completedTimelineTitle: "Billed",
    completedCardTitle: "Billed",
  },
  completed: {
    timelineTitle: "Completion",
    description: "Order is completed and all systems are updated.",
    timelineIconFn: makeLargeShieldIcon,
    cardTitle: "Completion",
    completedTimelineTitle: "Completed",
    completedCardTitle: "Completed",
  },
};

function getStepState(
  tasks: Task[],
  milestone: string,
  order?: OrderRecord,
  isLast?: boolean,
  isAnyInCompleted?: boolean,
): StepState {
  const mandatoryTasks = tasks.filter((t) => t.taskType !== "OPTIONAL");
  const normalizeState = normalizeString(order?.u_state || "");
  const isOrderCompleted = normalizeState === "completed" && !isAnyInCompleted;

  if (tasks.length === 0) {
    if (isOrderCompleted) {
      return STEP_STATE.COMPLETED;
    } else {
      return STEP_STATE.PENDING;
    }
  }

  if (tasks.some((t) => t.link && t.fallout && typeof t.link === "object")) {
    return STEP_STATE.ERROR;
  }

  if (milestone === "dispatched" && !order?.u_dispatch_status) {
    return STEP_STATE.OPTIONAL;
  }

  const hasFallout = tasks.some((t) => t.fallout);

  if (hasFallout) {
    return STEP_STATE.ERROR;
  }

  const hasProgress = tasks.some((t) => t.inprogress);

  if (hasProgress) {
    return STEP_STATE.ACTIVE;
  }
  const hasData = mandatoryTasks?.length > 0;

  if (hasData) {
    const allDone = mandatoryTasks.every((t) => t.done);

    if (allDone) {
      if (isLast && !isOrderCompleted) {
        return STEP_STATE.ACTIVE;
      }
      return STEP_STATE.COMPLETED;
    }
  }

  if (mandatoryTasks.length === 0) {
    if (isLast && !isOrderCompleted) {
      if (tasks.some((t) => t.done || t.inprogress)) {
        return STEP_STATE.ACTIVE;
      } else {
        return STEP_STATE.PENDING;
      }
    }
    return STEP_STATE.COMPLETED;
  }

  if (tasks.some((t) => t.done)) {
    return STEP_STATE.ACTIVE;
  }

  return STEP_STATE.PENDING;
}

function stateStyle(state: StepState) {
  switch (state) {
    case STEP_STATE.COMPLETED:
      return {
        accent: blue,
        fill: softBlue,
        pillText: "Completed",
        pillColor: blue,
        pillFill: softBlue,
      };

    case STEP_STATE.ACTIVE:
      return {
        accent: green,
        fill: softGreen,
        pillText: "In Progress",
        pillColor: green,
        pillFill: softGreen,
      };

    case STEP_STATE.ERROR:
      return {
        accent: red,
        fill: softRed,
        pillText: "Fallout",
        pillColor: red,
        pillFill: softRed,
      };

    case STEP_STATE.OPTIONAL:
      return {
        accent: gold,
        fill: softGold,
        pillText: "Optional",
        pillColor: gold,
        pillFill: softGold,
      };

    case STEP_STATE.CANCELED:
      return {
        accent: slate,
        fill: softGray,
        pillText: "Canceled",
        pillColor: slate,
        pillFill: softGray,
      };

    default:
      return {
        accent: slate,
        fill: softGray,
        pillText: "Pending",
        pillColor: slate,
        pillFill: softGray,
      };
  }
}

function buildSteps(
  milestones: BackendMilestone[],
  order?: OrderRecord,
): StepData[] {
  const sortedMilestone = [...milestones].sort(
    (a, b) => a.milestoneSequence - b.milestoneSequence,
  );

  let midState: StepState = STEP_STATE.ACTIVE;
  const midIndex = sortedMilestone.findIndex((m) => {
    const isPending = m.tasks?.every(
      (t) => !t.done && !t.fallout && !t.inprogress,
    );
    const isFallout = m.tasks?.some((t) => t.fallout);
    if (isFallout) midState = STEP_STATE.ERROR;
    return isFallout || isPending;
  });

  const midPoint =
    midIndex === 0
      ? 0
      : midIndex !== -1
        ? midState === STEP_STATE.ACTIVE
          ? midIndex - 1
          : midIndex
        : sortedMilestone.length;

  let isAnyInCompleted = false;

  return sortedMilestone.map((milestone, idx) => {
    const isLastMilestone = sortedMilestone.length - 1 === idx;
    const milestoneKey = milestone.milestoneName
      .toLowerCase()
      .replace(/&/g, "")
      .replace(/-/g, "_")
      .replace(/\s+/g, "_");

    const {
      timelineTitle = milestone.milestoneName,
      description = "",
      timelineIconFn = makeLargeDocumentIcon,
      cardTitle = milestone.milestoneName,
      completedTimelineTitle = milestone.milestoneName,
      completedCardTitle = milestone.milestoneName,
    } = milestoneConfig[milestoneKey as keyof typeof milestoneConfig] || {};

    const tasks: Task[] = [...milestone.tasks]
      .sort((a, b) => a.taskSequence - b.taskSequence)
      .map(
        ({
          taskName,
          taskType,
          done = false,
          inprogress = false,
          fallout = false,
          falloutReason = "",
          link,
        }) => ({
          text: taskName,
          taskType,
          done,
          inprogress,
          fallout,
          falloutReason,
          link,
        }),
      );

    let state = getStepState(
      tasks,
      milestoneKey,
      order,
      isLastMilestone,
      isAnyInCompleted,
    );
    if (
      !([STEP_STATE.COMPLETED, STEP_STATE.OPTIONAL] as string[]).includes(state)
    )
      isAnyInCompleted = true;

    const noteMap = {
      [STEP_STATE.COMPLETED]: "Completed",
      [STEP_STATE.ACTIVE]: "In Progress",
      [STEP_STATE.PENDING]: "Not Started",
      [STEP_STATE.ERROR]: "Fallout",
      [STEP_STATE.OPTIONAL]: "Optional",
      [STEP_STATE.CANCELED]: "Canceled",
    };

    const falloutLink = formatDateTime(
      tasks.find((t) => t.fallout && noteMap[state] === "Fallout" && t.link)
        ?.link?.sys_created_on || null,
    );

    let isMilestoneCompleted = state === STEP_STATE.COMPLETED;

    return {
      timelineTitle,
      cardTitle: isMilestoneCompleted ? completedCardTitle : cardTitle,
      description,
      state,
      note: noteMap[state],
      noteClass: state,
      tasks,
      falloutLink,
      timelineIconFn,
    };
  });
}

function StepCircle({ state, iconFn }: StepCircleProps) {
  const color =
    state === STEP_STATE.COMPLETED
      ? blue
      : state === STEP_STATE.ACTIVE
        ? green
        : state === STEP_STATE.ERROR
          ? red
          : state === STEP_STATE.OPTIONAL
            ? gold
            : slate;

  const bg =
    state === STEP_STATE.COMPLETED
      ? softBlue
      : state === STEP_STATE.ACTIVE
        ? "#f0fbef"
        : state === STEP_STATE.ERROR
          ? softRed
          : state === STEP_STATE.OPTIONAL
            ? softGold
            : "#f3f5f8";

  return (
    <div className="step-circle" style={{ borderColor: color }}>
      <div className="step-circle-inner" style={{ background: bg }}>
        {iconFn(color)}
      </div>
    </div>
  );
}

function StatusPill({ text, color, fill }: StatusPillProps) {
  return (
    <div
      className="status-pill"
      style={{
        color,
        background: fill,
        borderColor: fill,
      }}
    >
      {text}
    </div>
  );
}

function TaskItem({
  done,
  inprogress,
  fallout,
  text,
  falloutReason,
  link,
  onOpenModal,
}: TaskItemProps) {
  const iconColor = fallout
    ? red
    : done
      ? blue
      : inprogress
        ? green
        : "#8a93a5";

  const bgColor = fallout
    ? softRed
    : done
      ? softBlue
      : inprogress
        ? softGreen
        : "#fff";

  return (
    <li className="task-item">
      <span
        className="task-check"
        style={{
          borderColor: iconColor,
          background: bgColor,
        }}
      >
        {done && !fallout && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            stroke={blue}
            strokeWidth="2.5"
          >
            <path d="M2 6l2.2 2.4L10 2.8" />
          </svg>
        )}

        {fallout && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            stroke={red}
            strokeWidth="2.5"
          >
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        )}
      </span>

      <span style={fallout ? { color: red } : undefined}>
        {text}

        {/* {fallout && link && (
          <span>
            {" - "}
            <button
              type="button"
              className="underline text-blue-400 cursor-pointer"
              onClick={() => onOpenModal(link)}
            >
              {link.number}
            </button>
          </span>
        )} */}
      </span>

      {/* {fallout && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-pointer">
                <Info className="w-3 h-3 text-red-500" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              {falloutReason}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )} */}
    </li>
  );
}

function falloutCaseStatusStyle(state: string): {
  color: string;
  background: string;
} {
  const s = state?.toLowerCase();
  if (s === "in progress" || s === "inprogress")
    return { color: "#c47a00", background: "#fef3cd" };
  if (s === "open") return { color: "#0d6e2f", background: "#d6f5e3" };
  if (s === "closed" || s === "resolved")
    return { color: "#1e66d1", background: "#e8f1ff" };
  return { color: "#c47a00", background: "#fef3cd" };
}

function DetailCard({
  title,
  description,
  accent,
  fill,
  iconFn,
  tasks,
  onOpenModal,
}: DetailCardProps) {
  const doneCount = tasks.filter((t) => t.done).length;
  const falloutCases = tasks.filter(
    (t) => t.fallout && t.link && t.link.number,
  );

  return (
    <section
      className="detail-card"
      style={
        {
          "--accent": accent,
          "--fill": fill,
        } as React.CSSProperties
      }
    >
      <div className="detail-header">
        <div
          className="detail-badge"
          style={{
            background: fill,
            color: accent,
          }}
        >
          {iconFn(accent, 24)}
        </div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className="detail-divider" />

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.text}
            done={task.done}
            inprogress={task.inprogress}
            fallout={task.fallout}
            text={task.text}
            accent={accent}
            falloutReason={task.falloutReason}
            link={task.link}
            onOpenModal={onOpenModal}
          />
        ))}
      </ul>

      {falloutCases.length > 0 && (
        <div className="fallout-case-section">
          <div className="fallout-case-section-header">
            <AlertTriangle size={14} color="#db1717" />
            <span>Fallout / Case Details</span>
          </div>
          {falloutCases.map((task) => {
            const statusStyle = falloutCaseStatusStyle(task.link.state);
            const group = [
              task.link.assignment_group,
              task.link.u_sub_assignment_group,
            ]
              .filter(Boolean)
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .join(" · ");
            return (
              <div key={task.link.number} className="fallout-case-card">
                <div className="fallout-case-card-icon">
                  <Ticket size={13} color="#db1717" />
                </div>
                <div className="fallout-case-card-body">
                  <div className="fallout-case-card-top">
                    <span className="fallout-case-number">
                      {task.link.number}
                    </span>
                    <span
                      className="fallout-case-status text-red-800 bg-red-200"
                      // style={{ color: statusStyle.color, background: statusStyle.background }}
                    >
                      Status : {task.link.state}
                    </span>
                  </div>
                  <div className="fallout-case-desc">
                    {task.link.short_description}
                  </div>
                  {group && <div className="fallout-case-group">{group}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="detail-footer" style={{ color: accent }}>
        {doneCount} / {tasks.length} Tasks Completed
      </div>
    </section>
  );
}

function TimelineStep({
  number,
  title,
  state,
  iconFn,
  pillText,
  pillColor,
  pillFill,
  note,
  noteClass,
}: TimelineStepProps) {
  const text = note ? pillText + " since " + note : pillText;
  return (
    <div className={`timeline-step ${state}`}>
      <div className="step-head">
        <div className={`step-index ${state}`}>{number}</div>

        <div className={`step-title ${state}`}>{title}</div>
      </div>

      <div className="step-icon-wrap">
        <StepCircle state={state} iconFn={iconFn} />
      </div>

      <StatusPill text={pillText} color={pillColor} fill={pillFill} />

      {note && (
        <div className={`step-note ${noteClass || ""}`}>Since {note}</div>
      )}
    </div>
  );
}

const FalloutCaseModal = ({ open, setIsModalOpen, link }: CaseModalProps) => {
  if (!link) return null;

  const fields = [
    {
      label: "Assignment Group",
      value: link.assignment_group,
      icon: <Users size={15} className="text-gray-400" />,
    },
    {
      label: "Sub Assignment Group",
      value: link.u_sub_assignment_group,
      icon: <Users size={15} className="text-gray-400" />,
    },
    {
      label: "Parent Category",
      value: link.u_parent_categories,
      icon: <Folder size={15} className="text-gray-400" />,
    },
    {
      label: "Sub Category",
      value: link.u_sub_categories,
      icon: <Tag size={15} className="text-gray-400" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setIsModalOpen}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl overflow-hidden p-0 max-h-[85vh]">
        <DialogTitle>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Ticket size={20} className="text-amber-500" />
              </div>
              <div className="leading-tight">
                <p className="text-xl font-semibold text-gray-900 leading-tight">
                  {link.number}
                </p>
                <p className="text-[12px] text-gray-400">Support ticket</p>
              </div>
            </div>
          </div>
        </DialogTitle>

        {/* Description */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Description
          </p>
          <div className="flex items-center gap-2">
            <Save size={15} className="text-gray-400 shrink-0" />
            <p className="text-[14px] text-gray-800">
              {link.short_description}
            </p>
          </div>
        </div>

        {/* Grid Fields */}
        <div className="px-6 py-4 grid grid-cols-2 gap-5 overflow-y-auto">
          {fields.map(({ label, value, icon }) => (
            <div key={label}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                {label}
              </p>
              <div className="flex items-center gap-2">
                {icon}
                <p className="text-[14px] text-gray-800">{value || "-"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer — Assigned To */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Assigned To
            </p>
            <div className="flex items-center gap-2">
              {link.assigned_to ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <User size={13} className="text-blue-400" />
                  </div>
                  <p className="text-[14px] text-gray-800">
                    {link.assigned_to}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                    <User size={13} className="text-gray-400" />
                  </div>
                  <p className="text-[14px] text-gray-400 italic">Unassigned</p>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function OrderTracker({
  onRefresh,
  isLoading,
  isFromBossOM,
}: OrderTrackerProps) {
  const [detailsOn, setDetailsOn] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);

  const callModel = (link: any) => {
    setSelectedLink(link);
    setIsModelOpen(true);
  };

  const {
    orderTimelineData,
    orderMilestones,
    orderRecord,
    bossOMPage,
    orderDetails,
  } = useAppSelector((state) => state.order);

  const backendData: BackendMilestone[] = orderMilestones?.milestones ?? [];
  const isCanceled = orderDetails?.u_state?.toLowerCase() === "canceled";

  const steps = useMemo(() => {
    const built = buildSteps(backendData, orderRecord);
    if (!isCanceled) return built;
    return built.map((s) => ({
      ...s,
      state: STEP_STATE.CANCELED,
      falloutLink: undefined,
    }));
  }, [backendData, isCanceled]);

  const fetchOrderSummary = () => {
    onRefresh();
  };

  const { connectors, markers } = useMemo(() => {
    const n = steps.length;
    const stepCenter = (k: number) => ((2 * k - 1) / (2 * n)) * 100;
    const connectorWidth = (1 / n) * 100;

    const reached = (s: StepState) =>
      s === STEP_STATE.COMPLETED || s === STEP_STATE.OPTIONAL;

    const connectorType = (l: StepState, r: StepState) => {
      if (l === STEP_STATE.CANCELED || r === STEP_STATE.CANCELED)
        return "canceled";

      if (l === STEP_STATE.COMPLETED && r === STEP_STATE.COMPLETED)
        return "completed";

      if (reached(l) && reached(r)) return "optional";

      return "pending";
    };

    const connectors = Array.from({ length: n - 1 }, (_, i) => ({
      left: stepCenter(i + 1),
      width: connectorWidth,
      type: connectorType(steps[i].state, steps[i + 1].state),
    }));

    const markers = Array.from({ length: n - 1 }, (_, i) => {
      const type = connectorType(steps[i].state, steps[i + 1].state);

      return {
        left: ((i + 1) / n) * 100,
        connectorType: type,
        error: steps[i + 1]?.state === STEP_STATE.ERROR,
      };
    });

    return { connectors, markers };
  }, [steps]);

  if (steps.length === 0) return null;
  const isStickyDisabled = isFromBossOM && !bossOMPage;
  const responsiveClass = steps.length <= 3 ? "lg:w-3/4 lg:mx-auto" : "";
  const isHaveMilestones = orderMilestones?.isHaveMilestones;
  if (!isHaveMilestones) return null;
  return (
    <>
      {/* Sticky Header */}
      <div
        className={cn(
          "bg-[#F9FAFB] z-50 px-6 lg:px-12 flex-col flex justify-center overflow-hidden",
          isStickyDisabled ? "" : "sticky top-0",
        )}
        style={
          {
            height: "var(--milestone-height)",
          } as React.CSSProperties
        }
      >
        <section
          className={cn("timeline w-full", responsiveClass)}
          style={
            {
              "--step-count": steps.length,
            } as React.CSSProperties
          }
        >
          {connectors.map((connector, i) => (
            <div
              key={i}
              className={`timeline-track ${
                connector.type === "completed"
                  ? "timeline-track-complete"
                  : connector.type === "canceled"
                    ? "timeline-track-canceled"
                    : connector.type === "optional"
                      ? "timeline-track-optional"
                      : "timeline-track-pending"
              }`}
              style={{
                left: `${connector.left}%`,
                width: `${connector.width}%`,
              }}
            />
          ))}

          {markers.map((marker, i) => (
            <div
              key={i}
              className={`timeline-marker${
                marker.error
                  ? " error"
                  : marker.connectorType === "canceled"
                    ? " canceled"
                    : marker.connectorType === "completed"
                      ? ""
                      : marker.connectorType === "optional"
                        ? " optional"
                        : " hollow"
              }`}
              style={{ left: `${marker.left}%` }}
            >
              {marker.connectorType === "completed" && !marker.error && (
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path
                    d="M4 8l2.2 2.3L12 5.5"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
              )}
              {marker.connectorType === "optional" && !marker.error && (
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path
                    d="M2 6h8"
                    fill="none"
                    stroke="#f4b73f"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {marker.connectorType === "canceled" && (
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <path
                    d="M3 3l8 8M11 3l-8 8"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {marker.error && (
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <path
                    d="M3 3l8 8M11 3l-8 8"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          ))}

          {steps.map((step, i) => {
            const style = stateStyle(step.state);
            return (
              <TimelineStep
                key={step.timelineTitle}
                number={i + 1}
                title={step.timelineTitle}
                state={step.state}
                iconFn={step.timelineIconFn}
                pillText={isCanceled ? "Canceled" : style.pillText}
                pillColor={style.pillColor}
                pillFill={style.pillFill}
                note={step.falloutLink}
                noteClass={step.noteClass}
              />
            );
          })}
        </section>
        <div className="milestones-header mt-2 flex justify-between items-center w-full">
          <div>
            <h2>Milestone Details</h2>
            <p>Task names and completion counts</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrderSummary}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-all px-2.5 py-1.5 rounded-lg shadow-sm"
            >
              <RefreshCcw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <label className="toggle-wrap">
              <span>{detailsOn ? "Details On" : "Details Off"}</span>

              <input
                type="checkbox"
                checked={detailsOn}
                onChange={(e) => setDetailsOn(e.target.checked)}
              />

              <span className={`switch ${detailsOn ? "on" : "off"}`}>
                <span className="switch-thumb" />
              </span>
            </label>
          </div>
        </div>
      </div>

      <section className={cn("milestones mb-8 px-6 lg:px-12", responsiveClass)}>
        {detailsOn && (
          <div
            className="details-grid"
            style={
              {
                "--step-count": steps.length,
              } as React.CSSProperties
            }
          >
            {steps.map((step) => {
              const { accent, fill } = stateStyle(step.state);

              return (
                <DetailCard
                  key={step.cardTitle}
                  title={step.cardTitle}
                  description={step.description}
                  accent={accent}
                  fill={fill}
                  iconFn={step.timelineIconFn}
                  tasks={step.tasks}
                  onOpenModal={callModel}
                />
              );
            })}
          </div>
        )}
      </section>
      <FalloutCaseModal
        open={isModelOpen}
        setIsModalOpen={setIsModelOpen}
        link={selectedLink}
      />
    </>
  );
}
