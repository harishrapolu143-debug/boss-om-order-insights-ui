// Transform order-update-log.json to the format expected by TimelineView

export interface OrderLogEvent {
  id: string;
  timestamp: string;
  status: string;
  title: string;
  version: number;
  user: string;
  isExpandable: boolean;
  notesType: string;
  tableData?: Array<{
    fieldName: string;
    changedFrom: string;
    changedTo: string;
    id: string;
  }>;
  note?: any;
}

export interface OrderLogGroup {
  groupId: string;
  isGroup: boolean;
  primaryEvent: OrderLogEvent;
  events: OrderLogEvent[];
  title: string;
}

export interface TimelineEvent {
  id: string;
  type: 'order_update' | 'task_created' | 'task_completed' | 'notification' | 'case_update' | 'error';
  title: string;
  timestamp: string;
  actor: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  stage: string;
  details?: {
    taskDetails?: string;
    assignedGroup?: string;
    workNotes?: string;
    caseId?: string;
    executionStatus?: string;
    errorMessage?: string;
  };
  payload?: Record<string, any>;
  version?: number;
  notesType?: string;
  tableData?: Array<{
    fieldName: string;
    changedFrom: string;
    changedTo: string;
    id: string;
  }>;
  // Grouping support
  isGrouped?: boolean;
  subEvents?: SubEvent[];
}

export interface SubEvent {
  id: string;
  title: string;
  timestamp: string;
  actor: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  type: 'order_update' | 'task_created' | 'task_completed' | 'notification' | 'case_update' | 'error';
  tableData?: Array<{
    fieldName: string;
    changedFrom: string;
    changedTo: string;
    id: string;
  }>;
  details?: {
    taskDetails?: string;
    assignedGroup?: string;
    workNotes?: string;
    caseId?: string;
    executionStatus?: string;
    errorMessage?: string;
  };
  payload?: Record<string, any>;
}

