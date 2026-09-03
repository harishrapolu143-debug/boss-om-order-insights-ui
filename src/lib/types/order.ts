import { NoteTypes, TimelineFilter } from ".";

export type TimelineEventStatus =
  | "fallout"
  | "closed"
  | "in-progress"
  | "completed"
  | "success"
  | "retry"
  | "note";

export interface ApiDetails {
  url?: string;
  method?: string;
  request?: Record<string, any>;
  response?: Record<string, any>;
  errorMessage?: string;
  successMessage?: string;
}

type InteractionSummary = {
  whatHappened: string;
  actionTaken: string;
  interactionOutcome: string;
  businessImpact: string;
};

type RelatedRecord = {
  number: string;
  label: string;
};

type RelatedRecords = {
  supportTicket: RelatedRecord;
  case: RelatedRecord;
  task: RelatedRecord;
};

export type CustomerInteraction = {
  customerName: string;
  accountNumber: string;
  interactedDate: string;
  interactionType: string;
  interactionTitle: string;
  interactionId: string;
  channel: string;
  agentName: string;
  reason: string;
  outcome: string;
  comments: string;
  summary: InteractionSummary;
  relatedRecords: RelatedRecords;
};

export interface TimelineEvent {
  seqNumber: string;
  updatedBy?: string;
  id: string;
  version: number;
  type?:
    | "order_update"
    | "task_created"
    | "task_completed"
    | "notification"
    | "case_update"
    | "error";
  title: string;
  timestamp: string;
  actualTimestamp: string;
  actor?: string;
  status:
    | "userRemarks"
    | "remarks"
    | "milestones"
    | "interfaceLogs"
    | "fallout"
    | "dispatch";
  notesType?: string;
  details?: {
    taskDetails?: string;
    assignedGroup?: string;
    workNotes?: string;
    caseId?: string;
    executionStatus?: string;
    errorMessage?: string;
  };
  payload?: Record<string, any>;
  tableData?: Array<FieldRemarkRow>;
  retryAttempt?: Array<FieldRemarkRow>;
  note?: Record<string, any>;
  // Grouping support
  isGrouped?: boolean;
  subTaskTitle?: string;
  groupedData?: TimelineEvent[];
  apiDetails?: ApiDetails;
  user?: string;
  milestone?: string;
  sourceSystem?: string;
  destinationSystem?: string;
  category?: string;
  errorMessage?: string;
  groupKey?: string;
  parentTitle?: string;
  isCase?: boolean;
  timelineHeader?: string;
  iconStatus?: string;
  retry?: string | string[];
  isExpandable?: boolean;
  description?: string;
  titleFormatter?: (event: TimelineEvent) => string;
  statusColor?: string;
  customerInteraction?: CustomerInteraction[];
  isRepeatedTask?: boolean;
}

export interface Order {
  id: string;
  orderId: string;
  orderAction?: string;
  serviceType?: string;
  networkType?: string;
  createdAt: string;
  orderStatus: string;
  timeline: TimelineEvent[];
  pagination?: any;
  noteTypeCall: any;
  fulfillmentTaskMap?: Map<string, { statusCode: string; title: string; subTitle: string; }> | undefined;
}

export interface OrderDetailProps {
  order: Order;
}

export interface FieldRemarkRow {
  fieldName: string;
  fieldLabel?: string;
  changedFrom?: string;
  changedTo?: string;
  id: string;
}

export interface OrderSummary {
  orderNumber: string,
  topic: string,
  payloadType: string
}

export type TimelineType = "TEXT" | "API" | "TABLE" | "MILESTONE";
