'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import {
  Card, Tag, Tooltip, Skeleton, Button, Select, Modal,
  Input, Tabs, Table, message, Drawer, ConfigProvider,
} from 'antd';
import {
  DownloadOutlined, FilterOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined,
  DownOutlined, CloseOutlined, CheckOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectDndColumnsData, dynamicDndColumns, selectDateRange, selectSelectedTeams,
  selectDdClass, applyFilterColumns, getSavedFilters, updateSavedFilter,
  deleteSavedFilter, selectSavedFiltersData, selectFilterDefaultsData, fetchFilterDefaults
} from '@/lib/redux/slices/telecomOrderSlice';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ─── Data builder ────────────────────────────────────────────────────────────

function buildMatrixData(treeData: any[]) {
  const dates = [...new Set(treeData?.map((d: any) => d.date))].sort() as string[];
  const nodeMap: Record<string, any> = {};
  const childSet: Record<string, Set<string>> = {};
  const rootKeys = new Set<string>();

  const getOrCreate = (key: string, label: string, level: number) => {
    if (!nodeMap[key]) {
      nodeMap[key] = { label, counts: {}, percentages: {}, trends: {}, level };
      childSet[key] = new Set();
    }
    return nodeMap[key];
  };

  const getLabelValue = (node: any) => {
    const labelKey = Object.keys(node).find((k) => k !== 'count' && k !== 'percentage' && k !== 'trend' && k !== 'children');
    return labelKey ? node[labelKey] : 'Unknown';
  };

  const processNode = (node: any, date: string, parentKey: string | null, level: number) => {
    const label = getLabelValue(node);
    const nodeKey = parentKey ? `${parentKey}|${label}` : String(label);
    const nd = getOrCreate(nodeKey, label, level);
    nd.counts[date] = node.count;
    if (node.percentage !== undefined && node.percentage !== null) nd.percentages[date] = node.percentage;
    if (node.trend !== undefined && node.trend !== null) nd.trends[date] = node.trend;
    if (parentKey) { childSet[parentKey].add(nodeKey); } else { rootKeys.add(nodeKey); }
    (node.children || []).forEach((child: any) => processNode(child, date, nodeKey, level + 1));
  };

  treeData?.forEach(({ date, children: lvl1List = [] }: any) => {
    lvl1List.forEach((level1Node: any) => processNode(level1Node, date, null, 1));
  });

  const buildNode = (key: string): any => {
    const nd = nodeMap[key];
    const kids = Array.from(childSet[key] || []).sort();
    const node: any = { key, data: { label: nd.label, counts: nd.counts, percentages: nd.percentages || {}, trends: nd.trends || {}, level: nd.level, ...nd.counts } };
    if (kids.length) node.children = kids.map(buildNode);
    return node;
  };

  return { dates, nodes: [...rootKeys].map(buildNode) };
}

const LEVEL_STYLE: Record<number, React.CSSProperties> = {
  1: { fontWeight: 800, fontSize: 15, color: '#262626' },
  2: { fontWeight: 700, fontSize: 14, color: '#262626' },
  3: { fontWeight: 600, fontSize: 14, color: '#434343' },
  4: { fontWeight: 500, fontSize: 13, color: '#595959' },
  5: { fontWeight: 500, fontSize: 12, color: '#8c8c8c' },
};

export type WatchtowerFilterTagKey = 'ddClass' | 'accountType' | 'orderAction' | 'networkType';

// ─── Watchtower filter dropdown — stays open, checkbox list, Select + Blank ──
function WtFilterSection({ label, value, onChange, options }: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const hasValue = value.length > 0;
  const realOpts = options;
  const isAllSelected = realOpts.length > 0 && realOpts.every((o) => value.includes(o));

  const handleChange = (newVals: string[]) => {
    if (newVals.includes('__select_all__')) {
      if (isAllSelected) {
        onChange([]);
      } else {
        onChange([...realOpts]);
      }
      return;
    }
    onChange(newVals);
  };

  const allOptions = [
    { label: 'Select', value: '__select_all__' },
    ...realOpts.map((o) => ({ label: o, value: o })),
  ];

  return (
    <div style={{ marginBottom: 16, position: 'relative' }}>
      {/* Label overlay — hidden when dropdown open so search input is visible */}
      {!open && (
        <span style={{
          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
          fontSize: 13, color: '#595959', fontWeight: 500,
          pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      )}
      <ConfigProvider theme={{ token: { colorPrimary: '#faad14', colorPrimaryHover: '#ffd666', colorBorder: '#faad14', colorPrimaryBorder: '#faad14' } }}>
        <Select
          mode="multiple"
          showSearch
          optionFilterProp="label"
          allowClear={false}
          listHeight={200}
          popupClassName="watchtower-filter-select-dropdown"
          dropdownStyle={{ maxHeight: 250 }}
          open={open}
          onDropdownVisibleChange={(v) => { if (v) setOpen(true); else setOpen(false); }}
          onSelect={() => setOpen(true)}
          onDeselect={() => setOpen(true)}
          style={{ width: '100%' }}
          value={value}
          onChange={handleChange}
          tagRender={() => <></>}
          menuItemSelectedIcon={null}
          placeholder={open ? 'Search...' : ' '}
          suffixIcon={
            hasValue ? (
              <CloseOutlined
                style={{ color: '#faad14', fontSize: 11, cursor: 'pointer' }}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onChange([]); setOpen(false); }}
              />
            ) : (
              <DownOutlined
                style={{ color: '#8c8c8c', fontSize: 11, cursor: 'pointer' }}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
              />
            )
          }
          optionRender={(opt) => {
            const v = opt.value as string;
            const checked = v === '__select_all__' ? isAllSelected : value.includes(v);
            const optLabel: React.ReactNode = v === '__select_all__'
              ? <span style={{ color: '#ad6800', fontWeight: 600 }}>Select All</span>
              : <span style={{ fontSize: 13, color: checked ? '#d48806' : '#262626' }}>{opt.label as string}</span>;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0', background: checked ? '#fff7e6' : 'transparent' }}>
                <span style={{
                  width: 14, height: 14, borderRadius: 3,
                  border: `2px solid ${checked ? '#faad14' : '#d9d9d9'}`,
                  background: checked ? '#faad14' : '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>
                  {checked && <CheckOutlined style={{ color: '#fff', fontSize: 9 }} />}
                </span>
                {optLabel}
              </div>
            );
          }}
          options={allOptions}
          notFoundContent={<span style={{ fontSize: 12, color: '#8c8c8c', padding: '6px 10px', display: 'block' }}>No options</span>}
        />
      </ConfigProvider>
    </div>
  );
}

function WatchtowerTag({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: '#fff7e6', border: '1px solid #ffd666',
        borderRadius: 6, padding: '2px 8px',
        fontSize: 12, cursor: 'default', userSelect: 'none',
      }}
    >
      <span style={{ fontWeight: 600, color: '#ad6800' }}>{label}:</span>
      <span style={{ fontWeight: 400, color: '#d48806' }}>{value}</span>
      <span
        onClick={onRemove}
        style={{
          cursor: 'pointer', color: '#faad14', fontSize: 14, fontWeight: 700,
          lineHeight: 1, marginLeft: 2, opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s', width: 14, display: 'inline-block', textAlign: 'center',
        }}
      >
        ×
      </span>
    </span>
  );
}

