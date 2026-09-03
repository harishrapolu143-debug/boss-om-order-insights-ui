export const tabClass = (active: boolean) =>
    `flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full cursor-pointer transition-colors ${active
        ? 'border border-orange-200 bg-orange-50 text-orange-500'
        : 'border border-transparent text-gray-500 hover:bg-gray-100'
    }`;

export const getTimelineTabClass = (active: boolean) =>
    active
        ? 'flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-sm font-medium text-orange-400'
        : 'flex items-center gap-1.5 rounded-full border border-transparent bg-orange-00 px-4 py-1 text-sm font-medium text-gray-500';
