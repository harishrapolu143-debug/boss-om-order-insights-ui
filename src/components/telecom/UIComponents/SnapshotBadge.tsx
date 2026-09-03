'use client';

import { Tag, Tooltip } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

interface SnapshotBadgeProps {
  date: string;
}

export function SnapshotBadge({ date }: SnapshotBadgeProps) {
  return (
    <Tooltip title="Data is from this nightly snapshot">
      <Tag icon={<ClockCircleOutlined />} color="gold" style={{ cursor: 'default', fontSize: 12 }}>
        Snapshot: {date}
      </Tag>
    </Tooltip>
  );
}
