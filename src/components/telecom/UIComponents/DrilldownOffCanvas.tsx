'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Drawer, Table, Tag, Pagination, Alert, Spin, Space, Typography, Tooltip, message
} from 'antd';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { exportOrders, fetchOrders, fetchOrders1, ordersExport } from '@/lib/redux/slices/telecomOrderSlice';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const { Text, Title } = Typography;

const STATUS_COLOR: Record<string, string> = {
  Completed: 'success',
  Canceled: 'error',
  'Order in jeopardy': 'warning',
  'No action needed': 'default',
};
const alignCOls: any = {
  'orderId': 'Order ID', 'account': 'Account', 'contact': 'Contact', 'billingAccountNumber': 'BAN', 'amsLocationId': 'AMS Location ID', 'serviceInstanceId': 'Service Instance ID', 'accountType': 'Account Type', 'state': 'State', 'accountStatus': 'Account Status', 'salesChannel': 'Sales Channel', 'networkType': 'Network Type', 'serviceType': 'Service Type', 'fiberVoice': 'Fiber Voice', 'orderStatus': 'Order Status', 'orderStatusClean': 'Order Status Clean', 'category': 'Category', 'orderAction': 'Order Action', 'ddClass': 'DD Class', 'originalDd': 'Original DD', 'dueDate': 'Due Date', 'unifiedDueDate': 'Unified Due Date', 'orderDate': 'Order Date', 'actualEndDate': 'Actual End Date', 'tarn': 'TARN', 'revisionOperation': 'Revision Operation', 'milestone': 'Milestone', 'dispatchStatus': 'Dispatch Status', 'migratorType': 'Migrator Type', 'migrateFrom': 'Migrate From', 'migrateTo': 'Migrate To', 'copperMigrator': 'Copper Migrator', 'speed': 'Speed', 'externalSystem': 'External System', 'ponr': 'PONR', 'pon': 'PON', 'bswDelayed': 'BSW Delayed', 'owsHold': 'OWS Hold', 'lnpPortingFailure': 'LNP Porting Failure', 'vmduFlag': 'VMDU Flag', 'preProvisioningFallout': 'Pre Provisioning Fallout', 'falloutReason': 'Fallout Reason', 'reasonCode': 'Reason Code', 'subreasonCode': 'Subreason Code', 'falloutAssignmentClean': 'Fallout Assignment Group', 'falloutGroup': 'Fallout Group', 'oldestActiveFallout': 'Oldest Active Fallout', 'jeopardyCase': 'Jeopardy Case', 'jeopCaseCount': 'Jeopardy Case Count', 'dispositionComments': 'Disposition Comments', 'created': 'Created', 'createdBy': 'Created By', 'updatedAt': 'Updated', 'updatedBy': 'Updated By', 'snapshotAt': 'Snapshot At', 'sysId': 'SYS ID'
}
const strSort = (field: string) => (a: any, b: any) => (a[field] || '').localeCompare(b[field] || '');
const dateSort = (field: string) => (a: any, b: any) =>
  (a[field] || '') < (b[field] || '') ? -1 : (a[field] || '') > (b[field] || '') ? 1 : 0;

// Special renderers — keys are the backend display names
const SPECIAL_RENDERERS: Record<string, any> = {
  orderId: (v: string) => (
    <a href={`${process.env.NEXT_PUBLIC_ALLOWED_ORIGIN}/boss_om?order_id=${v}`}
      target="_blank" rel="noopener noreferrer"
      style={{ fontSize: 14, fontFamily: 'monospace', color: '#d4b106', textDecoration: 'underline', wordBreak: 'break-word' }}>
      {v}
    </a>
  ),
  jeopardyCase: (v: string) => {
    if (!v) return null;
    if(v=="NA") return <span>{v}</span>
    return v.split(',').map((item, index) => {
      const value = item.trim();

      return (
        <div key={index}>
          {/* <a
            href={`${process.env.NEXT_PUBLIC_ALLOWED_ORIGIN}/boss_om?order_id=${value}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 14,
              fontFamily: 'monospace',
              color: '#d4b106',
              textDecoration: 'underline',
              wordBreak: 'break-word',
            }}
          >
            {value}
          </a> */}
          <span
            rel="noopener noreferrer"
            style={{
              fontSize: 14,
              fontFamily: 'monospace',
              // color: '#d4b106',
              // textDecoration: 'underline',
              wordBreak: 'break-word',
            }}
          >
            {value}
          </span>
        </div>
      );
    });
  },
  'Order Status': (v: string) => (
    <Tag color={STATUS_COLOR[v] || 'default'} style={{ fontWeight: 500 }}>{v}</Tag>
  ),
  'Order Action': (v: string) => (
    <span>{v !== '' && `${v?.charAt(0)?.toUpperCase()}${v?.slice(1)}`}</span>
  ),
};