export type WatchtowerFilterOptions = {
  ddClass?: string[];
  accountType?: string[];
  orderAction?: string[];
  networkType?: string[];
};

export type WatchtowerFiltersPayload = {
  ddClass: string;
  accountType: string;
  orderAction: string;
  watchtowerNetworkType: string;
  serviceType?: string;
  salesChannel?: string;
  state?: string;
  orderStatus?: string;
  orderStatusRaw?: string;
  revisionOperation?: string;
  copperMigrator?: string;
  dispatchStatus?: string;
  milestone?: string;
  migratorType?: string;
};

interface SummaryTreeTableProps {
  summaryData: any;
  ddClass: string;
  loading: boolean;
  onCellClick: (day: string, category: string, extraFilters?: any, data?: any) => void;
  onCreateClick: () => void;
  resetKey: string;
  dndColumns: any;
  savedReports?: any[];
  selectedReportId: any;
  onReportSelect: (id: any) => void;
  onFilterApply: (filter: any[]) => void;
  /** Active watchtower toggles — shown as removable tags under the report date line. */
  accountType?: string;
  orderAction?: string;
  watchtowerNetworkType?: string;
  onRemoveWatchtowerFilter?: (key: WatchtowerFilterTagKey, value: string) => void;
  /** Options for the Watchtower filter drawer (dd class → account → order action → network). */
  watchtowerFilterOptions?: WatchtowerFilterOptions;
  /** Called when the user clicks Apply in the drawer; parent should update store and refetch summary. */
  onWatchtowerFiltersApply?: (payload: WatchtowerFiltersPayload) => void;
  /** Currently applied extra (More Filters) values — used to restore draft state when drawer reopens. */
  watchtowerAppliedFilters?: Record<string, string>;
}