function formatTimestamp(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${month} ${day}, ${year} ${displayHours}:${minutes} ${ampm}`;
}

function mapStatusToEventStatus(status: string): 'completed' | 'in_progress' | 'pending' | 'failed' {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('fallout') || statusLower.includes('fail')) {
    return 'failed';
  }
  if (statusLower.includes('complete')) {
    return 'completed';
  }
  if (statusLower.includes('progress')) {
    return 'in_progress';
  }
  return 'completed'; // default for remarks, userRemarks
}

function mapTitleToEventType(title: string): 'order_update' | 'task_created' | 'task_completed' | 'notification' | 'case_update' | 'error' {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('case') && titleLower.includes('created')) {
    return 'case_update';
  }
  if (titleLower.includes('case') && (titleLower.includes('closed') || titleLower.includes('updated'))) {
    return 'case_update';
  }
  if (titleLower.includes('task created')) {
    return 'task_created';
  }
  if (titleLower.includes('task completed')) {
    return 'task_completed';
  }
  if (titleLower.includes('notification')) {
    return 'notification';
  }
  if (titleLower.includes('order updated') || titleLower.includes('order created')) {
    return 'order_update';
  }
  if (titleLower.includes('fallout') || titleLower.includes('error')) {
    return 'error';
  }
  
  // Default based on action
  if (titleLower.includes('completed')) {
    return 'task_completed';
  }
  if (titleLower.includes('created')) {
    return 'task_created';
  }
  
  return 'order_update';
}

function extractStageFromTitle(title: string): string {
  // Extract meaningful stage names from titles
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('directory listing')) {
    return 'Directory Setup';
  }
  if (titleLower.includes('subscription')) {
    return 'Subscription Creation';
  }
  if (titleLower.includes('brim')) {
    return 'BRIM Integration';
  }
  if (titleLower.includes('o2 order completion')) {
    return 'Order Completion';
  }
  if (titleLower.includes('case')) {
    return 'Case Management';
  }
  if (titleLower.includes('fallout')) {
    return 'Exception Handling';
  }
  if (titleLower.includes('dispatch')) {
    return 'Dispatch Process';
  }
  
  return 'Order Processing';
}

function extractDetailsFromEvent(event: OrderLogEvent): TimelineEvent['details'] {
  const details: TimelineEvent['details'] = {};

  // Extract from note if it's an object
  if (event.note && typeof event.note === 'object') {
    if (event.note['Assignment Group']) {
      details.assignedGroup = event.note['Assignment Group'];
    }
    if (event.note['Work Notes']) {
      details.workNotes = typeof event.note['Work Notes'] === 'string' 
        ? event.note['Work Notes'] 
        : JSON.stringify(event.note['Work Notes'], null, 2);
    }
    if (event.note['Description']) {
      details.taskDetails = event.note['Description'];
    }
  } else if (event.note && typeof event.note === 'string') {
    details.taskDetails = event.note;
  }

  // Extract from tableData
  if (event.tableData && event.tableData.length > 0) {
    const workNoteChange = event.tableData.find(td => td.fieldName === 'Work notes');
    if (workNoteChange) {
      details.workNotes = workNoteChange.changedTo;
    }
    
    const assignmentChange = event.tableData.find(td => td.fieldName === 'Assignment Group');
    if (assignmentChange) {
      details.assignedGroup = assignmentChange.changedTo;
    }

    const caseChange = event.tableData.find(td => td.fieldName === 'Case');
    if (caseChange) {
      details.caseId = caseChange.changedTo;
    }
  }

  // Extract case ID from title
  const caseMatch = event.title.match(/CS\d+/);
  if (caseMatch && !details.caseId) {
    details.caseId = caseMatch[0];
  }

  return Object.keys(details).length > 0 ? details : undefined;
}

export function transformOrderLog(orderLogGroups: OrderLogGroup[]): TimelineEvent[] {
  if (!Array.isArray(orderLogGroups)) {
    console.error('transformOrderLog: input is not an array');
    return [];
  }

  const transformedEvents: TimelineEvent[] = [];

  orderLogGroups.forEach((group, index) => {
    if (!group || !group.primaryEvent) {
      console.warn(`Skipping group ${index}: missing group or primaryEvent`);
      return;
    }

    const primaryEvent = group.primaryEvent;
    
    // Use group.title if it's a grouped event, otherwise use primaryEvent.title
    const displayTitle = group.isGroup && group.title 
      ? group.title 
      : primaryEvent.title.trim();
    
    const timelineEvent: TimelineEvent = {
      id: primaryEvent.id,
      type: mapTitleToEventType(primaryEvent.title),
      title: displayTitle,
      timestamp: formatTimestamp(primaryEvent.timestamp),
      actor: primaryEvent.user && primaryEvent.user.trim() !== '' ? primaryEvent.user : 'System',
      status: mapStatusToEventStatus(primaryEvent.status),
      stage: extractStageFromTitle(group.title || primaryEvent.title),
      version: primaryEvent.version,
      notesType: primaryEvent.notesType,
      tableData: primaryEvent.tableData,
      details: extractDetailsFromEvent(primaryEvent),
    };

    // Add payload if note contains structured data
    if (primaryEvent.note && typeof primaryEvent.note === 'object') {
      if (primaryEvent.note.payload) {
        timelineEvent.payload = primaryEvent.note.payload;
      } else {
        // Use the whole note as payload if it's structured
        timelineEvent.payload = primaryEvent.note;
      }
    }

    // Add subEvents if the group has multiple events
    if (group.isGroup && group.events && group.events.length > 1) {
      timelineEvent.isGrouped = true;
      timelineEvent.subEvents = group.events.map(event => ({
        id: event.id,
        title: event.title.trim(),
        timestamp: formatTimestamp(event.timestamp),
        actor: event.user && event.user.trim() !== '' ? event.user : 'System',
        status: mapStatusToEventStatus(event.status),
        type: mapTitleToEventType(event.title),
        tableData: event.tableData,
        details: extractDetailsFromEvent(event),
        payload: event.note && typeof event.note === 'object' ? event.note.payload || event.note : undefined,
      }));
    }

    transformedEvents.push(timelineEvent);
  });

  console.log(`✅ Transformed ${transformedEvents.length} events from ${orderLogGroups.length} groups`);
  return transformedEvents;
}