// Backend sends display-name keys — match accordingly
const DATE_KEYS = new Set([
  'Due Date', 'Unified Due Date', 'Order Date', 'Actual End Date',
  'Created', 'Updated At', 'Service Activation Date', 'Snapshot At',
]);

// Columns pinned to the left — use backend display names
const FIXED_LEFT_KEYS = new Set(['orderId', 'jeopardyCase', "jeopCaseCount", "billingAccountNumber"]);

// Width map for fixed columns — keyed by display name
const FIXED_WIDTHS: Record<string, number> = {
  'orderId': 120,
  'jeopardyCase': 150,
  "jeopCaseCount": 180
};

const excluedKeys = [
  'agentId',
  'rangeForToday',
  'serviceActivationDate',
  'orderActionReason',
  'inJeopardy',
  'jeopardyLevel',
  'bswHold',
  'ows',
  'ddChangedAfterOriginalDd',
  'falloutCaseNumber',
  'assignmentGroup',
  'jeopCaseCount',
  'unifiedDueDate',
  'externalSystem',
  'createdBy',
  'updatedBy',
]

function buildDynamicColumns(data: any[]): any[] {
  if (!data || data.length === 0) return [];

  const keySet = new Set<string>();
  data.forEach((row) => Object.keys(row).forEach((k) => keySet.add(k)));

  const rawKeys = Array.from(keySet);

  // Separate fixed-left keys, Sys ID, and the rest
  const fixedKeys = ['orderId', 'jeopardyCase', 'jeopCaseCount', 'billingAccountNumber', 'amsLocationId', 'accountType', 'account', 'contact', 'orderAction', 'orderStatus', 'state', 'tarn', 'originalDd', 'dueDate', 'unifiedDueDate', 'orderDate', 'actualEndDate', 'serviceInstanceId', 'accountStatus', 'salesChannel', 'networkType', 'serviceType', 'fiberVoice', 'orderStatusClean', 'category', 'ddClass', 'revisionOperation', 'milestone', 'dispatchStatus', 'migratorType', 'migrateFrom', 'migrateTo', 'copperMigrator', 'speed', 'externalSystem', 'ponr', 'pon', 'bswDelayed', 'owsHold', 'lnpPortingFailure', 'vmduFlag', 'preProvisioningFallout', 'falloutReason', 'reasonCode', 'subreasonCode', 'falloutAssignmentClean', 'falloutGroup', 'oldestActiveFallout', 'dispositionComments', 'sysId', 'created', 'createdBy', 'updatedAt', 'updatedBy', 'snapshotAt'].filter((k) => rawKeys.includes(k));
  const otherKeys = rawKeys.filter((k) => !FIXED_LEFT_KEYS.has(k) && k !== 'sysId');
  const midIndex = Math.floor(otherKeys.length / 2);
  const keys = [
    ...new Set([
      ...fixedKeys,
      ...otherKeys.slice(0, midIndex),
      ...(rawKeys.includes('sysId') ? ['sysId'] : []),
      ...otherKeys.slice(midIndex),
    ])
  ];

  return keys?.filter((key: any) => !excluedKeys.includes(key))?.map((key) => {
    // Keys are already display names from the backend — use as-is
    const isDate = DATE_KEYS.has(key);
    const isFixed = FIXED_LEFT_KEYS.has(key);
    const col: any = {
      title: alignCOls[key],
      dataIndex: key,
      key,
      width: key === 'orderId' ? 120 : isDate ? 130 : 180,
      ellipsis: true,
      sorter: isDate ? dateSort(key) : strSort(key),
    };
    if (key === 'orderId') col.fixed = 'left';
    if (SPECIAL_RENDERERS[key]) {
      col.render = SPECIAL_RENDERERS[key];
    } else if (isDate) {
      col.render = (v: string) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}><Text code style={{ fontSize: 12 }}>{v}</Text></div>;
    }
    return col;
  });
}

