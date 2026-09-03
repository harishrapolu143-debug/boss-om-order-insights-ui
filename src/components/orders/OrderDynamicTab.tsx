"use client";

import useClickOutside from "@/lib/hooks/useClickOutside";
import React, { useMemo, useState, useRef, useCallback } from "react";

interface TabItem {
    key: string;
    label: string;
    mobileLabel?: string;

}

interface Props {
    tabs: TabItem[];
    activeKey: string;
    onChange: (key: string) => void;
    visibleCount?: number;
    onRefresh?: () => void;
}

const TimelineVersionTabs: React.FC<Props> = ({
    tabs,
    activeKey,
    onChange,
    visibleCount = 3,
    onRefresh,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const popoverRef = useRef<HTMLDivElement>(null);

    const closePopover = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleRefresh = useCallback(() => {
        onRefresh?.();
    }, [onRefresh]);

    useClickOutside(popoverRef, isOpen, closePopover);

    const visibleTabs = useMemo(
        () => tabs.slice(0, visibleCount),
        [tabs, visibleCount]
    );

    const hiddenTabs = useMemo(
        () => tabs.slice(visibleCount),
        [tabs, visibleCount]
    );

    const activeHiddenTab = hiddenTabs.find((t) => t.key === activeKey);

    return (
        <div className="flex items-center gap-2 relative">
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-100 p-2.5 shadow-sm md:p-1.5">

                {/* Visible Tabs */}
                {visibleTabs.map((view) => (
                    <button
                        key={view.key}
                        onClick={() => onChange(view.key)}
                        className={`rounded-lg px-3 py-1.5 cursor-pointer text-sm font-medium transition-colors ${activeKey === view.key
                            ? "bg-white text-black shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <span className="hidden md:inline">
                            {view.label}
                        </span>
                        <span className="inline md:hidden">
                            {view.mobileLabel ?? view.label}
                        </span>
                    </button>
                ))}

                {/* Dropdown */}
                {hiddenTabs.length > 0 && (
                    <div className="relative" ref={popoverRef}>
                        <button
                            onClick={() => setIsOpen((prev) => !prev)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium flex items-center gap-1 ${activeHiddenTab
                                ? "bg-white text-black shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {activeHiddenTab ? activeHiddenTab.label : "More"}
                            <span className="material-symbols-outlined text-sm">
                                expand_more
                            </span>
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-14 md:w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                {hiddenTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => {
                                            onChange(tab.key);
                                            closePopover();
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${activeKey === tab.key
                                            ? "bg-gray-100 font-medium"
                                            : ""
                                            }`}
                                    >
                                        <span className="hidden md:inline">
                                            {tab.label}
                                        </span>
                                        <span className="inline md:hidden">
                                            {tab.mobileLabel ?? tab.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimelineVersionTabs;
