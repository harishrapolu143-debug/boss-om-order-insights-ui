'use client';

import { useEffect, useRef } from 'react';
import { Select } from 'antd';

interface TeamMultiSelectProps {
  options: { label: string; value: string }[];
  selected: string;
  onChange: (val: string) => void;
}

export function TeamMultiSelect({ options, selected, onChange }: TeamMultiSelectProps) {
  const defaultSet = useRef(false);

  useEffect(() => {
    if (!options?.length || defaultSet.current) return;
    const latest = [...options].sort((a, b) => b.value.localeCompare(a.value))[0];
    if (latest) {
      onChange(latest.value);
      defaultSet.current = true;
    }
  }, [options, onChange]);

  return (
    <Select
      placeholder="Select Snap Date"
      value={selected || undefined}
      onChange={onChange}
      options={options}
      variant="borderless"
      style={{ minWidth: 110 }}
    />
  );
}