export default function SummaryTreeTable({
  summaryData, ddClass, loading, onCellClick, onCreateClick,
  resetKey, dndColumns, savedReports = [], selectedReportId, onReportSelect, onFilterApply,
  accountType = '',
  orderAction = '',
  watchtowerNetworkType = '',
  onRemoveWatchtowerFilter,
  watchtowerFilterOptions,
  onWatchtowerFiltersApply,
  watchtowerAppliedFilters = {},
}: SummaryTreeTableProps) {
  const { dates, nodes } = useMemo(() => buildMatrixData(summaryData?.tree || []), [summaryData?.tree]);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<number>(-1);

  const dispatch = useDispatch<any>();
  const rawFields = useSelector(selectDndColumnsData);
  const dateRange = useSelector(selectDateRange);
  const selectedTeams = useSelector(selectSelectedTeams);
  const ddClassFromStore = useSelector(selectDdClass);
  const reportFields: any[] = Object.keys(rawFields || {})?.length > 0 ? rawFields?.all_fields : [];
  const savedFilters = useSelector(selectSavedFiltersData);
  const filterDefaultsData = useSelector(selectFilterDefaultsData);

  const toOpts = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
    return String(value || '').split(',').map((s) => s.trim()).filter(Boolean);
  };

  const drawerDdClassOpts = toOpts(filterDefaultsData?.dd_class);
  const drawerAccountTypeOpts = toOpts(filterDefaultsData?.account_type);
  const drawerOrderActionOpts = toOpts(filterDefaultsData?.order_action);
  const drawerNetworkTypeOpts = toOpts(filterDefaultsData?.network_type);

  // Ensure filter-defaults are loaded when drawer is first used
  useEffect(() => {
    if (!filterDefaultsData) dispatch(fetchFilterDefaults());
  }, []);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRows, setFilterRows] = useState<any[]>([{ id: 1, field: null, operator: null, value: null }]);
  const [filterActiveTab, setFilterActiveTab] = useState('create');
  const [filterName, setFilterName] = useState('');
  const [editingFilterId, setEditingFilterId] = useState<any>(null);
  const [creatingFilter, setCreatingFilter] = useState(false);
  const [selectedSavedFilterId, setSelectedSavedFilterId] = useState<string>('None');
  const [deleteFilterModal, setDeleteFilterModal] = useState<{ open: boolean; id: any; name: string }>({ open: false, id: null, name: '' });
  const [deleteFilterInput, setDeleteFilterInput] = useState('');
  const [localFilterOverride, setLocalFilterOverride] = useState<any[] | null>(null);

  const [watchtowerDrawerOpen, setWatchtowerDrawerOpen] = useState(false);
  const [draftDdClass, setDraftDdClass] = useState<string[]>([]);
  // extra filter drafts (non-API, shown in panel for future use)
  const [extraDraftFilters, setExtraDraftFilters] = useState<Record<string, string[]>>({});

  const parseWatchtowerMulti = (s: string) => {
    if (!s || s === 'Both') return [];
    return s.split(',').map((x) => x.trim()).filter(Boolean);
  };

  // Refs so the event handler always reads the latest values without re-registering
  const ddClassRef = useRef(ddClass);
  const watchtowerAppliedFiltersRef = useRef(watchtowerAppliedFilters);
  const reportFieldsRef = useRef(reportFields);
  useEffect(() => { ddClassRef.current = ddClass; });
  useEffect(() => { watchtowerAppliedFiltersRef.current = watchtowerAppliedFilters; });
  useEffect(() => { reportFieldsRef.current = reportFields; });

  const openWatchtowerDrawer = () => {
    setDraftDdClass(parseWatchtowerMulti(ddClassRef.current));
    setExtraDraftFilters({
      serviceType: parseWatchtowerMulti(watchtowerAppliedFiltersRef.current['serviceType'] || ''),
      salesChannel: parseWatchtowerMulti(watchtowerAppliedFiltersRef.current['salesChannel'] || ''),
      state: parseWatchtowerMulti(watchtowerAppliedFiltersRef.current['state'] || ''),
      orderStatus: parseWatchtowerMulti(watchtowerAppliedFiltersRef.current['orderStatus'] || ''),
      orderStatusRaw: parseWatchtowerMulti(watchtowerAppliedFiltersRef.current['orderStatusRaw'] || ''),
      revisionOperation: parseWatchtowerMulti(watchtowerAppliedFiltersRef.current['revisionOperation'] || ''),
      copperMigrator: parseWatchtowerMulti(watchtowerAppliedFiltersRef.current['copperMigrator'] || ''),
      dispatchStatus: parseWatchtowerMulti(watchtowerAppliedFiltersRef.current['dispatchStatus'] || ''),
      milestone: parseWatchtowerMulti(watchtowerAppliedFiltersRef.current['milestone'] || ''),
      migratorType: parseWatchtowerMulti(watchtowerAppliedFiltersRef.current['migratorType'] || ''),
    });
    if (!reportFieldsRef.current?.length) dispatch(dynamicDndColumns());
    setWatchtowerDrawerOpen(true);
  };

  // Registered once — always uses latest values via refs
  useEffect(() => {
    const handler = () => openWatchtowerDrawer();
    window.addEventListener('wt-filter-open', handler);
    return () => window.removeEventListener('wt-filter-open', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWatchtowerFiltersSubmit = () => {
    onWatchtowerFiltersApply?.({
      ddClass: draftDdClass.join(','),
      accountType,
      orderAction,
      watchtowerNetworkType,
      serviceType: (extraDraftFilters['serviceType'] || []).join(','),
      salesChannel: (extraDraftFilters['salesChannel'] || []).join(','),
      state: (extraDraftFilters['state'] || []).join(','),
      orderStatus: (extraDraftFilters['orderStatus'] || []).join(','),
      orderStatusRaw: (extraDraftFilters['orderStatusRaw'] || []).join(','),
      revisionOperation: (extraDraftFilters['revisionOperation'] || []).join(','),
      copperMigrator: (extraDraftFilters['copperMigrator'] || []).join(','),
      dispatchStatus: (extraDraftFilters['dispatchStatus'] || []).join(','),
      milestone: (extraDraftFilters['milestone'] || []).join(','),
      migratorType: (extraDraftFilters['migratorType'] || []).join(','),
    });
    setWatchtowerDrawerOpen(false);
  };

  const wtSelectShared = {
    mode: 'multiple' as const,
    showSearch: true,
    optionFilterProp: 'label' as const,
    allowClear: false,
    listHeight: 240,
    maxTagCount: 0 as const,
    className: 'watchtower-filter-select',
    popupClassName: 'watchtower-filter-select-dropdown',
    dropdownStyle: { maxHeight: 280, overflowY: 'auto' as const },
  };

  const activeCustomFilter = useMemo(() => {
    if (localFilterOverride !== null) return localFilterOverride;
    if (!selectedSavedFilterId || selectedSavedFilterId === 'None') return [];
    const match = (savedFilters as any[]).find((f) => f.id === selectedSavedFilterId);
    return match?.payload?.custom_filter || [];
  }, [selectedSavedFilterId, savedFilters, localFilterOverride]);

  const watchtowerTags = useMemo(() => {
    const tags: { key: WatchtowerFilterTagKey; label: string; value: string }[] = [];
    if (ddClass && ddClass !== 'Both') {
      ddClass.split(',').filter(Boolean).forEach((v) =>
        tags.push({ key: 'ddClass', label: 'Dd Class', value: v })
      );
    }
    if (accountType) {
      accountType.split(',').filter(Boolean).forEach((v) =>
        tags.push({ key: 'accountType', label: 'Account Type', value: v })
      );
    }
    if (orderAction) {
      orderAction.split(',').filter(Boolean).forEach((v) =>
        tags.push({ key: 'orderAction', label: 'Order Action', value: v })
      );
    }
    if (watchtowerNetworkType) {
      watchtowerNetworkType.split(',').filter(Boolean).forEach((v) =>
        tags.push({ key: 'networkType', label: 'Network', value: v })
      );
    }
    return tags;
  }, [ddClass, accountType, orderAction, watchtowerNetworkType]);

  const buildFilterSummaryDisplay = (customFilter: any[], fields: any[]) => {
    if (!customFilter || customFilter.length === 0) return [];
    const OP_MAP: Record<string, string> = {
      'is': '=', 'is not': '!=', 'is_one_of': 'in', 'is_not_one_of': 'not in',
      'contains': 'contains', 'does_not_contain': 'does not contain',
      'starts_with': 'starts with', 'ends_with': 'ends with',
    };
    const parts = customFilter.map((f) => {
      const fieldConfig = fields?.find((field) => field.key === f.column_name);
      const label = fieldConfig ? fieldConfig.label : (f.column_name || 'Unknown');
      const rawOp = f.column_condition || '';
      const opString = OP_MAP[rawOp] ?? rawOp.replace(/_/g, ' ');
      const valueString = Array.isArray(f.column_value) ? f.column_value.join(', ') : f.column_value;
      return `${label} ${opString} ${valueString}`;
    });
    return ['All', ...parts];
  };

  useEffect(() => {
    if (!selectedReportId) return;
    dispatch(getSavedFilters());
    setSelectedSavedFilterId('None');
    setLocalFilterOverride(null);
    onFilterApply?.([]);
  }, [selectedReportId]);

  const handleSavedFilterChange = (id: string) => {
    setSelectedSavedFilterId(id || 'None');
    setLocalFilterOverride(null);
    if (!id || id === 'None') { onFilterApply?.([]); return; }
    const match = (savedFilters as any[]).find((f) => f.id === id);
    onFilterApply?.(match?.payload?.custom_filter || []);
  };

  const getFieldConfig = (fieldKey: string) => (reportFields || []).find((f) => f.key === fieldKey);
  const getOperators = (fieldKey: string) => getFieldConfig(fieldKey)?.operators || [];
  const getAllowedValues = (fieldKey: string) => getFieldConfig(fieldKey)?.allowed_values || [];

  const openFilterModal = () => {
    if (!reportFields?.length) dispatch(dynamicDndColumns());
    setFilterRows([{ id: 1, field: null, operator: null, value: null }]);
    setFilterName('');
    setEditingFilterId(null);
    setFilterActiveTab('create');
    setFilterOpen(true);
  };

  const updateFilterRow = (id: number, patch: any) =>
    setFilterRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const removeFilterRow = (id: number) =>
    setFilterRows((prev) => prev.filter((r) => r.id !== id));

  const addFilterRow = (conjunction: string, afterRowId?: number) =>
    setFilterRows((prev) => {
      const newRow = { id: Date.now(), field: null, operator: null, value: null, conjunction: conjunction || 'AND' };
      if (!afterRowId) return [...prev, newRow];
      const index = prev.findIndex((r) => r.id === afterRowId);
      if (index === -1) return [...prev, newRow];
      return [...prev.slice(0, index + 1), newRow, ...prev.slice(index + 1)];
    });

  const isRowComplete = (row: any) => row.field && row.operator && row.value;

  const handleFilterApply = async () => {
    if (!filterName.trim()) return;
    const custom_filter = filterRows.filter((r) => r.field && r.operator).map((r, i) => ({
      column_name: r.field, column_value: r.value || '', column_condition: r.operator,
      filter_operator: i === 0 ? 'AND' : (r.conjunction || 'AND')
    }));
    const team = Array.isArray(selectedTeams) && selectedTeams.length === 1 ? selectedTeams[0] : undefined;
    if (editingFilterId) {
      try {
        setCreatingFilter(true);
        await dispatch(updateSavedFilter({ id: editingFilterId, name: filterName.trim(), fromDate: dateRange.fromDate, toDate: dateRange.toDate, ddClass: ddClassFromStore || ddClass, team, custom_filter })).unwrap();
        dispatch(getSavedFilters());
        message.success('Filter updated successfully.');
      } catch { message.error('Something Went Wrong'); } finally { setCreatingFilter(false); }
    } else {
      try {
        setCreatingFilter(true);
        const result = await dispatch(applyFilterColumns({ name: filterName.trim(), fromDate: dateRange.fromDate, toDate: dateRange.toDate, ddClass: ddClassFromStore || ddClass, team, custom_filter })).unwrap();
        const newFilters = await dispatch(getSavedFilters()).unwrap();
        setEditingFilterId(null);
        message.success('Filter created successfully.');
        const firstId = result?.[0]?.id || '';
        setSelectedSavedFilterId(firstId || 'None');
      } catch { message.error('Something Went Wrong'); } finally { setCreatingFilter(false); }
    }
    onFilterApply?.(custom_filter);
    setFilterOpen(false);
  };

  const handleFilterReset = () => {
    setFilterRows([{ id: 1, field: null, operator: null, value: null }]);
    setFilterName('');
    setEditingFilterId(null);
    setSelectedSavedFilterId('None');
    onFilterApply?.([]);
    setFilterOpen(false);
  };

  const handleEditSavedFilter = (record: any) => {
    setEditingFilterId(record.id);
    setFilterName(record.name);
    const savedConditions = record.payload?.custom_filter;
    const restoredRows = Array.isArray(savedConditions) && savedConditions.length
      ? savedConditions.map((f: any, idx: number) => ({ id: Date.now() + idx, field: f.column_name || null, operator: f.column_condition || null, value: f.column_value || null, conjunction: idx === 0 ? undefined : (f.filter_operator || 'AND') }))
      : [{ id: 1, field: null, operator: null, value: null }];
    setFilterRows(restoredRows);
    setFilterActiveTab('create');
  };

  const handleDeleteSavedFilter = async (id: any) => {
    try {
      await dispatch(deleteSavedFilter(id)).unwrap();
      setDeleteFilterModal({ open: false, id: null, name: '' });
      setDeleteFilterInput('');
      if (editingFilterId === id) { setEditingFilterId(null); setFilterName(''); setFilterRows([{ id: 1, field: null, operator: null, value: null }]); }
      message.success('Filter deleted successfully.');
    } catch { message.error('Something Went Wrong'); }
  };

  useEffect(() => { if (dates.length) setSortField(dates[dates.length - 1]); }, [dates]);
  useEffect(() => { setExpandedKeys({ "Total orders due": true }); }, [resetKey]);

  const collectDescendantKeys = (node: any): string[] => {
    const keys: string[] = [];
    (node.children || []).forEach((child: any) => { keys.push(child.key); keys.push(...collectDescendantKeys(child)); });
    return keys;
  };

  const findNode = (nodeList: any[], key: string): any => {
    for (const n of nodeList) {
      if (n.key === key) return n;
      const found = findNode(n.children || [], key);
      if (found) return found;
    }
    return null;
  };

  const handleToggle = (e: any) => {
    const next = e.value;
    const collapsedKey = Object.keys(expandedKeys).find((k) => !next[k]);
    if (collapsedKey) {
      const collapsedNode = findNode(nodes, collapsedKey);
      if (collapsedNode) {
        const toRemove = collectDescendantKeys(collapsedNode);
        const cleaned = { ...next };
        toRemove.forEach((k) => delete cleaned[k]);
        setExpandedKeys(cleaned);
        return;
      }
    }
    setExpandedKeys(next);
  };

  useEffect(() => {
    if (nodes && nodes?.length && Object.keys(expandedKeys)?.length === 1) {
      const expanded: any = { "Total orders due|Orders in jeopardy": true };
      nodes.forEach((node: any) => {
        expanded[node.key] = true;
      });
      setExpandedKeys(expanded);
    }
  }, [nodes]);

  const handleDownload = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Daily Order Summary');
    const EXCEL_LEVEL: Record<number, any> = {
      1: { bold: true, size: 12, argb: 'FF1677FF', indent: 0, rowArgb: 'FFE6F4FF' },
      2: { bold: true, size: 11, argb: 'FF262626', indent: 1, rowArgb: 'FFFAFAFA' },
      3: { bold: false, size: 10, argb: 'FF434343', indent: 2, rowArgb: 'FFFFFFFF' },
      4: { bold: false, size: 10, argb: 'FF595959', indent: 3, rowArgb: 'FFFFFFFF' },
      5: { bold: false, size: 10, argb: 'FF8C8C8C', indent: 4, rowArgb: 'FFFFFFFF' },
    };
    ws.getColumn(1).width = 42;
    dates.forEach((_, i) => { ws.getColumn(i + 2).width = 14; });
    const fmtHeader = (iso: string) => {
      const d = new Date(`${iso}T00:00:00`);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const headerRow = ws.addRow(['Category', ...dates.map(fmtHeader)]);
    headerRow.height = 28;
    headerRow.eachCell((cell: any, col: number) => {
      cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD44A12' } };
      cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'center', wrapText: true };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } } };
    });
    const writeNode = (node: any) => {
      const lv = EXCEL_LEVEL[node.data.level] || EXCEL_LEVEL[3];
      const values = [node.data.label, ...dates.map((d) => node.data.counts?.[d] ?? '')];
      const row = ws.addRow(values);
      row.height = 20;
      const catCell = row.getCell(1) as any;
      catCell.font = { bold: lv.bold, size: lv.size, color: { argb: lv.argb } };
      catCell.alignment = { indent: lv.indent, vertical: 'middle' };
      catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lv.rowArgb } };
      dates.forEach((_: string, i: number) => {
        const cell = row.getCell(i + 2) as any;
        cell.font = { bold: lv.bold, size: lv.size, color: { argb: lv.argb } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lv.rowArgb } };
        if (typeof cell.value === 'number') cell.numFmt = '#,##0';
      });
      (node.children || []).forEach(writeNode);
    };
    nodes.forEach(writeNode);
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'daily_order_summary.xlsx');
  };

  const labelBody = (node: any) => {
    const style = LEVEL_STYLE[node.data.level] || LEVEL_STYLE[3];
    return <span style={{ ...style, paddingLeft: node.data.level > 1 ? 4 : 0 }}>{node.data.label}</span>;
  };
  type DateDiffResult = {
    days: number;
    status: "past" | "today" | "future";
  };



  const getDateDiff = (dateStr?: string | null): DateDiffResult | null => {
    if (!dateStr) return null;

    // Parse the input as LOCAL date (not UTC)
    const [year, month, day] = dateStr.split("-").map(Number);
    const targetLocal = new Date(year, month - 1, day);

    // Today's local date at midnight
    const today = new Date();
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Difference in milliseconds
    const diffInMs = targetLocal.getTime() - todayLocal.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Determine status
    const status: "past" | "today" | "future" =
      diffInDays === 0 ? "today" : diffInDays < 0 ? "past" : "future";

    return {
      days: Math.abs(diffInDays),
      status,
    };
  };
  const formatDateHeader = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    const dow = d.toLocaleDateString('en-US', { weekday: 'short' });
    const day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    let { days, status }: any = getDateDiff(iso)
    return (
      <div style={{ textAlign: 'center', lineHeight: 1.5 }}>
        <div style={{ fontSize: 11, fontWeight: 400 }}>{dow} [DD{status == 'past' ? '+' : status == 'future' ? '-' : ''}{status !== 'today' && days}]</div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{day}</div>
        {/* <div style={{ fontSize: 11, fontWeight: 400 }}> DD{status == 'past' ? '+' : status == 'future' ? '-' : ''}{status !== 'today' && days}</div> */}
      </div>
    );
  };

  const cellTemplate = (node: any, date: string) => {
    const value = node.data.counts?.[date];
    const pct = node.data.percentages?.[date];
    const isClickable = value !== undefined && value !== null && !!onCellClick;
    if (value === undefined || value === null) {
      return <span style={{ display: 'block', color: '#bfbfbf', textAlign: 'right' }}>—</span>;
    }
    const levelStyle = LEVEL_STYLE[node.data.level] || LEVEL_STYLE[3];
    const cell = (
      <span
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, cursor: isClickable ? 'pointer' : 'default', padding: '2px 4px', borderRadius: 4, transition: 'background 0.15s' }}
        className={isClickable ? 'matrix-cell-clickable' : ''}
        onClick={() => {
          if (!isClickable) return;
          const rootLabel = nodes[0]?.data?.label || 'total';
          const labelPath = node.key.replace(/^total/, rootLabel);
          onCellClick(date, labelPath, node.data, node);
        }}>
        <span style={{ fontWeight: levelStyle.fontWeight, color: levelStyle.color as string }}>
          {Number(value).toLocaleString()}
        </span>
        {pct !== undefined && pct !== null && (
          <span style={{
            fontSize: 11,
            fontWeight: 400,
            color: '#424141ff',
            whiteSpace: 'nowrap',
          }}>
            ({Number(pct).toFixed(1)}%)
          </span>
        )}
      </span>
    );
    return isClickable ? <Tooltip title="Click to drill down" mouseEnterDelay={0.5}>{cell}</Tooltip> : cell;
  };
