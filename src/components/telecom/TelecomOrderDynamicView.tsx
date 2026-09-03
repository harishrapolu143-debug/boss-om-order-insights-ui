'use client';

import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Typography, message, Button, Tooltip, Select } from 'antd';
import { UndoOutlined, FilterOutlined, CloseOutlined, DownOutlined } from '@ant-design/icons';
import {
  // Phase 1 thunks
  fetchSummary,
  fetchTeams,
  fetchReportingDates,
  fetchOrders,
  // DnD columns thunks
  dynamicDndColumns,
  applyDndColumns,
  displayColumns,
  fetchCustomReportOrders,
  // Saved reports thunks
  getSavedColumns,
  deleteSavedColumn,
  updateSavedColumn,
  // Relational data thunk
  getRelationalData,
  // Filter defaults thunk
  fetchFilterDefaults,
  // Phase 1 actions
  setDateRange,
  setDdClass,
  setOrderAction,
  setWatchtowerNetworkType,
  setSelctedSnapDate,
  openDrilldown,
  closeDrilldown,
  setDrilldownPage,
  setSelectedSavedReportId,
  // Phase 1 selectors
  selectDateRange,
  selectDdClass,
  selectOrderAction,
  selectWatchtowerNetworkType,
  selectSelectedTeams,
  selectSelectedSnapDate,
  selectSummaryData,
  selectTeamsData,
  selectDrilldown,
  selectLoadingStates,
  selectErrors,
  // DnD columns selectors
  selectDndColumnsData,
  selectApplyDndColumnsData,
  selectSelectedHierarchy,
  selectSelectedHierarchyConditions,
  // Saved reports selectors
  selectSavedColumnsData,
  selectSelectedSavedReportId,
  // Relational data selector
  selectRelationalData,
  // Filter defaults selector
  selectFilterDefaultsData,
} from '@/lib/redux/slices/telecomOrderSlice';
import { DateRangePicker } from '@/components/telecom/UIComponents/DateRangePicker';
import { ViewCreateSidebar } from '@/components/telecom/UIComponents/ViewCreateSidebar';
import SummaryTable from '@/components/telecom/SummaryTable';
import { KpiStrip } from '@/components/telecom/UIComponents/KpiStrip';
import { DrilldownOffCanvas } from '@/components/telecom/UIComponents/DrilldownOffCanvas';

const { Title } = Typography;

// ─── Topbar inline filter select (checkbox dropdown, label always visible) ───
function TopbarFilterSelect({ label, value, onChange, options }: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const hasValue = value.length > 0;
  const isAllSelected = options.length > 0 && options.every((o) => value.includes(o));

  const allOpts = [
    { label: 'Select All', value: '__select_all__' },
    ...options.map((o) => ({ label: o, value: o })),
  ];

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {!open && (
        <span style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          fontSize: 12, color: '#595959', pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      )}
      <Select
        mode="multiple"
        showSearch
        optionFilterProp="label"
        allowClear={false}
        listHeight={200}
        className="topbar-filter-select"
        classNames={{ popup: { root: 'topbar-filter-select-dropdown' } }}
        open={open}
        onOpenChange={(v) => { if (v) setOpen(true); else setOpen(false); }}
        onSelect={() => setOpen(true)}
        onDeselect={() => setOpen(true)}
        style={{ minWidth: 130, height: 30 }}
        value={value}
        onChange={(newVals) => {
          if (newVals.includes('__select_all__')) {
            onChange(isAllSelected ? [] : [...options]);
            return;
          }
          onChange(newVals);
        }}
        tagRender={() => <></>}
        placeholder={open ? 'Search...' : ' '}
        suffixIcon={
          hasValue ? (
            <CloseOutlined
              style={{ color: '#faad14', fontSize: 11, cursor: 'pointer' }}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onChange([]); setOpen(false); }}
            />
          ) : (
            <DownOutlined style={{ color: '#8c8c8c', fontSize: 11 }} />
          )
        }
        optionRender={(opt) => {
          const v = opt.value as string;
          const checked = v === '__select_all__' ? isAllSelected : value.includes(v);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
              <input type="checkbox" readOnly checked={checked}
                style={{ accentColor: '#faad14', width: 14, height: 14, cursor: 'pointer', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: v === '__select_all__' ? '#ad6800' : '#262626', fontWeight: v === '__select_all__' ? 600 : 400 }}>
                {opt.label as string}
              </span>
            </div>
          );
        }}
        options={allOpts}
        notFoundContent={<span style={{ fontSize: 12, color: '#8c8c8c' }}>No options</span>}
      />
    </div>
  );
}

