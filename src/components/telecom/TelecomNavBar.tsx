'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import { selectTeamsData } from '@/lib/redux/slices/telecomOrderSlice';
import LogoYellow from '../../../public/assets/svg/logo.svg';
import ProfilePopover from '../common/ProfilePopover';

export default function TelecomNavBar() {
  const snapDateArr = useSelector(selectTeamsData);

  const latestSnapDate = useMemo(() => {
    const dates = snapDateArr?.snapshot_dates;
    if (!dates?.length) return null;
    return [...dates].sort(
      (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime()
    )[0];
  }, [snapDateArr]);

  const formattedDate = useMemo(() => {
    if (!latestSnapDate) return null;
    const tzMatch = String(latestSnapDate).match(/\s+([A-Z]{2,5})$/);
    const tzLabel = tzMatch ? tzMatch[1] : null;
    const cleanDate = tzLabel
      ? String(latestSnapDate).replace(/\s+[A-Z]{2,5}$/, '').trim()
      : latestSnapDate;
    const formatted = new Date(cleanDate).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
    return { formatted, tzLabel };
  }, [latestSnapDate]);

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#0d0d0d', borderBottom: '1px solid #2a2a2a',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      }}
    >
      <style>{`
        .wt-nav-inner {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          min-height: 56px;
          padding: 0 24px;
          gap: 12px;
        }
        .wt-nav-logo-text {
          font-size: 15px;
          font-weight: 500;
          color: #ffffff;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .wt-nav-badge {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          height: 32px;
          border-radius: 7px;
          overflow: hidden;
          border: 1px solid #d4a017;
          box-shadow: 0 1px 6px rgba(212,160,23,0.25);
        }
        .wt-nav-badge-label {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 10px;
          background: #d4a017;
          height: 100%;
          border-right: 1px solid #b8860b;
          white-space: nowrap;
        }
        .wt-nav-badge-label-text {
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }
        .wt-nav-badge-date {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 12px;
          background: #1a1a1a;
          height: 100%;
        }
        .wt-nav-badge-date-text {
          font-size: 12px;
          font-weight: 600;
          color: #f0f0f0;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .wt-nav-right { display: flex; align-items: center; }

        /* ── Phone < 640px ── */
        @media (max-width: 639px) {
          .wt-nav-inner { padding: 0 12px; min-height: 48px; gap: 8px; }
          .wt-nav-logo-text { font-size: 13px; }
          .wt-nav-badge-label { display: none; }
          .wt-nav-badge-date { padding: 0 8px; }
          .wt-nav-badge-date-text { font-size: 11px; }
          .wt-nav-badge { height: 28px; }
        }

        /* ── Tablet 640px – 1023px ── */
        @media (min-width: 640px) and (max-width: 1023px) {
          .wt-nav-inner { padding: 0 16px; }
          .wt-nav-badge-label-text { font-size: 10px; }
          .wt-nav-badge-date-text { font-size: 11px; }
        }
      `}</style>

      <div className="wt-nav-inner">
        {/* LEFT: Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, minWidth: 0 }}>
          <Image src={LogoYellow} width={20} height={20} alt="Brightspeed Logo" priority />
          <span className="wt-nav-logo-text">Brightspeed Watchtower</span>
        </div>

        {/* RIGHT: Badge + Profile */}
        <div className="wt-nav-right" style={{ gap: 12 }}>
          {formattedDate && (
            <div className="wt-nav-badge">
              <div className="wt-nav-badge-label">
                <Calendar size={13} color="#fff" />
                <span className="wt-nav-badge-label-text">Data Updated On</span>
              </div>
              <div className="wt-nav-badge-date">
                <span className="wt-nav-badge-date-text">
                  {formattedDate.formatted}
                  {formattedDate.tzLabel && (
                    <span style={{ fontSize: 11, paddingLeft: 4, fontWeight: 700, color: '#d4a017' }}>
                      {formattedDate.tzLabel}
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
          <div style={{ flexShrink: 0 }}>
            <ProfilePopover />
          </div>
        </div>
      </div>
    </header>
  );
}