"use client";

import { TIMELINE_TABS } from "@/lib/constants";
import React from "react";

const OrderSidebar = ({ orderId, timelineFilter, handleTimelineTab }: any) => {
  return (
    <aside className="w-[320px] bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      <div className="p-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Order Information
        </p>

        {/* Order Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8">
          <h2 className="text-lg font-bold text-gray-900">
            {orderId}
          </h2>

          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Created Jan 19, 2026
          </p>

          {/* <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 uppercase">
              Active
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 uppercase">
              Fulfillment
            </span>
          </div> */}
        </div>

        <nav className="space-y-1">
          {TIMELINE_TABS.map((tab) => {
            const isActive = timelineFilter.includes(tab.id);
            return (
              <a
                key={tab.id}
                href="#"
                onClick={() => handleTimelineTab(tab, isActive)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive ? "bg-orange-50 text-orange-400" : "text-gray-500 hover:bg-gray-50"}`}
              >
            <span className="material-symbols-outlined text-[12px] sm:text-sm">
                        {tab.icon}
                    </span>
            {tab.label}
          </a>
          )})}
        </nav>
      </div>
    </aside>
  );
};

export default OrderSidebar;