export default function TelecomOrderDynamicView() {
  const dispatch = useDispatch<any>();

  // ── Phase 1 state ──────────────────────────────────────────
  const dateRange = useSelector(selectDateRange);
  const ddClass = useSelector(selectDdClass);
  const orderAction = useSelector(selectOrderAction);
  const watchtowerNetworkType = useSelector(selectWatchtowerNetworkType);
  const selectedTeams = useSelector(selectSelectedTeams);
  const selectedSnapDate = useSelector(selectSelectedSnapDate);
  const summaryData = useSelector(selectSummaryData);
  const snapDateArr = useSelector(selectTeamsData);
  const drilldown = useSelector(selectDrilldown);
  const loading = useSelector(selectLoadingStates);
  const errors = useSelector(selectErrors);
  const [snapDate, setSnapDate] = useState<{ label: string; value: string }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountType, setAccountType] = useState('Consumer');
  const [moreFilters, setMoreFilters] = useState<Record<string, string>>({});
  const activeCustomFilterRef = useRef<any[]>([]);

  // ── DnD columns state ──────────────────────────────────────
  const dndColumnsData = useSelector(selectDndColumnsData);
  const applyDndColumnsData = useSelector(selectApplyDndColumnsData);
  const selectedHierarchy = useSelector(selectSelectedHierarchy);
  const selectedHierarchyConditions = useSelector(selectSelectedHierarchyConditions);

  // ── Saved reports state ────────────────────────────────────
  const savedColumnsData = useSelector(selectSavedColumnsData);
  const selectedSavedReportId = useSelector(selectSelectedSavedReportId);

  // ── Relational data ────────────────────────────────────────────────
  const relationalData = useSelector(selectRelationalData);

  // ── Filter defaults ────────────────────────────────────────────────
  const filterDefaults = useSelector(selectFilterDefaultsData);
  const accountTypeOptions = useMemo(() => filterDefaults?.account_type?.split(',').map((s: string) => s.trim()).filter(Boolean), [filterDefaults]);
  const networkTypeOptions = useMemo(() => filterDefaults?.network_type?.split(',').map((s: string) => s.trim()).filter(Boolean), [filterDefaults]);
  const orderActionOptions = useMemo(() => filterDefaults?.order_action?.split(',').map((s: string) => s.trim()).filter(Boolean), [filterDefaults]);
  const ddClassOptions = useMemo(() => filterDefaults?.dd_class?.split(',').map((s: string) => s.trim()).filter(Boolean), [filterDefaults]);

  // ── Initial load ───────────────────────────────────────────
  // useEffect(() => {
  //   dispatch(fetchTeams());
  //   dispatch(fetchReportingDates());
  //   dispatch(getSavedColumns());
  //   dispatch(getRelationalData());
  // }, [dispatch]);

   useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchFilterDefaults());
    // dispatch(fetchReportingDates());
    // dispatch(getSavedColumns());
    // dispatch(getRelationalData());
  }, [dispatch]);

  // ── Refresh all data when filters change ───────────────────
  const params = useMemo(() => ({
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    ddClass,
    snapDate: selectedSnapDate || '',
    accountType,
    orderAction,
    watchtowerNetworkType,
    team: selectedTeams.length === 1 ? selectedTeams[0] : undefined,
  }), [dateRange, ddClass, selectedSnapDate, selectedTeams, accountType, orderAction, watchtowerNetworkType]);
  useEffect(() => {
    if (
      !dateRange.fromDate ||
      !dateRange.toDate ||
      selectedHierarchy.length > 0 ||
      loading.getSavedColumns === 'loading' ||
      (loading.getSavedColumns === 'succeeded' && savedColumnsData.length > 0)
    ) return;

    console.log(params, 'accountType');
    dispatch(fetchSummary({ ...params, ...moreFilters }));
  }, [dispatch, params, moreFilters, selectedHierarchy, loading.getSavedColumns]);
  // }, [dispatch, params, selectedHierarchy, loading.getSavedColumns, savedColumnsData]);

  // ── Fetch dnd columns once after summary data is available ─
  useEffect(() => {
    dispatch(dynamicDndColumns());
  }, [summaryData, applyDndColumnsData]);

  // ── Refresh drilldown on page change ──────────────────────
  useEffect(() => {
    if (!drilldown.open) return;
    const baseParams = {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      ddClass: drilldown.ddClass || ddClass,
      status: drilldown.statusFilter,
      category: drilldown.category,
      date: drilldown.day,
      snapDate: selectedSnapDate,
      accountType,
      orderAction,
      watchtowerNetworkType,
      page: drilldown.page,
      ...drilldown.filters,
      ...moreFilters,
      team: selectedTeams.length === 1 ? selectedTeams[0] : undefined,
    };
    if (selectedHierarchy.length > 0) {
      const labelValues = (drilldown.category || '').split('|').slice(1);

      const nodeFilters: Record<string, string> = {};
      const collected: Record<string, string> = {};
      let hierIdx = 0;

      for (let i = 0; i < labelValues.length; i++) {
        const label = labelValues[i];

        if (label === 'Total orders due') {
          nodeFilters['all_orders'] = label;
          continue;
        }

        while (hierIdx < selectedHierarchy.length) {
          const key = selectedHierarchy[hierIdx];
          const cond = selectedHierarchyConditions?.[key];
          hierIdx++;

          if (!cond) {
            nodeFilters[key] = label;
            collected[key] = label;
            break;
          }

          const parentVal = collected[cond.parent_field];
          const condValue = cond.parent_value;
          const condMet = Array.isArray(condValue)
            ? condValue.includes(parentVal)
            : parentVal === condValue;

          if (condMet) {
            nodeFilters[key] = label;
            collected[key] = label;
            break;
          }
        }
      }

      dispatch(
        fetchCustomReportOrders({
          ...baseParams,
          hierarchy: selectedHierarchy,
          hierarchy_conditions: selectedHierarchyConditions,
          nodeFilters,
          custom_filter: activeCustomFilterRef.current,
        })
      );
    } else {
      dispatch(fetchOrders(baseParams));
    }
  }, [
    dispatch,
    drilldown.open,
    drilldown.page,
    drilldown.filters,
    drilldown.category,
    drilldown.day,
    drilldown.ddClass,
    drilldown.statusFilter,
    dateRange.fromDate,
    dateRange.toDate,
    ddClass,
    selectedSnapDate,
    accountType,
    orderAction,
    watchtowerNetworkType,
    selectedTeams,
    selectedHierarchy,
    selectedHierarchyConditions,
  ]);

  const handleFormat = (arr: any) => {
    const snapDates = arr?.snapshot_dates.map((item: string) => ({
      label: item,
      value: item,
    }));
    setSnapDate(snapDates);
  };

  const handleDeleteSavedReport = async (id: any) => {
    if (id) {
      try {
        const result = await dispatch(deleteSavedColumn(id)).unwrap();
        message.success(result.message || 'Custom report deleted successfully.');
        setSidebarOpen(false);
      } catch (err: any) {
        message.error(err || 'Failed to delete report.');
      }
    }
  };

  useEffect(() => {
    if (snapDateArr && snapDateArr?.snapshot_dates?.length > 0) {
      handleFormat(snapDateArr);
      if (!selectedSnapDate) {
        dispatch(setSelctedSnapDate(snapDateArr.snapshot_dates[0]));
      }
    }
  }, [snapDateArr]);

  // ── Cell click handler ─────────────────────────────────────
  const handleCellClick = useCallback(
    (day: string, category: string, extraFilters: Record<string, any> = {}, _data?: any) => {
      dispatch(openDrilldown({ day, category, filters: extraFilters, snapDate }));
    },
    [dispatch, snapDate]
  );

  const handleReset = () => {
    const toDate = new Date();
    const fromDate = new Date();
    toDate.setDate(toDate.getDate() + 5);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const newFromDate = fmt(fromDate);
    const newToDate = fmt(toDate);
    const newAccountType = 'Consumer';
    const newOrderAction = 'Add,Change';
    const newNetworkType = 'XGSPON,GPON,4G LTE';

    dispatch(setDateRange({ fromDate: newFromDate, toDate: newToDate }));

    const watchtower = savedColumnsData.find(
      (r: any) => r.name?.toLowerCase() === 'watchtower report'
    );
    if (watchtower) {
      dispatch(setSelectedSavedReportId(watchtower.id));
    }
    dispatch(fetchTeams());
    setAccountType(newAccountType);
    dispatch(setDdClass(''));
    dispatch(setOrderAction(newOrderAction));
    dispatch(setWatchtowerNetworkType(newNetworkType));

    setMoreFilters({});
    dispatch(fetchSummary({
      fromDate: newFromDate,
      toDate: newToDate,
      ddClass: '',
      snapDate: selectedSnapDate || '',
      accountType: newAccountType,
      orderAction: newOrderAction,
      watchtowerNetworkType: newNetworkType,
      team: selectedTeams.length === 1 ? selectedTeams[0] : undefined,
    }));

    message.success('Reset successfully.');
  };

  // ── Re-fetch display when date/snapDate/ddClass changes (if hierarchy active) ──
  useEffect(() => {
    if (!dateRange.fromDate || !dateRange.toDate || selectedHierarchy.length === 0) return;
    const activeReport = savedColumnsData.find((r: any) => r.id === selectedSavedReportId);
    dispatch(
      displayColumns({
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        ddClass,
        snapDate: selectedSnapDate,
        accountType,
        orderAction,
        watchtowerNetworkType,
        hierarchy: selectedHierarchy,
        hierarchy_conditions: selectedHierarchyConditions,
        custom_filter: activeCustomFilterRef.current,
        report_name: activeReport?.name || '',
      })
    );
  }, [dateRange, selectedSnapDate, ddClass, accountType, orderAction, watchtowerNetworkType, dispatch]);

  const isSummaryLoading = loading.summary === 'loading';
  const isapplyDndColumnLoading = loading?.applyDndColumns === 'loading';
  const isSnapshotLoading = loading?.teams === 'loading';
  const isGetSavedColumnsLoading = loading?.getSavedColumns === 'loading';
  const isDisplayColumnsLoading = loading?.displayColumns === 'loading';

  return (
    <div style={{ width: '100%', background: '#f5f7fa', minHeight: '100vh', padding: '0 0 32px 0' }}>

      {/* ── Watchtower responsive styles ─────────────────────── */}
      <style>{`
        .wt-topbar {
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          row-gap: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .wt-controls-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          row-gap: 8px;
        }
        .wt-date-reset {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .wt-filters-section {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          row-gap: 8px;
        }
        .wt-filter-toggles {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .wt-toggle-item { flex-shrink: 0; }
        .wt-divider-v { margin: 0 !important; height: 24px; align-self: center; }

        /* ── Phone < 640px ── */
        @media (max-width: 639px) {
          .wt-topbar { padding: 8px 12px; flex-direction: column; align-items: stretch; gap: 8px; }
          .wt-controls-row { flex-direction: column; align-items: stretch; gap: 8px; width: 100%; }
          .wt-date-reset { width: 100%; justify-content: space-between; }
          .wt-date-reset .finops-range-picker { flex: 1 !important; }
          .wt-divider-v { display: none !important; }
          .wt-filters-section { flex-direction: column; align-items: stretch; gap: 6px; }
          .wt-filter-toggles { display: grid !important; grid-template-columns: 1fr 1fr; gap: 6px; align-items: unset; }
          .wt-toggle-item { width: 100%; flex-shrink: unset; }
          .wt-toggle-item > div { width: 100% !important; display: block !important; }
          .wt-toggle-item > div > div:first-child { width: 100% !important; min-width: unset !important; }
          .wt-body-pad { padding: 8px 10px 0 !important; }
        }

        /* ── Filters group in topbar ── */
        .wt-filters-group {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex-shrink: 0;
        }
        .wt-filters-label {
          font-size: 12px; font-weight: 600; color: #595959; white-space: nowrap; flex-shrink: 0;
        }
        .wt-more-filters-btn {
          display: inline-flex; align-items: center; gap: 4px;
          height: 30px; padding: 0 12px; border: 1px dashed #faad14; border-radius: 6px;
          background: transparent; color: #d4a017; font-size: 12px; font-weight: 600;
          cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 0.15s;
        }
        .wt-more-filters-btn:hover { background: #fffbe6; border-style: solid; }

        /* Topbar filter select trigger */
        .topbar-filter-select .ant-select-selector {
          height: 30px !important; border-color: #faad14 !important; border-radius: 6px !important;
          display: flex !important; align-items: center !important;
        }
        .topbar-filter-select:hover .ant-select-selector { border-color: #d4a017 !important; }
        .topbar-filter-select.ant-select-focused .ant-select-selector {
          border-color: #d4a017 !important; box-shadow: 0 0 0 2px rgba(212,160,23,0.2) !important;
        }
        /* Hide tag chips, keep search input suffix */
        .topbar-filter-select .ant-select-selection-overflow-item:not(.ant-select-selection-overflow-item-suffix) {
          display: none !important;
        }
        /* Topbar filter dropdown panel */
        .topbar-filter-select-dropdown { background: #fffef7 !important; border-radius: 8px !important; }
        .topbar-filter-select-dropdown .ant-select-item-option { padding: 6px 10px !important; }
        .topbar-filter-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) { background: #fff1b8 !important; }
        .topbar-filter-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) { background: #fffbe6 !important; }
        .topbar-filter-select-dropdown .ant-select-item-option-state { display: none !important; }
        .topbar-filter-select-dropdown .rc-virtual-list-holder { scrollbar-width: thin; scrollbar-color: #ffd666 transparent; }
        .topbar-filter-select-dropdown .rc-virtual-list-holder::-webkit-scrollbar { width: 3px; }
        .topbar-filter-select-dropdown .rc-virtual-list-holder::-webkit-scrollbar-thumb { background: #ffd666; border-radius: 3px; }

        /* ── Tablet 640px – 1023px ── */
        @media (min-width: 640px) and (max-width: 1023px) {
          .wt-topbar { padding: 10px 16px; }
          .wt-controls-row { width: 100%; }
          .wt-filter-toggles { flex-wrap: wrap; }
          .wt-body-pad { padding: 12px 14px 0 !important; }
        }
      `}</style>

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="wt-topbar">
        <div style={{ marginRight: 'auto', minWidth: 0 }}>
          <Title level={5} style={{ margin: 0, color: '#000000', whiteSpace: 'nowrap' }}>
            DD Order Tracker
          </Title>
        </div>

        <div className="wt-controls-row">
          {/* Date range + Reset grouped */}
          <div className="wt-date-reset">
            <DateRangePicker
              fromDate={dateRange.fromDate}
              toDate={dateRange.toDate}
              onChange={(range: any) => dispatch(setDateRange(range))}
            />
            <Tooltip title="Reset to default date & Watchtower Report">
              <Button
                icon={<UndoOutlined />}
                onClick={handleReset}
                size="small"
                style={{
                  borderColor: '#faad14', color: '#faad14',
                  display: 'flex', alignItems: 'center',
                  gap: 4, fontSize: 12, height: 30, padding: '0 10px', flexShrink: 0,
                }}>
                Reset
              </Button>
            </Tooltip>
          </div>

          {/* ── Filters: Account Type | Order Action | Network Type | More Filters ── */}
          <div className="wt-filters-group">
            <span className="wt-filters-label"></span>

            <TopbarFilterSelect
              label="Account Type"
              value={accountType ? accountType.split(',').filter(Boolean) : []}
              options={accountTypeOptions ?? []}
              onChange={(vals) => {
                const v = vals.join(',');
                setAccountType(v);
                dispatch(fetchSummary({ fromDate: dateRange.fromDate, toDate: dateRange.toDate, ddClass, snapDate: selectedSnapDate || '', accountType: v, orderAction, watchtowerNetworkType, team: selectedTeams.length === 1 ? selectedTeams[0] : undefined }));
              }}
            />

            <TopbarFilterSelect
              label="Order Action"
              value={orderAction ? orderAction.split(',').filter(Boolean) : []}
              options={orderActionOptions ?? []}
              onChange={(vals) => {
                const v = vals.join(',');
                dispatch(setOrderAction(v));
                dispatch(fetchSummary({ fromDate: dateRange.fromDate, toDate: dateRange.toDate, ddClass, snapDate: selectedSnapDate || '', accountType, orderAction: v, watchtowerNetworkType, team: selectedTeams.length === 1 ? selectedTeams[0] : undefined }));
              }}
            />

            <TopbarFilterSelect
              label="Network Type"
              value={watchtowerNetworkType ? watchtowerNetworkType.split(',').filter(Boolean) : []}
              options={networkTypeOptions ?? []}
              onChange={(vals) => {
                const v = vals.join(',');
                dispatch(setWatchtowerNetworkType(v));
                dispatch(fetchSummary({ fromDate: dateRange.fromDate, toDate: dateRange.toDate, ddClass, snapDate: selectedSnapDate || '', accountType, orderAction, watchtowerNetworkType: v, team: selectedTeams.length === 1 ? selectedTeams[0] : undefined }));
              }}
            />

            <button
              className="wt-more-filters-btn"
              onClick={() => window.dispatchEvent(new CustomEvent('wt-filter-open'))}
            >
              <FilterOutlined style={{ fontSize: 11 }} /> More Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Page Body ─────────────────────────────────────────── */}
      <div className="wt-body-pad" style={{ padding: 'clamp(12px, 2vw, 20px) clamp(12px, 2vw, 24px) 0' }}>
        {errors.summary && (
          <Alert
            type="error"
            showIcon
            closable
            message="Failed to load summary data"
            description={errors.summary}
            style={{ marginBottom: 16 }}
          />
        )}
        {errors.fallout && (
          <Alert
            type="warning"
            showIcon
            closable
            message="Failed to load fallout breakdown"
            description={errors.fallout}
            style={{ marginBottom: 16 }}
          />
        )}
        {errors.jeopardy && (
          <Alert
            type="warning"
            showIcon
            closable
            message="Failed to load jeopardy detail"
            description={errors.jeopardy}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* ── KPI Strip ─────────────────────────────────────── */}
        <KpiStrip
          summaryData={applyDndColumnsData || summaryData || [{ 'completed': 120 }]}
          loading={
            isSummaryLoading ||
            isapplyDndColumnLoading ||
            isSnapshotLoading ||
            isGetSavedColumnsLoading ||
            isDisplayColumnsLoading
          }
        />

        {/* ── Summary Table ─────────────────────────────────── */}
        <SummaryTable
          summaryData={applyDndColumnsData || summaryData || []}
          ddClass={ddClass}
          accountType={accountType}
          orderAction={orderAction}
          watchtowerNetworkType={watchtowerNetworkType}
          watchtowerAppliedFilters={moreFilters}
          watchtowerFilterOptions={{
            ddClass: ddClassOptions ?? [],
            accountType: accountTypeOptions ?? [],
            orderAction: orderActionOptions ?? [],
            networkType: networkTypeOptions ?? [],
          }}
          onWatchtowerFiltersApply={(payload) => {
            const newDdClass = payload.ddClass;
            dispatch(setDdClass(newDdClass));
            const extraFilters: Record<string, string> = {
              serviceType: payload.serviceType ?? '',
              salesChannel: payload.salesChannel ?? '',
              state: payload.state ?? '',
              orderStatus: payload.orderStatus ?? '',
              orderStatusRaw: payload.orderStatusRaw ?? '',
              revisionOperation: payload.revisionOperation ?? '',
              copperMigrator: payload.copperMigrator ?? '',
              dispatchStatus: payload.dispatchStatus ?? '',
              milestone: payload.milestone ?? '',
              migratorType: payload.migratorType ?? '',
            };
            setMoreFilters(extraFilters);
            dispatch(fetchSummary({
              fromDate: dateRange.fromDate,
              toDate: dateRange.toDate,
              ddClass: newDdClass,
              snapDate: selectedSnapDate || '',
              accountType,
              orderAction,
              watchtowerNetworkType,
              team: selectedTeams.length === 1 ? selectedTeams[0] : undefined,
              ...extraFilters,
            }));
          }}
          onRemoveWatchtowerFilter={(key, value) => {
            const removeVal = (current: string) =>
              current.split(',').filter((v) => v !== value).join(',');
            if (key === 'ddClass') dispatch(setDdClass(removeVal(ddClass)));
            else if (key === 'accountType') setAccountType(removeVal(accountType));
            else if (key === 'orderAction') dispatch(setOrderAction(removeVal(orderAction)));
            else if (key === 'networkType') dispatch(setWatchtowerNetworkType(removeVal(watchtowerNetworkType)));
          }}
          loading={
            isSummaryLoading ||
            isapplyDndColumnLoading ||
            isSnapshotLoading ||
            isGetSavedColumnsLoading ||
            isDisplayColumnsLoading
          }
          onCellClick={handleCellClick}
          onCreateClick={() => setSidebarOpen(true)}
          resetKey={selectedSnapDate}
          dndColumns={dndColumnsData}
          savedReports={savedColumnsData}
          selectedReportId={selectedSavedReportId}
          onReportSelect={(id: any) => dispatch(setSelectedSavedReportId(id))}
          onFilterApply={(custom_filter: any[]) => {
            activeCustomFilterRef.current = custom_filter;
            const activeReport = savedColumnsData.find((r: any) => r.id === selectedSavedReportId);
            dispatch(
              displayColumns({
                fromDate: dateRange.fromDate,
                toDate: dateRange.toDate,
                ddClass,
                snapDate: selectedSnapDate,
                accountType,
                orderAction,
                watchtowerNetworkType,
                hierarchy: activeReport?.hierarchy || selectedHierarchy,
                hierarchy_conditions:
                  activeReport?.hierarchy_conditions || selectedHierarchyConditions,
                custom_filter,
                report_name: activeReport?.name || '',
              })
            );
          }}
        />
      </div>

      {/* ── Off-Canvas Drilldown ──────────────────────────────── */}
      <DrilldownOffCanvas
        open={drilldown.open}
        day={drilldown.day}
        category={drilldown.category}
        data={drilldown.data}
        meta={drilldown.meta}
        page={drilldown.page}
        loading={loading.orders === 'loading' || loading.customReportOrders === 'loading'}
        error={errors.orders || errors.customReportOrders}
        onClose={() => dispatch(closeDrilldown())}
        onPageChange={(p: number) => dispatch(setDrilldownPage(p))}
        exportParams={(() => {
          const labelValues = (drilldown.category || '').split('|');
          const selectedNodeFilters: Record<string, string> = {};
          labelValues.forEach((label: string, i: number) => {
            if (selectedHierarchy[i]) selectedNodeFilters[selectedHierarchy[i]] = label;
          });
          const isSummaryMode = selectedHierarchy.length === 0;
          return {
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
            ddClass,
            snapDate: selectedSnapDate,
            teams: selectedTeams,
            hierarchy: selectedHierarchy,
            nodeFilters: selectedNodeFilters,
            clickedDay: drilldown.day,
            isSummaryMode,
            category: drilldown.category,
            accountType,
            orderAction,
            watchtowerNetworkType,
            date: drilldown.day,
            ...moreFilters,
          };
        })()}
      />

      <ViewCreateSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        allFields={dndColumnsData?.all_fields || []}
        relationalData={relationalData}
        savedReports={savedColumnsData}
        applyLoading={loading?.applyDndColumns === 'loading'}
        updateLoading={loading?.updateSavedColumn === 'loading'}
        onDeleteReport={(id: any) => handleDeleteSavedReport(id)}
        onApply={(selectedCols: any[], configName: string, filters: any[], hierarchyConditions: Record<string, any>) => {
          dispatch(
            applyDndColumns({
              configName,
              fromDate: dateRange.fromDate,
              toDate: dateRange.toDate,
              ddClass,
              snapDate: selectedSnapDate,
              orderAction,
              watchtowerNetworkType,
              hierarchy: selectedCols.map((col) => col.key),
              filters: filters || [],
              hierarchy_conditions: hierarchyConditions || {},
            })
          ).then(() => {
            dispatch(getSavedColumns());
            message.success('Custom report created successfully.');
          });
        }}
        onUpdateReport={(id: any, selectedCols: any[], filters: any[], hierarchyConditions: Record<string, any>) => {
          const hierarchy = selectedCols.map((col) => col.key);
          dispatch(
            updateSavedColumn({ id, hierarchy, filters: filters || [], hierarchy_conditions: hierarchyConditions || {} })
          ).then(() => {
            dispatch(getSavedColumns());
            message.success('Custom report updated successfully.');
            if (id === selectedSavedReportId) {
              const report = savedColumnsData.find((r: any) => r.id === id);
              if (report) {
                dispatch(
                  displayColumns({
                    fromDate: report.from_date,
                    toDate: report.to_date,
                    ddClass: report.dd_class,
                    snapDate: report.snapshot_at,
                    accountType,
                    orderAction,
                    watchtowerNetworkType,
                    hierarchy,
                    hierarchy_conditions: hierarchyConditions,
                    filters: filters || [],
                    report_name: report.name || '',
                  })
                );
              }
            }
          });
        }}
      />
    </div>
  );
}