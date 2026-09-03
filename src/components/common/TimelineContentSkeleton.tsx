'use client';

import { memo } from 'react';

const SKELETON_ITEMS = Array.from({ length: 7 }, (_, i) => i + 1);

const TimelineContentSkeleton = memo(() => {
  return (
    <div className="animate-pulse space-y-6 px-2.5">
      {SKELETON_ITEMS.map((i) => (
        <div key={i} className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
            <div className="w-px flex-1 bg-gray-300 mt-1" />
          </div>
          <div className="flex-1">
            <div className="h-3 w-44 bg-gray-300 rounded mb-3" />
            <div className="h-16 bg-white rounded-md shadow-sm p-4 space-y-2 max-w-5/6">
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

TimelineContentSkeleton.displayName = 'TimelineContentSkeleton';

export default TimelineContentSkeleton;
