'use client';

import { useState } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const MAX_DAYS = 30;

const PRESETS = [
  { label: 'Last 7 days', value: [dayjs().subtract(6, 'day'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
  { label: 'Last 14 days', value: [dayjs().subtract(13, 'day'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
  { label: 'Last 30 days', value: [dayjs().subtract(29, 'day'), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs] },
];

interface DateRangePickerProps {
  fromDate: string | null;
  toDate: string | null;
  onChange: (range: { fromDate: string | null; toDate: string | null }) => void;
}

export function DateRangePicker({ fromDate, toDate, onChange }: DateRangePickerProps) {
  const [error, setError] = useState<string | null>(null);

  const value = fromDate && toDate
    ? [dayjs(fromDate), dayjs(toDate)] as [dayjs.Dayjs, dayjs.Dayjs]
    : null;

  const handleChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (!dates) {
      setError(null);
      onChange({ fromDate: null, toDate: null });
      return;
    }
    const [from, to] = dates;
    if (!from || !to) return;
    const diff = to.diff(from, 'day');
    if (diff < 0) { setError('End date must be after start date.'); return; }
    if (diff > MAX_DAYS) { setError(`Max range is ${MAX_DAYS} days.`); return; }
    setError(null);
    onChange({ fromDate: from.format('YYYY-MM-DD'), toDate: to.format('YYYY-MM-DD') });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
      <style>{`
        .finops-range-picker .ant-picker-input { width: 90px !important; }
        .finops-range-picker .ant-picker-input input { width: 90px !important; }
        .finops-range-picker { border-color: #d4a017 !important; }
        .finops-range-picker:hover { border-color: #b8860b !important; }
        .finops-range-picker.ant-picker-focused { border-color: #d4a017 !important; box-shadow: 0 0 0 2px rgba(212,160,23,0.2) !important; }
        .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner,
        .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,
        .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner { background: #d4a017 !important; color: #fff !important; }
        .ant-picker-cell-in-view.ant-picker-cell-in-range::before { background: #fff8e1 !important; }
        .ant-picker-cell-in-view .ant-picker-cell-inner:hover { background: #ffe58f !important; }
        .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before { border-color: #d4a017 !important; }
        .ant-picker-presets li:hover { color: #d4a017 !important; }
        .ant-picker-header-view button:hover { color: #d4a017 !important; }
      `}</style>
      <RangePicker
        value={value}
        onChange={handleChange as any}
        format="MMM D, YYYY"
        allowClear
        size="middle"
        status={error ? 'error' : ''}
        className="finops-range-picker"
        style={{ borderRadius: 6, fontSize: 13 }}
        popupStyle={{ zIndex: 9999 }}
        presets={PRESETS}
      />
    </div>
  );
}