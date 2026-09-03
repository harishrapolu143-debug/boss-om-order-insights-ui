'use client';

import React from 'react';
import { Card, Statistic, Row, Col, Skeleton } from 'antd';
import {
  ShoppingCartOutlined, CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined, QuestionCircleOutlined
} from '@ant-design/icons';

const KPI_DEFS = [
  { label: 'Total Orders', key: 'total_orders', suffix: '', icon: <ShoppingCartOutlined />, color: '#ffc916', bg: '#fffde6' },
  { label: '% Completed', key: 'completed_pct', suffix: '%', icon: <CheckCircleOutlined />, color: '#0da014', bg: '#eaffe8' },
  { label: '% Cancelled', key: 'cancelled_pct', suffix: '%', icon: <CloseCircleOutlined />, color: '#808080', bg: '#f5f5f5' },
  { label: '% No Action Needed', key: 'no_action_pct', suffix: '%', icon: <QuestionCircleOutlined />, color: '#52c41a', bg: '#f6ffed' },
  { label: '% In Jeopardy', key: 'in_jeopardy_pct', suffix: '%', icon: <WarningOutlined />, color: '#ff4d4f', bg: '#ffe6e6' },
];

interface KpiStripProps {
  summaryData: any;
  loading: boolean;
}

export function KpiStrip({ summaryData, loading }: KpiStripProps) {
  const cardData = summaryData?.summary;

  return (
    <Row gutter={[10, 10]} style={{ padding: '0 0 16px 0' }}>
      {KPI_DEFS.map((kpi) => (
        <Col key={kpi.key} xs={12} sm={12} md={8} lg={8} xl={8} style={{ flex: '1 1 0%', minWidth: 0 }}>
          <Card
            variant="borderless"
            style={{ borderTop: `3px solid ${kpi.color}`, background: kpi.bg, borderRadius: 8, height: '100%' }}
            styles={{ body: { padding: 'clamp(8px, 2vw, 20px)' } }}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <Statistic
                title={<span style={{ color: '#6b7280', fontSize: 'clamp(11px, 1.5vw, 13px)', fontWeight: 500 }}>{kpi.label}</span>}
                value={cardData?.[kpi.key] ?? '—'}
                suffix={cardData ? kpi.suffix : ''}
                prefix={React.cloneElement(kpi.icon as React.ReactElement<any>, {
                  style: { color: kpi.color, fontSize: 'clamp(14px, 2vw, 18px)', marginRight: 4 }
                })}
                valueStyle={{ color: kpi.color, fontWeight: 700, fontSize: 'clamp(16px, 2.5vw, 22px)' }}
              />
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
