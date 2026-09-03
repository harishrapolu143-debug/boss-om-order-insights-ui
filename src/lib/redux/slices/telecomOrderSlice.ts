/* eslint-disable */
'use client';

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Base URL routes through our Next.js proxy at /boss-order-insights/api/telecom
const baseUrl = '/boss-order-insights/api/telecom';

const buildHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
});

// Strip trailing timezone abbreviations (IST, EST, UTC, GMT, etc.)
const cleanSnapDate = (val?: string | null): string | undefined =>
  val ? String(val).replace(/\s+[A-Z]{2,5}$/, '').trim() : undefined;

const normalizeAccountType = (val?: string | null): string => {
  const selected = String(val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // none selected => Both, both selected => Both, otherwise single selected value
  const set = new Set(selected);
  const hasUnchangedDD = set.has('Unchanged DD');
  const hasRescheduled = set.has('Rescheduled');
  if (set.size === 0 || (hasUnchangedDD && hasRescheduled)) return 'Both';
  return selected[0] || 'Both';
};

const qsToStringPreserveCommas = (qs: URLSearchParams): string =>
  // Backend expects comma-separated values (no %2C).
  qs.toString().replace(/%2C/g, ',');

// ─────────────────────────────────────────────────────────────
// FILTER DEFAULTS THUNK
// ─────────────────────────────────────────────────────────────

export const fetchFilterDefaults = createAsyncThunk(
  'telecomOrder/fetchFilterDefaults',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/filter-defaults`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Filter defaults API error: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// PHASE 1 THUNKS
// ─────────────────────────────────────────────────────────────

export const fetchSummary = createAsyncThunk(
  'telecomOrder/fetchSummary',
  async (params: any, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams({
        from_date: params.fromDate,
        to_date: params.toDate,
        dd_class: normalizeAccountType(params.ddClass)|| 'Both',
        snapshot_at: cleanSnapDate(params.snapDate) || '',
        account_type: (params?.accountType) || '',
        ...(params.team ? { team: params.team } : {}),
        order_action: params.orderAction ?? '',
        network_type: params.watchtowerNetworkType ?? '',
        service_type: params.serviceType ?? '',
        sales_channel: params.salesChannel ?? '',
        state: params.state ?? '',
        status: params.orderStatus ?? '',
        order_status_raw: params.orderStatusRaw ?? '',
        revision_operation: params.revisionOperation ?? params.revisionOp ?? '',
        copper_migrator: params.copperMigrator ?? '',
        dispatch_status: params.dispatchStatus ?? '',
        milestone: params.milestone ?? '',
        migrator_type: params.migratorType ?? '',
      });
      const res = await fetch(`${baseUrl}/summary?${qsToStringPreserveCommas(qs)}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Summary API error: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'telecomOrder/fetchOrders',
  async (params: any, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams({
        from_date: params.fromDate,
        to_date: params.toDate,
        dd_class: normalizeAccountType(params.ddClass) || 'Both',
        category: params.category?.split('|')?.join(',') || '',
        snapshot_at: cleanSnapDate(params?.snapDate) || '',
        date: params?.date,
        page: params.page || 1,
        ...(params.status ? { status: params.status } : {}),
        ...(params.networkType ? { network_type: params.networkType } : {}),
        ...(params.state ? { state: params.state } : {}),
        ...(params.team ? { team: params.team } : {}),
        ...(params.bswDelayed ? { bsw_delayed: 'true' } : {}),
        ...(params.ows ? { ows: 'true' } : {}),
        ...(params.lnpPortingFail ? { lnp_porting_failure: 'true' } : {}),
        ...(params.inJeopardy ? { in_jeopardy: 'true' } : {}),
        ...(params.falloutOnly ? { fallout_only: 'true' } : {}),
        ...(params.custom_filter?.length ? { custom_filter: JSON.stringify(params.custom_filter) } : {}),
        account_type: (params.accountType) || '',
        order_action: params.orderAction ?? '',
        network_type: params.watchtowerNetworkType ?? '',
        service_type: params.serviceType ?? '',
        sales_channel: params.salesChannel ?? '',
        status: params.orderStatus ?? '',
        order_status_raw: params.orderStatusRaw ?? '',
        revision_operation: params.revisionOperation ?? params.revisionOp ?? '',
        copper_migrator: params.copperMigrator ?? '',
        dispatch_status: params.dispatchStatus ?? '',
        milestone: params.milestone ?? '',
        migrator_type: params.migratorType ?? '',
        size:params?.size ??50
      });
      const res = await fetch(`${baseUrl}/orders?${qsToStringPreserveCommas(qs)}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Orders API error: ${res.status}`);
      const json = await res.json();
      return { data: json.data, meta: json.meta };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchOrders1 = createAsyncThunk(
  'telecomOrder/fetchOrders1',
  async (params: any, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams({
        from_date: params.fromDate,
        to_date: params.toDate,
        dd_class: normalizeAccountType(params.ddClass) || 'Both',
        category: params.category?.split('|')?.join(',') || '',
        snapshot_at: cleanSnapDate(params?.snapDate) || '',
        date: params?.date,
        page: params.page || 1,
        ...(params.status ? { status: params.status } : {}),
        ...(params.networkType ? { network_type: params.networkType } : {}),
        ...(params.state ? { state: params.state } : {}),
        ...(params.team ? { team: params.team } : {}),
        ...(params.bswDelayed ? { bsw_delayed: 'true' } : {}),
        ...(params.ows ? { ows: 'true' } : {}),
        ...(params.lnpPortingFail ? { lnp_porting_failure: 'true' } : {}),
        ...(params.inJeopardy ? { in_jeopardy: 'true' } : {}),
        ...(params.falloutOnly ? { fallout_only: 'true' } : {}),
        ...(params.custom_filter?.length ? { custom_filter: JSON.stringify(params.custom_filter) } : {}),
        account_type: (params.accountType) ||'',
        order_action: params.orderAction ?? '',
        network_type: params.watchtowerNetworkType ?? '',
        service_type: params.serviceType ?? '',
        sales_channel: params.salesChannel ?? '',
        status: params.orderStatus ?? '',
        order_status_raw: params.orderStatusRaw ?? '',
        revision_operation: params.revisionOperation ?? params.revisionOp ?? '',
        copper_migrator: params.copperMigrator ?? '',
        dispatch_status: params.dispatchStatus ?? '',
        milestone: params.milestone ?? '',
        migrator_type: params.migratorType ?? '',
        size:params?.size ??50
      });
      const res = await fetch(`${baseUrl}/orders?${qsToStringPreserveCommas(qs)}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Orders API error: ${res.status}`);
      const json = await res.json();
      return { data: json.data, meta: json.meta };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);
export const fetchCustomReportOrders = createAsyncThunk(
  'telecomOrder/fetchCustomReportOrders',
  async (params: any, { rejectWithValue }) => {
    try {
      const body = {
        from_date: params.fromDate,
        to_date: params.toDate,
        dd_class: normalizeAccountType(params.ddClass) || 'Both',
        snapshot_at: cleanSnapDate(params?.snapDate),
        hierarchy: params.hierarchy || [],
        custom_filter: params.custom_filter || [],
        hierarchy_conditions: params.hierarchy_conditions || {},
        date: params?.date,
        node_filters: params.nodeFilters || {},
        account_type: (params.accountType) ||'',
        page: params.page || 1,
        order_action: params.orderAction ?? '',
        network_type: params.watchtowerNetworkType ?? '',
        service_type: params.serviceType ?? '',
        sales_channel: params.salesChannel ?? '',
        state: params.state ?? '',
        order_status: params.orderStatus ?? '',
        order_status_raw: params.orderStatusRaw ?? '',
        revision_operation: params.revisionOperation ?? params.revisionOp ?? '',
        copper_migrator: params.copperMigrator ?? '',
        dispatch_status: params.dispatchStatus ?? '',
        milestone: params.milestone ?? '',
        migrator_type: params.migratorType ?? ''
      };
      const res = await fetch(`${baseUrl}/custom-report/orders`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Custom report orders API error: ${res.status}`);
      const json = await res.json();
      return { data: json.data, meta: json.meta };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const dynamicDndColumns = createAsyncThunk(
  'telecomOrder/fetchDndColumns',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/report-fields`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Dnd Columns API error: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getSavedColumns = createAsyncThunk(
  'telecomOrder/getSavedColumns',
  async (_, { rejectWithValue, dispatch, getState }: any) => {
    const triggerFallback = () => {
      const s = (getState() as any).telecomOrder;
      const { fromDate, toDate } = s.selectedDateRange;
      const ddClass = s.selectedDdClass;
      const snapDate = s.selectedSnapDate;
      const team = s.selectedTeams?.length === 1 ? s.selectedTeams[0] : undefined;
      if (fromDate && toDate && snapDate) {
        dispatch(fetchSummary({ fromDate, toDate, ddClass, snapDate, ...(team ? { team } : {}) }));
      }
    };
    try {
      const qs = new URLSearchParams({ page: '1' });
      const res = await fetch(`${baseUrl}/custom-report/saved?${qs}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Saved Columns API error: ${res.status}`);
      const json = await res.json();
      if (!json.data || json.data.length === 0) {
        triggerFallback();
      }
      return json.data;
    } catch (err: any) {
      triggerFallback();
      return rejectWithValue(err.message);
    }
  }
);

export const getSavedFilters = createAsyncThunk(
  'telecomOrder/getSavedFilters',
  async (_, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams({ page: '1' });
      const res = await fetch(`${baseUrl}/custom-report/filters?${qs}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Saved Filters API error: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const applyDndColumns = createAsyncThunk(
  'telecomOrder/applyDndColumns',
  async (params: any, { rejectWithValue }) => {
    try {
      const body = {
        name: params.configName,
        from_date: params.fromDate,
        to_date: params.toDate,
        dd_class: params.ddClass || 'Both',
        snapshot_at: cleanSnapDate(params.snapDate),
        hierarchy: params.hierarchy || [],
        filters: params.filters || [],
        hierarchy_conditions: params.hierarchy_conditions || {},
        order_action: params.orderAction ?? '',
        network_type: params.watchtowerNetworkType ?? ''
      };
      const res = await fetch(`${baseUrl}/custom-report/save`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Apply Dnd Columns API error: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const applyFilterColumns = createAsyncThunk(
  'telecomOrder/applyFilterColumns',
  async (params: any, { rejectWithValue }) => {
    try {
      const body = {
        name: params.name,
        payload: {
          from_date: params.fromDate,
          to_date: params.toDate,
          dd_class: params.ddClass || 'Both',
          ...(params.team ? { team: params.team } : {}),
          custom_filter: params.custom_filter || []
        }
      };
      const res = await fetch(`${baseUrl}/custom-report/filters/save`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Apply filter columns API error: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSavedFilter = createAsyncThunk(
  'telecomOrder/updateSavedFilter',
  async (params: any, { rejectWithValue }) => {
    try {
      const body = {
        name: params.name,
        payload: {
          from_date: params.fromDate,
          to_date: params.toDate,
          dd_class: params.ddClass || 'Both',
          ...(params.team ? { team: params.team } : {}),
          custom_filter: params.custom_filter || []
        }
      };
      const res = await fetch(`${baseUrl}/custom-report/filters/${params.id}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Update saved filter API error: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteSavedFilter = createAsyncThunk(
  'telecomOrder/deleteSavedFilter',
  async (id: string | number, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/custom-report/filters/${id}`, {
        method: 'DELETE',
        headers: buildHeaders()
      });
      if (!res.ok) throw new Error(`Delete saved filter API error: ${res.status}`);
      return { id };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getRelationalData = createAsyncThunk(
  'telecomOrder/getRelationalData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/relational-data-mapping`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Relational data API error: ${res.status}`);
      const json = await res.json();
      return json.data ?? json;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSavedColumn = createAsyncThunk(
  'telecomOrder/updateSavedColumn',
  async ({ id, hierarchy, filters = [], hierarchy_conditions = {} }: any, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/custom-report/${id}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify({ hierarchy, filters, hierarchy_conditions })
      });
      if (!res.ok) throw new Error(`Update saved report API error: ${res.status}`);
      const json = await res.json();
      return { id, hierarchy, filters, hierarchy_conditions, data: json.data };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteSavedColumn = createAsyncThunk(
  'telecomOrder/deleteSavedColumn',
  async (id: string | number, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/custom-report/${id}`, {
        method: 'DELETE',
        headers: buildHeaders()
      });
      if (!res.ok) throw new Error(`Delete saved report API error: ${res.status}`);
      const data = await res.json();
      return { id, message: data.message };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const displayColumns = createAsyncThunk(
  'telecomOrder/displayColumns',
  async (params: any, { rejectWithValue }) => {
    try {
      const body = {
        name: params.configName,
        from_date: params.fromDate,
        to_date: params.toDate,
        dd_class: normalizeAccountType(params.ddClass) || 'Both',
        snapshot_at: cleanSnapDate(params.snapDate),
        hierarchy: params.hierarchy || [],
        custom_filter: params.custom_filter || [],
        report_name: params.report_name || '',
        hierarchy_conditions: params.hierarchy_conditions || {},
        account_type: (params.accountType) ||'',
        order_action: params.orderAction ?? '',
        network_type: params.watchtowerNetworkType ?? '',
        service_type: params.serviceType ?? '',
        sales_channel: params.salesChannel ?? '',
        state: params.state ?? '',
        order_status: params.orderStatus ?? '',
        order_status_raw: params.orderStatusRaw ?? '',
        revision_operation: params.revisionOperation ?? params.revisionOp ?? '',
        copper_migrator: params.copperMigrator ?? '',
        dispatch_status: params.dispatchStatus ?? '',
        milestone: params.milestone ?? '',
        migrator_type: params.migratorType ?? ''
      };
      const res = await fetch(`${baseUrl}/custom-report`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Display Columns API error: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTeams = createAsyncThunk(
  'telecomOrder/fetchTeams',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/snapshot-dates`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`snapshot-dates API error: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchReportingDates = createAsyncThunk(
  'telecomOrder/fetchReportingDates',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/reporting-dates`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Reporting dates API error: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// PHASE 2 THUNKS
// ─────────────────────────────────────────────────────────────

export const fetchFalloutBreakdown = createAsyncThunk(
  'telecomOrder/fetchFalloutBreakdown',
  async (params: any, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams({
        from_date: params.fromDate,
        to_date: params.toDate,
        dd_class: params.ddClass || 'Both'
      });
      qs.set('orderaction', params.orderAction ?? '');
      qs.set('networktype', params.watchtowerNetworkType ?? '');
      const res = await fetch(`${baseUrl}/fallout-breakdown?${qsToStringPreserveCommas(qs)}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Fallout breakdown API error: ${res.status}`);
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : json;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchJeopardyDetail = createAsyncThunk(
  'telecomOrder/fetchJeopardyDetail',
  async (params: any, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams({
        from_date: params.fromDate,
        to_date: params.toDate,
        dd_class: params.ddClass || 'Both'
      });
      qs.set('orderaction', params.orderAction ?? '');
      qs.set('networktype', params.watchtowerNetworkType ?? '');
      const res = await fetch(`${baseUrl}/jeopardy-detail?${qsToStringPreserveCommas(qs)}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`Jeopardy detail API error: ${res.status}`);
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : json;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const ordersExport = createAsyncThunk(
  'telecomOrder/ordersExport',
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/export`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          from_date: params.fromDate,
          to_date: params.toDate,
          dd_class: normalizeAccountType(params.ddClass) || 'Both',
          snapshot_at: cleanSnapDate(params.snapDate),
          account_type: (params.accountType) ||'',
          category: params.category?.split('|')?.join(',') || '',
          date: params.date,
          order_action: params.orderAction ?? '',
          network_type: params.watchtowerNetworkType ?? ''
        })
      });
      if (!res.ok) throw new Error(`Export API error: ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const exportOrders = createAsyncThunk(
  'telecomOrder/exportOrders',
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/custom-report/orders/export`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          from_date: params.fromDate,
          to_date: params.toDate,
          dd_class: params.ddClass || 'Both',
          hierarchy: params.hierarchy || [],
          node_filters: params.nodeFilters || {},
          date: params.clickedDay,
          snapshot_at: cleanSnapDate(params.snapDate),
          ...(params.teams?.length ? { teams: params.teams } : {}),
          order_action: params.orderAction ?? '',
          network_type: params.watchtowerNetworkType ?? ''
        })
      });
      if (!res.ok) throw new Error(`Export API error: ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// Default date range
// ─────────────────────────────────────────────────────────────

// const getDefaultDateRange = () => {
//   const toDate = new Date();
//   const fromDate = new Date();
//   fromDate.setDate(toDate.getDate());
//   toDate.setDate(toDate.getDate() + 5);
//   const fmt = (d: Date) => d.toISOString().slice(0, 10);
//   return { fromDate: fmt(fromDate), toDate: fmt(toDate) };
// };
const getDefaultDateRange = () => {
  const today = new Date();

  // Normalize to local midnight
  const base = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const fromDate = new Date(base);
  const toDate = new Date(base);
  toDate.setDate(base.getDate() + 5);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return {
    fromDate: fmt(fromDate),
    toDate: fmt(toDate),
  };
};
const { fromDate, toDate } = getDefaultDateRange();

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface DrilldownState {
  open: boolean;
  day: string | null;
  category: string | null;
  ddClass?: string;
  statusFilter?: string;
  filters: Record<string, any>;
  page: number;
  data: any[];
  meta: { total: number; last_page: number; per_page: number };
}

interface TelecomOrderState {
  selectedDateRange: { fromDate: string; toDate: string };
  selectedDdClass: string;
  /** Add | Change — empty string means no filter (same toggle behavior as account type). */
  selectedOrderAction: string;
  /** XGPON | GPON | Copper | 4G LTE — empty means no filter. Sent as networktype to APIs. */
  selectedWatchtowerNetworkType: string;
  selectedTeams: string[];
  selectedSnapDate: string;
  selectedFilters: {
    networkType: string | null;
    state: string | null;
    salesChannel: string | null;
    orderAction: string | null;
  };
  summaryData: any;
  teamsData: any;
  reportingDates: any[];
  dndColumnsData: any;
  applyDndColumnsData: any;
  selectedHierarchy: string[];
  selectedHierarchyConditions: Record<string, any>;
  savedColumnsData: any[];
  selectedSavedReportId: string | number | null;
  savedFiltersData: any[];
  filterDefaultsData: Record<string, string | string[]> | null;
  relationalData: any[];
  falloutData: any[];
  jeopardyData: any[];
  exportState: { loading: boolean; downloadUrl: string | null; filename: string | null; error: string | null };
  panelVisibility: { fallout: boolean; jeopardy: boolean };
  drilldown: DrilldownState;
  drilldown1:any,
  loadingStates: Record<string, LoadingStatus>;
  errors: Record<string, string | null>;
}

// ─────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────

const initialState: TelecomOrderState = {
  selectedDateRange: { fromDate, toDate },
  selectedDdClass: '',
  selectedOrderAction: 'Add,Change',
  selectedWatchtowerNetworkType: 'XGSPON,GPON,4G LTE',
  selectedTeams: [],
  selectedSnapDate: '',
  selectedFilters: { networkType: null, state: null, salesChannel: null, orderAction: null },
  summaryData: null,
  teamsData: [],
  reportingDates: [],
  dndColumnsData: [],
  applyDndColumnsData: null,
  selectedHierarchy: [],
  selectedHierarchyConditions: {},
  savedColumnsData: [],
  selectedSavedReportId: null,
  savedFiltersData: [],
  filterDefaultsData: null,
  relationalData: [],
  falloutData: [],
  jeopardyData: [],
  exportState: { loading: false, downloadUrl: null, filename: null, error: null },
  panelVisibility: { fallout: true, jeopardy: true },
  drilldown: {
    open: false,
    day: null,
    category: null,
    filters: {},
    page: 1,
    data: [],
    meta: { total: 0, last_page: 1, per_page: 50 }
  },
  drilldown1: {
    open: false,
    day: null,
    category: null,
    filters: {},
    page: 1,
    data: [],
    meta: { total: 0, last_page: 1, per_page: 50 }
  },
  loadingStates: {
    summary: 'idle', orders: 'idle',orders1: 'idle', teams: 'idle', dates: 'idle',
    dndColumns: 'idle', applyDndColumns: 'idle', getSavedColumns: 'idle',
    deleteSavedColumn: 'idle', updateSavedColumn: 'idle', displayColumns: 'idle',
    getSavedFilters: 'idle', applyFilterColumns: 'idle', updateSavedFilter: 'idle',
    deleteSavedFilter: 'idle', getRelationalData: 'idle', customReportOrders: 'idle',
    fallout: 'idle', jeopardy: 'idle', export: 'idle', filterDefaults: 'idle'
  },
  errors: {
    summary: null, orders: null,orders1: null, teams: null, dates: null, dndColumns: null,
    applyDndColumns: null, getSavedColumns: null, deleteSavedColumn: null,
    updateSavedColumn: null, displayColumns: null, getSavedFilters: null,
    applyFilterColumns: null, updateSavedFilter: null, deleteSavedFilter: null,
    getRelationalData: null, customReportOrders: null, fallout: null,
    jeopardy: null, export: null, filterDefaults: null
  }
};

// ─────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────

const telecomOrderSlice = createSlice({
  name: 'telecomOrder',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<{ fromDate: string; toDate: string }>) {
      state.selectedDateRange = action.payload;
      state.drilldown.open = false;
    },
    setDdClass(state, action: PayloadAction<string>) {
      state.selectedDdClass = action.payload;
    },
    setOrderAction(state, action: PayloadAction<string>) {
      state.selectedOrderAction = action.payload;
    },
    setWatchtowerNetworkType(state, action: PayloadAction<string>) {
      state.selectedWatchtowerNetworkType = action.payload;
    },
    setSelectedTeams(state, action: PayloadAction<string[]>) {
      state.selectedTeams = action.payload;
    },
    setSelctedSnapDate(state, action: PayloadAction<string>) {
      state.selectedSnapDate = action.payload;
    },
    setFilter(state, action: PayloadAction<{ key: string; value: string | null }>) {
      const { key, value } = action.payload;
      (state.selectedFilters as any)[key] = value || null;
    },
    clearFilters(state) {
      state.selectedFilters = { networkType: null, state: null, salesChannel: null, orderAction: null };
      state.selectedOrderAction = '';
      state.selectedWatchtowerNetworkType = '';
    },
    openDrilldown(state, action: PayloadAction<{ day: string; category: string; filters?: Record<string, any>; snapDate?: any }>) {
      const { day, category, filters = {} } = action.payload;
      state.drilldown.open = true;
      state.drilldown.day = day;
      state.drilldown.category = category;
      state.drilldown.filters = filters;
      state.drilldown.page = 1;
      state.drilldown.data = [];
    },
    closeDrilldown(state) {
      state.drilldown.open = false;
    },
    setDrilldownPage(state, action: PayloadAction<number>) {
      state.drilldown.page = action.payload;
    },
    setSelectedSavedReportId(state, action: PayloadAction<string | number | null>) {
      state.selectedSavedReportId = action.payload;
    },
    toggleFalloutPanel(state) {
      state.panelVisibility.fallout = !state.panelVisibility.fallout;
    },
    toggleJeopardyPanel(state) {
      state.panelVisibility.jeopardy = !state.panelVisibility.jeopardy;
    }
  },
  extraReducers: (builder) => {
    // fetchSummary
    builder
      .addCase(fetchSummary.pending, (s) => { s.loadingStates.summary = 'loading'; s.errors.summary = null; })
      .addCase(fetchSummary.fulfilled, (s, a) => { s.loadingStates.summary = 'succeeded'; s.summaryData = a.payload; })
      .addCase(fetchSummary.rejected, (s, a) => { s.loadingStates.summary = 'failed'; s.errors.summary = a.payload as string; });

    // fetchOrders
    builder
      .addCase(fetchOrders.pending, (s) => { s.loadingStates.orders = 'loading'; s.errors.orders = null; })
      .addCase(fetchOrders.fulfilled, (s, a) => { s.loadingStates.orders = 'succeeded'; s.drilldown.data = a.payload.data; s.drilldown.meta = a.payload.meta; })
      .addCase(fetchOrders.rejected, (s, a) => { s.loadingStates.orders = 'failed'; s.errors.orders = a.payload as string; });
builder
      .addCase(fetchOrders1.pending, (s) => { s.loadingStates.orders1 = 'loading'; s.errors.orders1 = null; })
      .addCase(fetchOrders1.fulfilled, (s, a) => { s.loadingStates.orders1 = 'succeeded'; s.drilldown1.data = a.payload.data; s.drilldown1.meta = a.payload.meta; })
      .addCase(fetchOrders1.rejected, (s, a) => { s.loadingStates.orders1 = 'failed'; s.errors.orders1 = a.payload as string; });

    // fetchTeams
    builder
      .addCase(fetchTeams.pending, (s) => { s.loadingStates.teams = 'loading'; })
      .addCase(fetchTeams.fulfilled, (s, a) => { s.loadingStates.teams = 'succeeded'; s.teamsData = a.payload; })
      .addCase(fetchTeams.rejected, (s, a) => { s.loadingStates.teams = 'failed'; s.errors.teams = a.payload as string; });

    // fetchReportingDates
    builder
      .addCase(fetchReportingDates.pending, (s) => { s.loadingStates.dates = 'loading'; })
      .addCase(fetchReportingDates.fulfilled, (s, a) => { s.loadingStates.dates = 'succeeded'; s.reportingDates = a.payload; })
      .addCase(fetchReportingDates.rejected, (s, a) => { s.loadingStates.dates = 'failed'; s.errors.dates = a.payload as string; });

    // dynamicDndColumns
    builder
      .addCase(dynamicDndColumns.pending, (s) => { s.loadingStates.dndColumns = 'loading'; s.errors.dndColumns = null; })
      .addCase(dynamicDndColumns.fulfilled, (s, a) => { s.loadingStates.dndColumns = 'succeeded'; s.dndColumnsData = a.payload; })
      .addCase(dynamicDndColumns.rejected, (s, a) => { s.loadingStates.dndColumns = 'failed'; s.errors.dndColumns = a.payload as string; });

    // applyDndColumns
    builder
      .addCase(applyDndColumns.pending, (s) => { s.loadingStates.applyDndColumns = 'loading'; s.errors.applyDndColumns = null; })
      .addCase(applyDndColumns.fulfilled, (s, a) => {
        s.loadingStates.applyDndColumns = 'succeeded';
        s.applyDndColumnsData = a.payload;
        s.selectedHierarchy = a.meta.arg.hierarchy || [];
        s.selectedHierarchyConditions = a.meta.arg.hierarchy_conditions || {};
      })
      .addCase(applyDndColumns.rejected, (s, a) => { s.loadingStates.applyDndColumns = 'failed'; s.errors.applyDndColumns = a.payload as string; });

    // getSavedColumns
    builder
      .addCase(getSavedColumns.pending, (s) => { s.loadingStates.getSavedColumns = 'loading'; s.errors.getSavedColumns = null; })
      .addCase(getSavedColumns.fulfilled, (s, a) => {
        s.loadingStates.getSavedColumns = 'succeeded';
        s.savedColumnsData = a.payload || [];
        if (a.payload?.length) {
          const latest = [...a.payload].sort((x: any, y: any) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime())[0];
          s.selectedSavedReportId = latest.id;
        }
      })
      .addCase(getSavedColumns.rejected, (s, a) => { s.loadingStates.getSavedColumns = 'failed'; s.errors.getSavedColumns = a.payload as string; });

    // deleteSavedColumn
    builder
      .addCase(deleteSavedColumn.pending, (s) => { s.loadingStates.deleteSavedColumn = 'loading'; s.errors.deleteSavedColumn = null; })
      .addCase(deleteSavedColumn.fulfilled, (s, a) => {
        s.loadingStates.deleteSavedColumn = 'succeeded';
        s.savedColumnsData = s.savedColumnsData.filter((r: any) => r.id !== a.payload.id);
        if (s.selectedSavedReportId === a.payload.id) {
          s.selectedSavedReportId = s.savedColumnsData[0]?.id || null;
        }
      })
      .addCase(deleteSavedColumn.rejected, (s, a) => { s.loadingStates.deleteSavedColumn = 'failed'; s.errors.deleteSavedColumn = a.payload as string; });

    // updateSavedColumn
    builder
      .addCase(updateSavedColumn.pending, (s) => { s.loadingStates.updateSavedColumn = 'loading'; s.errors.updateSavedColumn = null; })
      .addCase(updateSavedColumn.fulfilled, (s, a) => {
        s.loadingStates.updateSavedColumn = 'succeeded';
        s.savedColumnsData = s.savedColumnsData.map((r: any) =>
          r.id === a.payload.id ? { ...r, hierarchy: a.payload.hierarchy, filters: a.payload.filters, hierarchy_conditions: a.payload.hierarchy_conditions } : r
        );
      })
      .addCase(updateSavedColumn.rejected, (s, a) => { s.loadingStates.updateSavedColumn = 'failed'; s.errors.updateSavedColumn = a.payload as string; });

    // displayColumns
    builder
      .addCase(displayColumns.pending, (s) => { s.loadingStates.displayColumns = 'loading'; s.errors.displayColumns = null; })
      .addCase(displayColumns.fulfilled, (s, a) => {
        s.loadingStates.displayColumns = 'succeeded';
        s.applyDndColumnsData = a.payload;
        s.selectedHierarchy = a.meta.arg.hierarchy || [];
        s.selectedHierarchyConditions = a.meta.arg.hierarchy_conditions || {};
      })
      .addCase(displayColumns.rejected, (s, a) => { s.loadingStates.displayColumns = 'failed'; s.errors.displayColumns = a.payload as string; });

    // fetchCustomReportOrders
    builder
      .addCase(fetchCustomReportOrders.pending, (s) => { s.loadingStates.customReportOrders = 'loading'; s.errors.customReportOrders = null; })
      .addCase(fetchCustomReportOrders.fulfilled, (s, a) => { s.loadingStates.customReportOrders = 'succeeded'; s.drilldown.data = a.payload.data; s.drilldown.meta = a.payload.meta; })
      .addCase(fetchCustomReportOrders.rejected, (s, a) => { s.loadingStates.customReportOrders = 'failed'; s.errors.customReportOrders = a.payload as string; });

    // fetchFalloutBreakdown
    builder
      .addCase(fetchFalloutBreakdown.pending, (s) => { s.loadingStates.fallout = 'loading'; s.errors.fallout = null; })
      .addCase(fetchFalloutBreakdown.fulfilled, (s, a) => { s.loadingStates.fallout = 'succeeded'; s.falloutData = a.payload; })
      .addCase(fetchFalloutBreakdown.rejected, (s, a) => { s.loadingStates.fallout = 'failed'; s.errors.fallout = a.payload as string; });

    // fetchJeopardyDetail
    builder
      .addCase(fetchJeopardyDetail.pending, (s) => { s.loadingStates.jeopardy = 'loading'; s.errors.jeopardy = null; })
      .addCase(fetchJeopardyDetail.fulfilled, (s, a) => { s.loadingStates.jeopardy = 'succeeded'; s.jeopardyData = a.payload; })
      .addCase(fetchJeopardyDetail.rejected, (s, a) => { s.loadingStates.jeopardy = 'failed'; s.errors.jeopardy = a.payload as string; });

    // getSavedFilters
    builder
      .addCase(getSavedFilters.pending, (s) => { s.loadingStates.getSavedFilters = 'loading'; s.errors.getSavedFilters = null; })
      .addCase(getSavedFilters.fulfilled, (s, a) => { s.loadingStates.getSavedFilters = 'succeeded'; s.savedFiltersData = Array.isArray(a.payload) ? a.payload : []; })
      .addCase(getSavedFilters.rejected, (s, a) => { s.loadingStates.getSavedFilters = 'failed'; s.errors.getSavedFilters = a.payload as string; });

    // applyFilterColumns
    builder
      .addCase(applyFilterColumns.pending, (s) => { s.loadingStates.applyFilterColumns = 'loading'; s.errors.applyFilterColumns = null; })
      .addCase(applyFilterColumns.fulfilled, (s) => { s.loadingStates.applyFilterColumns = 'succeeded'; })
      .addCase(applyFilterColumns.rejected, (s, a) => { s.loadingStates.applyFilterColumns = 'failed'; s.errors.applyFilterColumns = a.payload as string; });

    // updateSavedFilter
    builder
      .addCase(updateSavedFilter.pending, (s) => { s.loadingStates.updateSavedFilter = 'loading'; s.errors.updateSavedFilter = null; })
      .addCase(updateSavedFilter.fulfilled, (s, a) => {
        s.loadingStates.updateSavedFilter = 'succeeded';
        if (a.payload?.id) {
          s.savedFiltersData = s.savedFiltersData.map((f: any) => f.id === a.payload.id ? a.payload : f);
        }
      })
      .addCase(updateSavedFilter.rejected, (s, a) => { s.loadingStates.updateSavedFilter = 'failed'; s.errors.updateSavedFilter = a.payload as string; });

    // deleteSavedFilter
    builder
      .addCase(deleteSavedFilter.pending, (s) => { s.loadingStates.deleteSavedFilter = 'loading'; s.errors.deleteSavedFilter = null; })
      .addCase(deleteSavedFilter.fulfilled, (s, a) => { s.loadingStates.deleteSavedFilter = 'succeeded'; s.savedFiltersData = s.savedFiltersData.filter((f: any) => f.id !== a.payload.id); })
      .addCase(deleteSavedFilter.rejected, (s, a) => { s.loadingStates.deleteSavedFilter = 'failed'; s.errors.deleteSavedFilter = a.payload as string; });

    // getRelationalData
    builder
      .addCase(getRelationalData.pending, (s) => { s.loadingStates.getRelationalData = 'loading'; s.errors.getRelationalData = null; })
      .addCase(getRelationalData.fulfilled, (s, a) => { s.loadingStates.getRelationalData = 'succeeded'; s.relationalData = Array.isArray(a.payload) ? a.payload : []; })
      .addCase(getRelationalData.rejected, (s, a) => { s.loadingStates.getRelationalData = 'failed'; s.errors.getRelationalData = a.payload as string; });

    // fetchFilterDefaults
    builder
      .addCase(fetchFilterDefaults.pending, (s) => { s.loadingStates.filterDefaults = 'loading'; s.errors.filterDefaults = null; })
      .addCase(fetchFilterDefaults.fulfilled, (s, a) => { s.loadingStates.filterDefaults = 'succeeded'; s.filterDefaultsData = a.payload; })
      .addCase(fetchFilterDefaults.rejected, (s, a) => { s.loadingStates.filterDefaults = 'failed'; s.errors.filterDefaults = a.payload as string; });

    // exportOrders
    builder
      .addCase(exportOrders.pending, (s) => { s.loadingStates.export = 'loading'; s.exportState.loading = true; s.exportState.error = null; })
      .addCase(exportOrders.fulfilled, (s, a) => {
        s.loadingStates.export = 'succeeded';
        s.exportState = { loading: false, downloadUrl: a.payload.download_url, filename: a.payload.filename, error: null };
      })
      .addCase(exportOrders.rejected, (s, a) => {
        s.loadingStates.export = 'failed';
        s.exportState = { loading: false, downloadUrl: null, filename: null, error: a.payload as string };
      });

    // ordersExport
    builder
      .addCase(ordersExport.pending, (s) => { s.loadingStates.export = 'loading'; s.exportState.loading = true; s.exportState.error = null; })
      .addCase(ordersExport.fulfilled, (s, a) => {
        s.loadingStates.export = 'succeeded';
        s.exportState = { loading: false, downloadUrl: a.payload.download_url, filename: a.payload.filename, error: null };
      })
      .addCase(ordersExport.rejected, (s, a) => {
        s.loadingStates.export = 'failed';
        s.exportState = { loading: false, downloadUrl: null, filename: null, error: a.payload as string };
      });
  }
});

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────

export const {
  setDateRange, setDdClass, setOrderAction, setWatchtowerNetworkType,
  setSelectedTeams, setSelctedSnapDate,
  setFilter, clearFilters, openDrilldown, closeDrilldown, setDrilldownPage,
  setSelectedSavedReportId, toggleFalloutPanel, toggleJeopardyPanel
} = telecomOrderSlice.actions;

// Selectors
export const selectDateRange = (state: any) => state.telecomOrder.selectedDateRange;
export const selectDdClass = (state: any) => state.telecomOrder.selectedDdClass;
export const selectOrderAction = (state: any) => state.telecomOrder.selectedOrderAction;
export const selectWatchtowerNetworkType = (state: any) => state.telecomOrder.selectedWatchtowerNetworkType;
export const selectSelectedTeams = (state: any) => state.telecomOrder.selectedTeams;
export const selectSelectedSnapDate = (state: any) => state.telecomOrder.selectedSnapDate;
export const selectFilters = (state: any) => state.telecomOrder.selectedFilters;
export const selectSummaryData = (state: any) => state.telecomOrder.summaryData;
export const selectTeamsData = (state: any) => state.telecomOrder.teamsData;
export const selectReportingDates = (state: any) => state.telecomOrder.reportingDates;
export const selectDrilldown = (state: any) => state.telecomOrder.drilldown;
export const selectLoadingStates = (state: any) => state.telecomOrder.loadingStates;
export const selectErrors = (state: any) => state.telecomOrder.errors;
export const selectDndColumnsData = (state: any) => state.telecomOrder.dndColumnsData;
export const selectApplyDndColumnsData = (state: any) => state.telecomOrder.applyDndColumnsData;
export const selectSelectedHierarchy = (state: any) => state.telecomOrder.selectedHierarchy;
export const selectSelectedHierarchyConditions = (state: any) => state.telecomOrder.selectedHierarchyConditions;
export const selectSavedColumnsData = (state: any) => state.telecomOrder.savedColumnsData;
export const selectSelectedSavedReportId = (state: any) => state.telecomOrder.selectedSavedReportId;
export const selectSavedFiltersData = (state: any) => state.telecomOrder.savedFiltersData;
export const selectRelationalData = (state: any) => state.telecomOrder.relationalData;
export const selectFalloutData = (state: any) => state.telecomOrder.falloutData;
export const selectJeopardyData = (state: any) => state.telecomOrder.jeopardyData;
export const selectExportState = (state: any) => state.telecomOrder.exportState;
export const selectPanelVisibility = (state: any) => state.telecomOrder.panelVisibility;
export const selectFilterDefaultsData = (state: any) => state.telecomOrder.filterDefaultsData;

export default telecomOrderSlice.reducer;