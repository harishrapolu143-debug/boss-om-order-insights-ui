'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckOutlined, DownOutlined } from '@ant-design/icons';

interface OrderActionToggleProps {
  value: string;
  onChange: (val: string) => void;
  options?: string[];
}

const OPTIONS = ['Add', 'Change'];
const LABEL = 'Order Action';

export function OrderActionToggle({ value = '', onChange, options }: OrderActionToggleProps) {
  const items = options ?? OPTIONS;
  const selected = value ? value.split(',').filter(Boolean) : [];
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const toggleOption = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((v) => v !== opt)
      : [...selected, opt];
    onChange(next.join(','));
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          border: '1px solid #faad14',
          borderRadius: 6,
          padding: '0 8px',
          height: 28,
          minWidth: 145,
          background: '#fff',
          cursor: 'pointer',
          userSelect: 'none',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 13, color: selected.length > 0 ? '#262626' : '#8c8c8c', flex: 1, whiteSpace: 'nowrap' }}>
          {LABEL}
        </span>
        {selected.length > 0 ? (
          <span
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onChange(''); setOpen(false); }}
            style={{ cursor: 'pointer', fontSize: 16, lineHeight: 1, color: '#8c8c8c', display: 'inline-flex', alignItems: 'center', padding: '0 2px' }}
          >
            ×
          </span>
        ) : (
          <DownOutlined style={{ fontSize: 10, color: '#bfbfbf' }} />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1050,
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
            padding: '4px 0',
            minWidth: 160,
          }}
        >
          {items.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <div
                key={opt}
                onMouseDown={(e) => { e.preventDefault(); toggleOption(opt); }}
                style={{
                  padding: '7px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isSelected ? '#fff7e6' : 'transparent',
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: 14, height: 14, borderRadius: 3,
                    border: `2px solid ${isSelected ? '#faad14' : '#d9d9d9'}`,
                    background: isSelected ? '#faad14' : '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.2s',
                  }}
                >
                  {isSelected && <CheckOutlined style={{ color: '#fff', fontSize: 9 }} />}
                </span>
                <span style={{ fontSize: 13, color: isSelected ? '#d48806' : '#262626' }}>{opt}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
