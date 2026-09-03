'use client';

import { useState, useEffect } from 'react';
import {
  Drawer, Button, Tag, Typography, Tooltip, Empty, Tabs, Table,
  Input, Modal, Select, Checkbox, message
} from 'antd';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  HolderOutlined, DeleteOutlined, EditOutlined, PlusOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const PANEL_HEIGHT = 'calc(75vh - 160px)';
const genUid = () => Math.random().toString(36).slice(2);

interface ViewCreateSidebarProps {
  open: boolean;
  onClose: () => void;
  onApply: (selectedCols: any[], configName: string, filters: any[], hierarchyConditions: Record<string, any>) => void;
  onUpdateReport: (id: any, selectedCols: any[], filters: any[], hierarchyConditions: Record<string, any>) => void;
  allFields?: any[];
  savedReports?: any[];
  onDeleteReport: (id: any) => void;
  applyLoading?: boolean;
  updateLoading?: boolean;
  relationalData?: any[];
}

export function ViewCreateSidebar({
  open, onClose, onApply, onUpdateReport,
  allFields = [], savedReports = [], onDeleteReport,
  applyLoading = false, updateLoading = false, relationalData = []
}: ViewCreateSidebarProps) {
  const columns = allFields.filter((c) => c.selectable !== false);

  const [selected, setSelected] = useState<{ uid: string; key: string }[]>([]);
  const [activeTab, setActiveTab] = useState('create');
  const [configName, setConfigName] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; record: any }>({ open: false, record: null });
  const [deleteInput, setDeleteInput] = useState('');
  const [editingReport, setEditingReport] = useState<any>(null);
  const [pendingClose, setPendingClose] = useState(false);
  const [loadingStarted, setLoadingStarted] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, { operator: string; values: string[] }>>({});
  const [itemConstraints, setItemConstraints] = useState<Record<string, { fieldKey: string; selectedValues: string[] }>>({});
  const [constraintModal, setConstraintModal] = useState<{ open: boolean; uid: string | null; colKey: string | null }>({ open: false, uid: null, colKey: null });
  const [constraintField, setConstraintField] = useState<string | null>(null);
  const [constraintValues, setConstraintValues] = useState<string[]>([]);

  const currentLoading = editingReport ? updateLoading : applyLoading;

  useEffect(() => {
    if (!pendingClose) return;
    if (currentLoading) {
      setLoadingStarted(true);
    } else if (loadingStarted) {
      setPendingClose(false);
      setLoadingStarted(false);
      setSelected([]);
      setConfigName('');
      setEditingReport(null);
      setAppliedFilters({});
      setItemConstraints({});
      onClose();
    }
  }, [currentLoading, pendingClose, loadingStarted, onClose]);

  useEffect(() => {
    if (open) {
      setSelected([]);
      setActiveTab('create');
      setConfigName('');
      setEditingReport(null);
      setAppliedFilters({});
      setItemConstraints({});
    }
  }, [open]);

  const selectedCols = selected
    .map((item) => {
      const col = columns.find((c: any) => c.key === item.key);
      return col ? { ...col, uid: item.uid } : null;
    })
    .filter(Boolean);

  const handleDragEnd = ({ source, destination, draggableId }: DropResult) => {
    if (!destination) return;
    const from = source.droppableId;
    const to = destination.droppableId;
    if (from === 'selected' && to === 'selected') {
      const next = [...selected];
      const [moved] = next.splice(source.index, 1);
      next.splice(destination.index, 0, moved);
      setSelected(next);
      return;
    }
    if (from === 'available' && to === 'selected') {
      const next = [...selected];
      next.splice(destination.index, 0, { uid: genUid(), key: draggableId });
      setSelected(next);
      return;
    }
    if (from === 'selected' && to === 'available') {
      setSelected(selected.filter((item) => item.uid !== draggableId));
    }
  };

  const removeCol = (uid: string) => {
    setSelected(selected.filter((item) => item.uid !== uid));
    setItemConstraints((prev) => { const next = { ...prev }; delete next[uid]; return next; });
  };

  const openConstraintModal = (uid: string, colKey: string) => {
    const existing = itemConstraints[uid];
    setConstraintField(existing?.fieldKey || null);
    setConstraintValues(existing?.selectedValues || []);
    setConstraintModal({ open: true, uid, colKey });
  };

  const handleConstraintSave = () => {
    const { uid } = constraintModal;
    if (!uid) return;
    if (constraintField && constraintValues.length > 0) {
      const parentInHierarchy = selectedCols.some((col: any) => col.key === constraintField);
      if (!parentInHierarchy) {
        message.error(`Cannot create: "${constraintField}" is not present in the selected hierarchy.`);
        return;
      }
      setItemConstraints((prev) => ({ ...prev, [uid]: { fieldKey: constraintField, selectedValues: constraintValues } }));
    } else {
      setItemConstraints((prev) => { const next = { ...prev }; delete next[uid]; return next; });
    }
    setConstraintModal({ open: false, uid: null, colKey: null });
  };

  const handleClose = () => {
    setSelected([]); setConfigName(''); setEditingReport(null);
    setAppliedFilters({}); setItemConstraints({});
    onClose();
  };

  const handleApply = () => {
    const filtersArray = Object.entries(appliedFilters).map(([key, { operator, values }]) => ({ key, operator, values }));
    const hierarchyConditions: Record<string, any> = {};
    selectedCols.forEach((col: any) => {
      const constraint = itemConstraints[col.uid];
      if (constraint) {
        hierarchyConditions[col.key] = {
          parent_field: constraint.fieldKey,
          parent_value: constraint.selectedValues.length === 1 ? constraint.selectedValues[0] : constraint.selectedValues
        };
      }
    });
    if (editingReport) {
      onUpdateReport?.(editingReport.id, selectedCols, filtersArray, hierarchyConditions);
    } else {
      onApply?.(selectedCols, configName, filtersArray, hierarchyConditions);
    }
    setPendingClose(true);
  };

  const handleReset = () => setSelected(
    editingReport
      ? (editingReport.hierarchy || []).filter((key: string) => columns.some((c: any) => c.key === key)).map((key: string) => ({ uid: genUid(), key }))
      : []
  );

  const handleEdit = (record: any) => {
    const keys = (record.hierarchy || []).filter((key: string) => columns.some((c: any) => c.key === key)).map((key: string) => ({ uid: genUid(), key }));
    setEditingReport(record);
    setConfigName(record.name);
    setSelected(keys);
    setActiveTab('create');
    const savedFiltersMap: Record<string, any> = {};
    if (Array.isArray(record.filters)) {
      record.filters.forEach((f: any) => { savedFiltersMap[f.key] = { operator: f.operator, values: f.values }; });
    }
    setAppliedFilters(savedFiltersMap);
    const conditions = record.hierarchy_conditions || {};
    const restoredConstraints: Record<string, any> = {};
    keys.forEach(({ uid, key }: { uid: string; key: string }) => {
      const cond = conditions[key];
      if (cond) {
        restoredConstraints[uid] = {
          fieldKey: cond.parent_field,
          selectedValues: Array.isArray(cond.parent_value) ? cond.parent_value : [cond.parent_value]
        };
      }
    });
    setItemConstraints(restoredConstraints);
  };

  const reportTableColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true, render: (val: string) => <span style={{ fontWeight: 500 }}>{val}</span> },
    {
      title: 'Created At', dataIndex: 'created_at', key: 'created_at', width: 110,
      render: (val: string) => val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
    },
    {
      title: 'Action', key: 'actions', width: 64, align: 'center' as const,
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Tooltip title="Edit"><EditOutlined style={{ color: '#d4a017', cursor: 'pointer', fontSize: 14 }} onClick={() => handleEdit(record)} /></Tooltip>
          {savedReports?.length > 1 && (
            <Tooltip title="Delete">
              <DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 14 }}
                onClick={() => { setDeleteModal({ open: true, record }); setDeleteInput(''); }} />
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  const drawerFooter = activeTab === 'create' ? (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <Button onClick={handleReset} style={{ borderColor: '#d9d9d9', color: '#595959' }}>Reset</Button>
      <Button onClick={handleClose} style={{ borderColor: '#d9d9d9', color: '#595959' }}>Cancel</Button>
      <Button
        type="primary"
        onClick={handleApply}
        loading={pendingClose && !!currentLoading}
        disabled={selectedCols.length === 0 || !configName.trim() || (pendingClose && !!currentLoading)}
        style={{ background: '#d4a017', borderColor: '#d4a017', color: '#fff' }}>
        {editingReport ? 'Update' : 'Create'}
      </Button>
    </div>
  ) : null;

  return (
    <Drawer
      title={<span style={{ fontWeight: 600, fontSize: 15 }}>View / Create</span>}
      placement="right"
      width={600}
      open={open}
      onClose={handleClose}
      footer={drawerFooter}
      styles={{ body: { padding: '0 0 16px', overflowX: 'hidden' } }}>
      <style>{`
        .vcs-tabs .ant-tabs-nav { margin: 0; padding: 0 16px; background: #f8f9fb; border-bottom: 2px solid #e8eaf0; }
        .vcs-tabs .ant-tabs-tab { padding: 10px 20px; font-size: 13px; font-weight: 500; color: #8c8c8c; border: none !important; background: transparent !important; }
        .vcs-tabs .ant-tabs-tab:hover { color: #d4a017; }
        .vcs-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #d4a017 !important; font-weight: 600; }
        .vcs-tabs .ant-tabs-ink-bar { background: #d4a017; height: 3px; border-radius: 3px 3px 0 0; }
        .vcs-tabs .ant-tabs-content-holder { padding: 16px 16px 0; }
        .vcs-tabs .ant-tabs-nav::before { border: none; }
      `}</style>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="vcs-tabs"
        style={{ marginBottom: 0 }}
        items={[
          {
            key: 'create',
            label: editingReport ? 'Update Report' : 'Create Report',
            children: (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div style={{ marginBottom: 14 }}>
                  <Text strong style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 6 }}>Name</Text>
                  <Input
                    placeholder="Enter name"
                    value={configName}
                    onChange={(e) => !editingReport && setConfigName(e.target.value)}
                    maxLength={100}
                    readOnly={!!editingReport}
                    allowClear={!editingReport}
                    style={editingReport ? { background: '#f5f5f5', cursor: 'not-allowed', color: '#8c8c8c' } : {}}
                  />
                </div>
                <div style={{ display: 'flex', gap: 16, overflowX: 'hidden' }}>
                  {/* Available columns */}
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginBottom: 8 }}>AVAILABLE</Text>
                    <Droppable droppableId="available">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{
                            height: PANEL_HEIGHT, overflowY: 'auto',
                            background: snapshot.isDraggingOver ? '#e6f4ff' : '#fafafa',
                            border: '1px dashed #d9d9d9', borderRadius: 6, padding: 8, transition: 'background 0.2s'
                          }}>
                          {columns.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Loading fields…" style={{ marginTop: 40 }} />}
                          {columns.map((col: any, index: number) => {
                            const isSelected = selected.some((item) => item.key === col.key);
                            return (
                              <Draggable key={col.key} draggableId={col.key} index={index}>
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 8,
                                      padding: '7px 10px', marginBottom: 6,
                                      background: snap.isDragging ? '#fffbe6' : isSelected ? '#f6ffed' : '#fff',
                                      border: `1px solid ${snap.isDragging ? '#d4a017' : isSelected ? '#b7eb8f' : '#f0f0f0'}`,
                                      borderRadius: 6, cursor: isSelected ? 'default' : 'grab',
                                      fontSize: 13, opacity: isSelected ? 0.7 : 1,
                                      boxShadow: snap.isDragging ? '0 2px 8px rgba(212,160,23,0.15)' : 'none',
                                      userSelect: 'none', ...prov.draggableProps.style
                                    }}>
                                    <HolderOutlined style={{ color: isSelected ? '#95de64' : '#bfbfbf', fontSize: 14, flexShrink: 0 }} />
                                    <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                      {col.table_label && (
                                        <span style={{ fontSize: 8, fontWeight: 400, color: '#722ed1', background: '#f9f0ff', border: '1px solid #d3adf7', borderRadius: 4, padding: '1px 5px', lineHeight: 1.6, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                          {col.table_label}
                                        </span>
                                      )}
                                      <span style={{ lineHeight: 1.4, color: isSelected ? '#52c41a' : 'inherit' }}>{col.label}</span>
                                    </span>
                                    {isSelected && <span style={{ color: '#52c41a', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>✓</span>}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  {/* Selected columns */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 12, color: '#8c8c8c', flex: 1 }}>SELECTED</Text>
                      <Tag color="gold" style={{ fontSize: 11, margin: 0 }}>{selected.length} selected</Tag>
                    </div>
                    <Droppable droppableId="selected">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{
                            height: PANEL_HEIGHT, overflowY: 'auto',
                            background: snapshot.isDraggingOver ? '#f6ffed' : '#fafafa',
                            border: '1px dashed #d9d9d9', borderRadius: 6, padding: 8, transition: 'background 0.2s'
                          }}>
                          {selectedCols.length === 0 && (
                            <Text type="secondary" style={{ fontSize: 12, padding: 8, display: 'block', textAlign: 'left' }}>
                              Drag columns here
                            </Text>
                          )}
                          {selectedCols.map((col: any, index: number) => {
                            const activeFilter = appliedFilters[col.key];
                            const constraint = itemConstraints[col.uid];
                            return (
                              <Draggable key={col.uid} draggableId={col.uid} index={index}>
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    style={{
                                      padding: '7px 10px', marginBottom: 6,
                                      background: snap.isDragging ? '#f6ffed' : '#fff',
                                      border: `1px solid ${snap.isDragging ? '#52c41a' : activeFilter ? '#d4a017' : '#f0f0f0'}`,
                                      borderRadius: 6, cursor: 'grab', fontSize: 13,
                                      boxShadow: snap.isDragging ? '0 2px 8px rgba(82,196,26,0.15)' : 'none',
                                      userSelect: 'none', ...prov.draggableProps.style
                                    }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <HolderOutlined style={{ color: '#bfbfbf', fontSize: 14, flexShrink: 0 }} />
                                      <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {col.table_label && (
                                          <span style={{ fontSize: 8, fontWeight: 400, color: '#722ed1', background: '#f9f0ff', border: '1px solid #d3adf7', borderRadius: 4, padding: '1px 5px', lineHeight: 1.6, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            {col.table_label}
                                          </span>
                                        )}
                                        <span>{col.label}</span>
                                      </span>
                                      {index > 0 && (
                                        <Tooltip title={constraint ? 'Edit values' : 'Add values'}>
                                          <PlusOutlined
                                            style={{ color: constraint ? '#d4a017' : '#8c8c8c', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}
                                            onClick={(e) => { e.stopPropagation(); openConstraintModal(col.uid, col.key); }}
                                          />
                                        </Tooltip>
                                      )}
                                      <Tooltip title="Remove">
                                        <DeleteOutlined
                                          style={{ color: '#ff4d4f', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}
                                          onClick={() => removeCol(col.uid)}
                                        />
                                      </Tooltip>
                                    </div>
                                    {constraint && (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 6, paddingLeft: 22 }}>
                                        {constraint.fieldKey && <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 500, marginRight: 2 }}>{constraint.fieldKey}:</span>}
                                        {constraint.selectedValues.map((v) => (
                                          <Tag key={v} closable
                                            onClose={(e) => {
                                              e.preventDefault();
                                              const next = constraint.selectedValues.filter((x) => x !== v);
                                              if (next.length === 0) {
                                                setItemConstraints((prev) => { const n = { ...prev }; delete n[col.uid]; return n; });
                                              } else {
                                                setItemConstraints((prev) => ({ ...prev, [col.uid]: { ...constraint, selectedValues: next } }));
                                              }
                                            }}
                                            style={{ fontSize: 11, margin: 0, lineHeight: '18px', background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591', borderRadius: 4 }}>
                                            {v}
                                          </Tag>
                                        ))}
                                      </div>
                                    )}
                                    {activeFilter && (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 6, paddingLeft: 22 }}>
                                        <Tag style={{ fontSize: 11, margin: 0, lineHeight: '18px', background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff', fontWeight: 600, borderRadius: 4 }}>
                                          {activeFilter.operator.replace(/_/g, ' ')}
                                        </Tag>
                                        <span style={{ color: '#8c8c8c', fontSize: 11, fontWeight: 500 }}>→</span>
                                        {activeFilter.values.map((v) => (
                                          <Tag key={v} style={{ fontSize: 11, margin: 0, lineHeight: '18px', background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f', borderRadius: 4 }}>{v}</Tag>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              </DragDropContext>
            )
          },
          {
            key: 'all-report',
            label: 'All Report',
            children: (
              <Table
                columns={reportTableColumns}
                dataSource={savedReports}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10, size: 'small', hideOnSinglePage: true }}
                locale={{ emptyText: 'No reports yet.' }}
                style={{ marginTop: 4 }}
              />
            )
          }
        ]}
      />

      {/* Constraint modal */}
      {constraintModal.open && (() => {
        const filtered = Array.isArray(relationalData)
          ? relationalData.filter((item: any) => {
              const parts = (item.child_class || '').split('.');
              return parts[parts.length - 1] === constraintModal.colKey;
            })
          : [];
        const parentClasses = [...new Set(filtered.map((item: any) => item.parent_class))] as string[];
        const parentNames = constraintField
          ? [...new Set(filtered.filter((item: any) => item.parent_class === constraintField).map((item: any) => item.parent_name))] as string[]
          : [];
        return (
          <Modal
            open
            title={<span style={{ fontWeight: 600 }}>Add Values</span>}
            width={660}
            onCancel={() => { setConstraintModal({ open: false, uid: null, colKey: null }); setConstraintField(null); setConstraintValues([]); }}
            onOk={handleConstraintSave}
            okText="Save"
            styles={{ body: { padding: '16px 0 0' } }}>
            <div style={{ display: 'flex', gap: 0, height: 340, border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: '45%', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '8px 12px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <Text strong style={{ fontSize: 11, color: '#8c8c8c', letterSpacing: '0.5px' }}>PARENT CLASS</Text>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                  {parentClasses.length === 0 && <Text type="secondary" style={{ fontSize: 12, padding: 8, display: 'block' }}>No relational data available</Text>}
                  {parentClasses.map((pc) => (
                    <div key={pc} onClick={() => { setConstraintField(pc); setConstraintValues([]); }}
                      style={{ padding: '7px 10px', marginBottom: 4, borderRadius: 5, cursor: 'pointer', fontSize: 13,
                        background: constraintField === pc ? '#fffbe6' : 'transparent',
                        border: `1px solid ${constraintField === pc ? '#ffe58f' : 'transparent'}`,
                        color: constraintField === pc ? '#d4a017' : '#262626',
                        fontWeight: constraintField === pc ? 600 : 400, transition: 'all 0.15s', textTransform: 'capitalize' }}>
                      {pc}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '8px 12px', background: '#fafafa', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 11, color: '#8c8c8c', letterSpacing: '0.5px' }}>PARENT NAME</Text>
                  {constraintValues.length > 0 && <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>{constraintValues.length} selected</Tag>}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                  {!constraintField && <Text type="secondary" style={{ fontSize: 12, padding: 8, display: 'block' }}>Select a parent class on the left first</Text>}
                  {constraintField && parentNames.length === 0 && <Text type="secondary" style={{ fontSize: 12, padding: 8, display: 'block' }}>No values available</Text>}
                  {parentNames.map((v) => {
                    const checked = constraintValues.includes(v);
                    return (
                      <div key={v} onClick={() => setConstraintValues((prev) => checked ? prev.filter((x) => x !== v) : [...prev, v])}
                        style={{ padding: '7px 10px', marginBottom: 4, borderRadius: 5, cursor: 'pointer', fontSize: 13,
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: checked ? '#fff7e6' : 'transparent',
                          border: `1px solid ${checked ? '#ffd591' : 'transparent'}`,
                          color: checked ? '#d46b08' : '#262626', transition: 'all 0.15s' }}>
                        <Checkbox checked={checked} style={{ pointerEvents: 'none' }} />
                        <span>{v}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Delete report modal */}
      <Modal
        open={deleteModal.open}
        title={<span style={{ color: '#ff4d4f' }}>Delete Report?</span>}
        onCancel={() => setDeleteModal({ open: false, record: null })}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModal({ open: false, record: null })}>Cancel</Button>,
          <Button key="delete" danger type="primary"
            disabled={deleteInput !== 'DELETE'}
            onClick={() => { onDeleteReport?.(deleteModal.record?.id); setDeleteModal({ open: false, record: null }); setDeleteInput(''); }}>
            Delete
          </Button>
        ]}>
        <p style={{ marginBottom: 4 }}>To confirm, type <strong>DELETE</strong> in the field below.</p>
        <Input placeholder="Type DELETE to confirm" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} />
      </Modal>
    </Drawer>
  );
}