interface DrilldownOffCanvasProps {
  open: boolean;
  day: string | null;
  category: string | null;
  data: any[];
  meta: { total: number; last_page: number; per_page: number };
  page: number;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onPageChange: (p: number) => void;
  exportParams: any;
}

export function DrilldownOffCanvas({
  open, day, category, data, meta, page, loading, error, onClose, onPageChange, exportParams
}: DrilldownOffCanvasProps) {
  const dispatch = useDispatch<any>();
  const [exporting, setExporting] = useState(false);

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });
  };


  const formatHeader = (key: string) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const downloadExcel = async (data: any, fileName = "orders.xlsx") => {
    if (!data || !data.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");
    const fixedKeys = ['orderId', 'jeopardyCase', 'jeopCaseCount', 'billingAccountNumber', 'amsLocationId', 'accountType', 'account', 'contact', 'orderAction', 'orderStatus', 'state', 'tarn', 'originalDd', 'dueDate', 'unifiedDueDate', 'orderDate', 'actualEndDate', 'serviceInstanceId', 'accountStatus', 'salesChannel', 'networkType', 'serviceType', 'fiberVoice', 'orderStatusClean', 'category', 'ddClass', 'revisionOperation', 'milestone', 'dispatchStatus', 'migratorType', 'migrateFrom', 'migrateTo', 'copperMigrator', 'speed', 'externalSystem', 'ponr', 'pon', 'bswDelayed', 'owsHold', 'lnpPortingFailure', 'vmduFlag', 'preProvisioningFallout', 'falloutReason', 'reasonCode', 'subreasonCode', 'falloutAssignmentClean', 'falloutGroup', 'oldestActiveFallout', 'dispositionComments', 'sysId', 'created', 'createdBy', 'updatedAt', 'updatedBy', 'snapshotAt']
      .filter((k) => Object.keys(data[0]).includes(k));

    const keys: any = [
      ...new Set([
        ...fixedKeys,
        ...Object.keys(data[0])
      ])
    ];
    // ✅ Format headers
    const columns = keys?.filter((key: any) => !excluedKeys.includes(key))?.map((key: any) => ({
      header: alignCOls[key] ?? key, // 👈 formatted header
      key: key,
    }));

    worksheet.columns = columns;

    // ✅ Add rows
    data.forEach((item: any) => {
      worksheet.addRow(item);
    });

    // ✅ Style Header Row (YELLOW BG + BLACK TEXT + CENTER)
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "FF000000" }, // 👈 black text
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFC000" }, // 👈 yellow background
      };

      cell.alignment = {
        horizontal: "center", // 👈 header center
        vertical: "middle",
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ✅ Align all data cells LEFT
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      row.eachCell((cell) => {
        cell.alignment = {
          horizontal: "left", // 👈 data left aligned
          vertical: "middle",
        };
      });
    });

    // ✅ Auto column width
    worksheet.columns.forEach((column: any) => {
      let maxLength = 10;

      column?.eachCell({ includeEmpty: true }, (cell: any) => {
        const value = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, value.length);
      });

      column.width = maxLength + 2;
    });

    // ✅ Freeze header row
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    // ✅ Auto column width
    worksheet.columns.forEach((column: any) => {
      let maxLength = 10;

      if (column) {
        column?.eachCell({ includeEmpty: true }, (cell: any) => {
          const value = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, value.length);
        });

        column.width = maxLength + 2;
      }
    });

    // ✅ Freeze header row
    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    // ✅ Add filter dropdowns
    worksheet.autoFilter = {
      from: "A1",
      to: `${String.fromCharCode(65 + columns.length - 1)}1`,
    };

    // ✅ Generate file
    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, fileName);
  };
  const handleExport = async () => {
    if (!exportParams?.fromDate || !exportParams?.toDate) {
      message.warning('Please select a date range before exporting.');
      return;
    }

    setExporting(true);

    try {

      let getOrders = await dispatch(fetchOrders1({ ...exportParams, size: meta?.total ?? 50 }));
      if (getOrders?.payload?.data?.length > 0) {
        downloadExcel(getOrders?.payload?.data ?? [], 'Orders.xlsx');
        message.success('Export downloaded successfully.');
      } else {
        message.warning('Export completed but no download URL was returned.');
      }
    } catch (err: any) {
      message.error(`Export failed: ${err || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };
  // const handleExport = async () => {
  //   if (!exportParams?.fromDate || !exportParams?.toDate) {
  //     message.warning('Please select a date range before exporting.');
  //     return;
  //   }

  //   setExporting(true);

  //   try {
  //     const exportAction = exportParams.isSummaryMode ? ordersExport : exportOrders;
  //     const result = await dispatch(exportAction(exportParams)).unwrap();
  //     let token = sessionStorage.getItem('accessToken');
  //     let getOrders = await dispatch(fetchOrders1({...exportParams, size:100}));
  //     if (getOrders?.download_url) {
  //       console.log(getOrders, 'getOrders')
  //       const response = await fetch(result.download_url, {
  //         method: 'GET',
  //         headers: { Authorization: `Bearer ${token}` }, // uncomment if needed
  //         credentials: 'include', // uncomment if API uses cookies
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to download file");
  //       }

  //       const blob = await response.blob();
  //       const url = window.URL.createObjectURL(blob);

  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = result.filename || 'orders_export.xlsx';

  //       document.body.appendChild(a);
  //       a.click();
  //       a.remove();

  //       window.URL.revokeObjectURL(url);

  //       message.success('Export downloaded successfully.');
  //     } else {
  //       message.warning('Export completed but no download URL was returned.');
  //     }
  //   } catch (err: any) {
  //     message.error(`Export failed: ${err || 'Unknown error'}`);
  //   } finally {
  //     setExporting(false);
  //   }
  // };
  const drawerTitle = (
    <Space direction="vertical" size={2} style={{ lineHeight: 1.4 }}>
      <Title level={5} style={{ margin: 0 }}>{formatDate(day)}</Title>
      <Space size={8}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {(category || '').split('|').join(' > ')}
        </Text>
        {meta?.total !== undefined && !loading && (
          <Tag color="yellow" style={{ marginLeft: 4 }}>{meta.total.toLocaleString()} orders</Tag>
        )}
      </Space>
    </Space>
  );

  const drawerExtra = data?.length > 0 ? (
    <Tooltip title={exporting ? 'Exporting…' : 'Export to Excel'}>
      <button
        onClick={handleExport}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 6, cursor: exporting ? 'not-allowed' : 'pointer',
          color: '#52c41a', fontWeight: 500, fontSize: 13,
          opacity: exporting ? 0.6 : 1, border: '1px solid #52c41a', background: 'transparent'
        }}>
        <DownloadOutlined />
        {exporting ? 'Exporting...' : 'Export'}
      </button>
    </Tooltip>
  ) : null;

  const drawerFooter = meta?.last_page > 1 ? (
    <div className='custom-pagination' style={{ textAlign: 'right', color: "#d4b106", padding: '8px 0' }}>
      <Pagination
        style={{ color: "#d4b106" }}
        current={page}
        total={meta.total}
        pageSize={meta.per_page || 50}
        onChange={onPageChange}
        showSizeChanger={false}
        showTotal={(total, range) => `${range[0]}–${range[1]} of ${total.toLocaleString()} orders`}
        size="small"
      />
    </div>
  ) : null;

  const hasFooter = meta?.last_page > 1;
  const columns = buildDynamicColumns(data);

  // ✅ calculate total width dynamically
  const totalWidth = columns.reduce(
    (sum, col) => sum + (col.width || 150),
    0
  );
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="80%"
      title={drawerTitle}
      extra={drawerExtra}
      footer={drawerFooter}
      styles={{
        body: {
          padding: 0,
          background: '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
        header: { borderBottom: '1px solid #f0f0f0', flexShrink: 0 },
        footer: { flexShrink: 0 },
      }}>

      {error && (
        <Alert
          type="error"
          message={`Failed to load orders: ${error}`}
          showIcon
          style={{ margin: '12px 16px 0', flexShrink: 0 }}
        />
      )}
      <Spin spinning={loading} tip="Loading orders…" style={{ color: "#d4b106" }}
        indicator={(<LoadingOutlined style={{ fontSize: 24, color: "#d4b106" }} spin />)}>
        <Table
          dataSource={data}
          columns={buildDynamicColumns(data)}
          rowKey={(row: any, i?: number) => row.orderId || String(i)}
          pagination={false}
          size="small"
          bordered
          scroll={{
            x: totalWidth,
            y: `calc(100vh - ${hasFooter ? 260 : 200}px)`,
          }}
          showSorterTooltip={false}
          sortDirections={['ascend', 'descend']}
          locale={{ emptyText: 'No orders found for this selection.' }}
        />
      </Spin>
    </Drawer>
  );
}