// console.log(loading,nodes.length,'nodes')
  if (loading) {
    return <Card bordered={false} style={{ borderRadius: 8 }}><Skeleton active paragraph={{ rows: 8 }} /></Card>;
  }
  const getSymbol = (status: string) => {
    switch (status) {
      case "today":
        return "+"
      case "past":
        return "+"
      default:
        return "-"
    }
  }

  const getHeaderStyle = (date: string) => {
    const { days, status }: any = getDateDiff(date); // your existing function
    switch (status) {
      case "future":
        return { backgroundColor: "#FFF7D6", color: "#000", width: '150px', minWidth: '150px' };
      case "today":
        return { backgroundColor: "#595858", color: "#FFF", width: '150px', minWidth: '150px' };
      case "past":
        return { backgroundColor: "#FFF7D6", color: "#000", width: '150px', minWidth: '150px' };
      default:
        return {};
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, width: '100%', overflowX: 'hidden' }}>
      {activeCustomFilter && activeCustomFilter.length > 0 && (() => {
        const parts = buildFilterSummaryDisplay(activeCustomFilter, reportFields);
        const handleSeparatorClick = (separatorIndex: number) => {
          const newFilter = activeCustomFilter.slice(0, separatorIndex);
          setLocalFilterOverride(newFilter);
          onFilterApply?.(newFilter);
        };
        return (
          <div style={{ background: '#fff', border: '1px solid #e6eaf0', borderRadius: 6, padding: '6px 14px', display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {parts.map((part, index, arr) => (
              <React.Fragment key={index}>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: index === 0 ? 700 : 500, color: index === 0 ? '#fdbb0b' : '#262626', background: index === 0 ? '#fff9e6' : '#f5f5f5', border: index === 0 ? '1px solid #ffe491' : '1px solid #e0e0e0', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  {part}
                </span>
                {index < arr.length - 1 && (
                  <span title={index === 0 ? 'Click to clear all filters' : `Click to remove conditions after "${part}"`}
                    onClick={() => handleSeparatorClick(index)}
                    style={{ display: 'inline-flex', alignItems: 'center', padding: '0 4px', fontSize: 15, fontWeight: 600, color: '#bfbfbf', cursor: 'pointer', userSelect: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ff4d4f')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#bfbfbf')}>
                    ›
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        );
      })()}

      <Card
        bordered={false}
        style={{ borderRadius: 8, minWidth: 0, overflow: 'hidden' }}
        title={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0', minWidth: 0, width: '100%' }}>
            {/* ── Row 1: date range label + export controls ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, minWidth: 0 }}>
              {dateRange?.fromDate && dateRange?.toDate && (() => {
                const fromDiff: any = getDateDiff(dateRange?.fromDate);
                const toDiff: any = getDateDiff(dateRange?.toDate);
                return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 500, color: '#000000', flexShrink: 0 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: 'nowrap' }}>Report is generated for</h3>
                    DD{fromDiff?.status !== 'today' && getSymbol(fromDiff.status)}{fromDiff?.status !== 'today' && fromDiff.days}
                    <span style={{ color: '#000000', fontSize: 11 }}>→</span>
                    DD{toDiff?.status !== 'today' && getSymbol(toDiff.status)}{toDiff?.status !== 'today' && toDiff.days}
                  </span>
                );
              })()}

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, rowGap: 6, marginLeft: 'auto' }}>
                {loading && <Tag color="warning">Refreshing…</Tag>}
                {savedReports.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden', height: 28 }}>
                    <span style={{ fontSize: 12, color: '#595959', whiteSpace: 'nowrap', padding: '0 6px 0 8px', display: 'flex', alignItems: 'center' }}>Custom Report :</span>
                    <Select size="small" value={selectedReportId} onChange={onReportSelect}
                      options={savedReports.map((r) => ({ label: r.name, value: r.id }))}
                      placeholder="Saved reports" variant="borderless" style={{ minWidth: 130, maxWidth: 200 }} />
                  </div>
                )}
                {(savedFilters as any[]).length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden', height: 28 }}>
                    <span style={{ fontSize: 12, color: '#595959', whiteSpace: 'nowrap', padding: '0 6px 0 8px', display: 'flex', alignItems: 'center' }}>Filters :</span>
                    <Select size="small" value={selectedSavedFilterId} onChange={handleSavedFilterChange}
                      options={[{ label: 'None', value: 'None' }, ...(savedFilters as any[]).map((f: any) => ({ label: f.name, value: f.id }))]}
                      placeholder="Saved filters" variant="borderless" style={{ minWidth: 120, maxWidth: 180 }} />
                  </div>
                )}
                <Button icon={<DownloadOutlined />} size="small" style={{ borderColor: '#52c41a', color: '#52c41a' }} onClick={handleDownload}>Export</Button>
              </div>
            </div>

            {/* ── Row 2: watchtower active-filter tags (horizontally scrollable on mobile) ── */}
            {watchtowerTags.length > 0 && (
              <div className="wt-tag-strip" style={{ overflowX: 'auto', overflowY: 'hidden', display: 'flex', gap: 6, paddingBottom: 2, scrollbarWidth: 'none' }}>
                {watchtowerTags.map((t) => (
                  <div key={`${t.key}-${t.value}`} style={{ flexShrink: 0 }}>
                    <WatchtowerTag
                      label={t.label}
                      value={t.value}
                      onRemove={() => onRemoveWatchtowerFilter?.(t.key, t.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        }
        styles={{ body: { padding: 0 } }}>

        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined style={{ color: '#d48806' }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#ad6800' }}>More Filters</span>
            </div>
          }
          placement="right"
          width={320}
          open={watchtowerDrawerOpen}
          onClose={() => setWatchtowerDrawerOpen(false)}
          destroyOnClose={false}
          rootClassName="watchtower-filter-drawer"
          styles={{
            body: { padding: '16px 16px 100px', overflowY: 'auto' },
            footer: { borderTop: '1px solid #ffe58f', background: '#fffef7', padding: '12px 16px' },
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setWatchtowerDrawerOpen(false)} className="wt-cancel-btn" style={{ borderColor: '#d9d9d9' }}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleWatchtowerFiltersSubmit}
                style={{ background: '#d4a017', borderColor: '#d4a017', fontWeight: 600 }}
              >
                Submit
              </Button>
            </div>
          }
        >
          {/* Filter sections — WtFilterSection is a proper component with its own open state */}
          {(() => {
            const getFieldOptions = (fieldKey: string): string[] => {
              const defaults = toOpts((filterDefaultsData as any)?.[fieldKey]);
              if (defaults.length) return defaults;
              const f = (reportFields || []).find((rf: any) => rf.key === fieldKey);
              return f?.allowed_values || [];
            };
            const extraVal = (key: string) => extraDraftFilters[key] || [];
            const setExtra = (key: string) => (v: string[]) =>
              setExtraDraftFilters((prev) => ({ ...prev, [key]: v }));
            return (
              <div>
                <WtFilterSection label="DD Class" value={draftDdClass} onChange={setDraftDdClass} options={drawerDdClassOpts.length ? drawerDdClassOpts : (watchtowerFilterOptions?.ddClass ?? [])} />
                <WtFilterSection label="Service Type" value={extraVal('serviceType')} onChange={setExtra('serviceType')} options={getFieldOptions('service_type')} />
                <WtFilterSection label="Sales Channel" value={extraVal('salesChannel')} onChange={setExtra('salesChannel')} options={getFieldOptions('sales_channel')} />
                <WtFilterSection label="State" value={extraVal('state')} onChange={setExtra('state')} options={getFieldOptions('state')} />
                {/* <WtFilterSection label="Order Date" value={extraVal('orderDate')} onChange={setExtra('orderDate')} options={getFieldOptions('order_date')} />
                <WtFilterSection label="Actual End Date" value={extraVal('actualEndDate')} onChange={setExtra('actualEndDate')} options={getFieldOptions('actual_end_date')} /> */}
                {/* <WtFilterSection label="Order Status" value={extraVal('orderStatus')} onChange={setExtra('orderStatus')} options={getFieldOptions('status')} />
                <WtFilterSection label="Order Status Raw" value={extraVal('orderStatusRaw')} onChange={setExtra('orderStatusRaw')} options={getFieldOptions('order_status_raw')} /> */}
                <WtFilterSection label="Revision Operation" value={extraVal('revisionOperation')} onChange={setExtra('revisionOperation')} options={getFieldOptions('revision_operation')} />
                {/* <WtFilterSection label="Copper Migrator" value={extraVal('copperMigrator')} onChange={setExtra('copperMigrator')} options={getFieldOptions('copper_migrator')} /> */}
                <WtFilterSection label="Dispatch Status" value={extraVal('dispatchStatus')} onChange={setExtra('dispatchStatus')} options={getFieldOptions('dispatch_status')} />
                <WtFilterSection label="Milestone" value={extraVal('milestone')} onChange={setExtra('milestone')} options={getFieldOptions('milestone')} />
                <WtFilterSection label="Migrator Type" value={extraVal('migratorType')} onChange={setExtra('migratorType')} options={getFieldOptions('migrator_type')} />
              </div>
            );
          })()}
        </Drawer>

        {/* Filter Modal */}
        <Modal
          title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FilterOutlined style={{ color: '#8c8c8c' }} /><span style={{ fontSize: 15, fontWeight: 600 }}>Filter Conditions</span></div>}
          open={filterOpen}
          onCancel={() => setFilterOpen(false)}
          width={780}
          rootClassName="filter-conditions-modal"
          destroyOnClose
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button className="filter-modal-reset" onClick={handleFilterReset}>Reset</Button>
              {filterActiveTab === 'create' && (
                <Button type="primary" onClick={handleFilterApply} disabled={!filterName.trim()} loading={creatingFilter} style={{ background: '#d4a017', borderColor: '#d4a017' }}>
                  {editingFilterId ? 'Update' : 'Create'}
                </Button>
              )}
            </div>
          }>
          <Tabs activeKey={filterActiveTab} onChange={setFilterActiveTab} className="filter-modal-tabs"
            items={[
              {
                key: 'create',
                label: editingFilterId ? 'Update Filter' : 'Create Filter',
                children: (
                  <React.Fragment>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>Name</div>
                      <Input placeholder="Enter filter name" value={filterName}
                        onChange={(e) => !editingFilterId && setFilterName(e.target.value)}
                        maxLength={100} readOnly={!!editingFilterId} allowClear={!editingFilterId}
                        style={editingFilterId ? { background: '#f5f5f5', cursor: 'not-allowed', color: '#8c8c8c' } : {}} />
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 10, fontStyle: 'italic' }}>All of these conditions must be met</div>
                    <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {filterRows.map((row, index) => {
                          const ops = getOperators(row.field);
                          const vals = getAllowedValues(row.field);
                          const isFirst = index === 0;
                          const rowComplete = isRowComplete(row);
                          return (
                            <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, flexShrink: 0, textAlign: 'right' }}>
                                {!isFirst && <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 500 }}>{row.conjunction === 'OR' ? 'or' : ''}</span>}
                              </div>
                              <Select placeholder="-- choose field --" value={row.field}
                                onChange={(val) => updateFilterRow(row.id, { field: val, operator: null, value: null })}
                                style={{ flex: 1 }} showSearch optionFilterProp="label"
                                options={(reportFields || []).map((f: any) => ({ label: f.label, value: f.key }))} />
                              <Select placeholder="-- oper --" value={row.operator}
                                onChange={(val) => updateFilterRow(row.id, { operator: val, value: null })}
                                style={{ flex: 1 }} disabled={!row.field}
                                options={ops.map((op: any) => { const name = typeof op === 'object' ? op.name : op; return { label: name.replace(/_/g, ' '), value: name }; })} />
                              <Select placeholder="-- value --" value={row.value}
                                onChange={(val) => updateFilterRow(row.id, { value: val })}
                                style={{ flex: 1 }} disabled={!row.operator}
                                options={vals.map((v: string) => ({ label: v, value: v }))}
                                showSearch optionFilterProp="label" />
                              {rowComplete ? (
                                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                  <button onClick={() => addFilterRow('AND')} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#333', background: '#fff', border: '1.5px solid #d9d9d9', borderRadius: 4, cursor: 'pointer' }}>AND</button>
                                  <button onClick={() => addFilterRow('OR', row.id)} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#333', background: '#fff', border: '1.5px solid #d9d9d9', borderRadius: 4, cursor: 'pointer' }}>OR</button>
                                </div>
                              ) : <div style={{ width: 78, flexShrink: 0 }} />}
                              {!isFirst ? (
                                <CloseCircleOutlined onClick={() => removeFilterRow(row.id)} style={{ color: '#6d6d6d', fontSize: 18, cursor: 'pointer', flexShrink: 0 }} />
                              ) : <div style={{ width: 18, flexShrink: 0 }} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </React.Fragment>
                )
              },
              {
                key: 'saved',
                label: 'Saved Filters',
                children: (
                  <Table size="small" rowKey="id" dataSource={savedFilters as any[]}
                    pagination={{ pageSize: 8, size: 'small', hideOnSinglePage: true }}
                    locale={{ emptyText: 'No saved filters yet.' }}
                    columns={[
                      { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true },
                      { title: 'Conditions', key: 'conditions', render: (_: any, record: any) => record.payload?.custom_filter?.length || 0, width: 90, align: 'center' as const },
                      {
                        title: 'Action', key: 'actions', width: 80, align: 'center' as const,
                        render: (_: any, record: any) => (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                            <Tooltip title="Update"><EditOutlined style={{ color: '#d4a017', cursor: 'pointer', fontSize: 14 }} onClick={() => handleEditSavedFilter(record)} /></Tooltip>
                            <Tooltip title="Delete"><DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 14 }} onClick={() => { setDeleteFilterModal({ open: true, id: record.id, name: record.name }); setDeleteFilterInput(''); }} /></Tooltip>
                          </div>
                        )
                      }
                    ]}
                  />
                )
              }
            ]}
          />
        </Modal>

        {/* Delete Filter Modal */}
        <Modal open={deleteFilterModal.open} title={<span style={{ color: '#ff4d4f' }}>Delete Filter?</span>}
          onCancel={() => { setDeleteFilterModal({ open: false, id: null, name: '' }); setDeleteFilterInput(''); }}
          footer={[
            <Button key="cancel" onClick={() => { setDeleteFilterModal({ open: false, id: null, name: '' }); setDeleteFilterInput(''); }}>Cancel</Button>,
            <Button key="delete" danger type="primary" disabled={deleteFilterInput !== 'DELETE'} onClick={() => handleDeleteSavedFilter(deleteFilterModal.id)}>Delete</Button>
          ]}>
          <p style={{ marginBottom: 4 }}>To confirm, type <strong>DELETE</strong> in the field below.</p>
          <Input placeholder="Type DELETE to confirm" value={deleteFilterInput} onChange={(e) => setDeleteFilterInput(e.target.value)} />
        </Modal>

          <style>{`
        /* Allow card header title to grow and wrap for responsive toolbar */
        .ant-card-head { height: auto !important; min-height: 48px; padding: 8px 16px !important; overflow: hidden; }
        .ant-card-head-wrapper { flex-wrap: wrap; gap: 4px; min-width: 0; }
        .ant-card-head-title { flex: 1 1 auto; white-space: normal !important; padding: 4px 0; min-width: 0; overflow: hidden; }
        .ant-card-extra { flex: 1 1 auto; padding: 4px 0; }
        /* Hide scrollbar on tag strip */
        .wt-tag-strip::-webkit-scrollbar { display: none; }

        @media (max-width: 639px) {
          .ant-card-head { padding: 6px 10px !important; }
        }

        .matrix-cell-clickable:hover { background: rgba(212, 160, 23, 0.08); }

        /* ── Filter modal: tabs ── */
        .filter-modal-tabs .ant-tabs-tab:hover { color: #d4a017 !important; }
        .filter-modal-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #d4a017 !important; }
        .filter-modal-tabs .ant-tabs-ink-bar { background: #d4a017 !important; }

        /* ── Filter modal: inputs & selects hover/focus borders ── */
        .filter-modal-input:hover,
        .filter-modal-input:focus { border-color: #d4a017 !important; box-shadow: 0 0 0 2px rgba(212,160,23,0.15) !important; }
        .filter-modal-select .ant-select-selector:hover,
        .filter-modal-select.ant-select-focused .ant-select-selector { border-color: #d4a017 !important; box-shadow: 0 0 0 2px rgba(212,160,23,0.15) !important; }

        /* ── Filter modal: Reset button hover ── */
        .filter-modal-reset:hover { border-color: #d4a017 !important; color: #d4a017 !important; }
        .wt-cancel-btn:hover { border-color: #faad14 !important; color: #d48806 !important; }

        /* ── Filter modal: inputs & selects hover/focus (scoped to this modal) ── */
        .filter-conditions-modal .ant-select:not(.ant-select-disabled):hover .ant-select-selector { border-color: #d4a017 !important; }
        .filter-conditions-modal .ant-select-focused .ant-select-selector { border-color: #d4a017 !important; box-shadow: 0 0 0 2px rgba(212,160,23,0.15) !important; }
        .filter-conditions-modal .ant-input:hover { border-color: #d4a017 !important; }
        .filter-conditions-modal .ant-input:focus,
        .filter-conditions-modal .ant-input-focused { border-color: #d4a017 !important; box-shadow: 0 0 0 2px rgba(212,160,23,0.15) !important; }
        /* Dropdown option highlight */
        .ant-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) { background: #fffbe6 !important; }
        .ant-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) { background: #fff8e1 !important; }

        .p-treetable .p-treetable-thead > tr > th {
          background: #FFFBE6 ;
          border-bottom: 1px solid #b5b5b5 !important;
          padding: 10px 12px;
        }
        /* Header first column */
        .p-treetable .p-treetable-thead > tr > th:first-child {
          position: sticky !important;
          left: 0 !important;
          z-index: 10 !important; /* increase */
          background: #FFFBE6 !important;
        }

        /* Body first column */
        .p-treetable .p-treetable-tbody > tr > td:first-child {
          position: sticky !important;
          left: 0 !important;
          z-index: 5 !important; /* must be lower than header */
          background: #ffffff !important;
        }
        /* Override PrimeReact lara-light-indigo blue on sortable / highlighted headers */
        .p-treetable .p-sortable-column:not(.p-highlight):hover {
          background: #FFF3C4 ;
          color: #D44A12;
        }
        .p-treetable .p-sortable-column.p-highlight {
          background: #FFF3C4 ;
          color: #D44A12 ;
        }
        .p-treetable .p-sortable-column.p-highlight .p-sortable-column-icon {
          color: #D44A12 ;
        }
        .p-treetable .p-sortable-column:not(.p-highlight):hover .p-sortable-column-icon {
          color: #eca92a ;
        }
        .p-treetable .p-sortable-column:focus {
          box-shadow: inset 0 0 0 2px rgba(115, 115, 115, 0.25) !important;
        }
        .p-treetable .p-treetable-tbody > tr > td {
          border-bottom: 1px solid #FFF0E6;
          padding: 7px 12px;
        }
        .p-treetable .p-treetable-tbody > tr > td:first-child {
          text-align: left;
        }
        .p-treetable .p-column-resizer {
          border: 1px solid #F5C19A;
          width: 1px;
        }
        .p-treetable .p-treetable-tbody > tr:hover > td { background: #f5f5f5; }
        .p-treetable-toggler { color: #D44A12 !important; }

        /* Align wrapped category text with first line (not under the toggler icon) */
        /* Float toggler left so text block fills remaining width and wraps correctly */
        .p-treetable .p-treetable-tbody > tr > td:first-child > .p-treetable-toggler {
          float: left !important;
        }
        .p-treetable .p-treetable-tbody > tr > td:first-child > span:not(.p-treetable-toggler) {
          display: block !important;
          overflow: hidden !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }

        .p-treetable-wrapper::-webkit-scrollbar { height: 5px; width: 6px; }
        .p-treetable-wrapper::-webkit-scrollbar-track { background: #f5f5f5; border-radius: 4px; }
        .p-treetable-wrapper::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 4px; }
        .p-treetable-wrapper::-webkit-scrollbar-thumb:hover { background: #8c8c8c; }

        /* Sticky Category column — stays fixed during horizontal scroll */
        

        /* Visible resize handle on the first (Category) column header */
        .p-treetable .p-treetable-thead > tr > th:first-child .p-column-resizer {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 14px !important;
          right: -1px !important;
          background: transparent !important;
          border: none !important;
          cursor: col-resize !important;
          z-index: 4 !important;
        }
        .p-treetable .p-treetable-thead > tr > th:first-child .p-column-resizer::after {
          content: '' !important;
          display: block !important;
          width: 4px !important;
          height: 26px !important;
          background: #6d6d6d !important;
          border-radius: 3px !important;
          border: none !important;
          box-shadow: none !important;
          transition: background 0.15s !important;

        }
        .p-treetable .p-treetable-thead > tr > th:first-child .p-column-resizer:hover::after {
          background: #8c8c8c !important;
          width: 5px !important;
        }
        .p-treetable .p-treetable-tbody > tr > td:first-child {
          position: sticky !important;
          left: 0 !important;
          z-index: 1 !important;
          background: #ffffff !important;
          border-right: 2px solid #FDE8D0 !important;
        }
        .p-treetable .p-treetable-tbody > tr:hover > td:first-child {
          background: #f5f5f5 !important;
        }
        /* Responsive horizontal scroll wrapper for the tree table */
        .summary-table-scroll-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .summary-table-scroll-wrap::-webkit-scrollbar { height: 5px; }
        .summary-table-scroll-wrap::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 4px; }
        /* Responsive Category column width */
        @media (max-width: 900px) {
          .p-treetable .p-treetable-thead > tr > th:first-child,
          .p-treetable .p-treetable-tbody > tr > td:first-child { min-width: 140px !important; width: 140px !important; }
        }
        @media (max-width: 600px) {
          .p-treetable .p-treetable-thead > tr > th:first-child,
          .p-treetable .p-treetable-tbody > tr > td:first-child { min-width: 110px !important; width: 110px !important; }
        }
      `}</style>

        <div className="summary-table-scroll-wrap">
          <TreeTable
            value={nodes}
            loading={loading}
            // scrollable
            resizableColumns
            columnResizeMode="expand"
            expandedKeys={expandedKeys}
            onToggle={handleToggle}
            tableStyle={{ minWidth: `${240 + dates.length * 140}px` }}
            sortMode="single"
            sortField={sortField ?? undefined}
            sortOrder={sortOrder as any}
            onSort={(e: any) => { setSortField(e.sortField); setSortOrder(e.sortOrder); }}>
            <Column
              field="label"
              header="Category"
              expander
              style={{ width: '290px', minWidth: '290px' }}  // ✅ REQUIRED
              body={labelBody}
            />
            {dates.map((date) => (
              <Column key={date} field={date}
                header={formatDateHeader(date)}
                headerStyle={getHeaderStyle(date)}
                sortable body={(node: any) => cellTemplate(node, date)}
                style={{ width: '150px', minWidth: '150px', textAlign: 'center' }}
              />
            ))}
          </TreeTable>
        </div>
      </Card>
    </div>
  );
}