import { Order, TimelineTab } from "@/lib/types";



export const STATUS_COLOR_CLASS: Record<Order['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export const VIEW_TABS = [
    { key: 'consolidated', label: 'Consolidated View' },
    { key: 'version-2', label: 'Version 2' },
    { key: 'version-1', label: 'Version 1' },
];

export const TIMELINE_TABS: TimelineTab[] = [
    { id: 'userRemarks', label: 'User Remarks', icon: 'person' },
    { id: 'remarks', label: 'Remarks', icon: 'description' },
    { id: 'interfaceLogs', label: 'Interface Logs', icon: 'history' },
    { id: 'milestones', label: 'Milestones', icon: 'flag' },
];

export const STATUS_ICON_MAP: Record<string, string> = {
    fallout: 'error',
    userRemarks: 'person',
    remarks: 'description',
    milestones: 'flag',
    interfaceLogs: 'history'
};

export const STATUS_ICON_BG_CLASS: Record<string, string> = {
    fallout: 'bg-red-500',
    'in-progress': 'bg-orange-400',
    userRemarks: 'bg-blue-500',
    interfaceLogs: 'bg-emerald-500',
    remarks: 'bg-gray-800',
    milestones: 'bg-yellow-500',
    default: 'bg-gray-400',
};

export const STATUS_CARD_CLASS: Record<string, string> = {
    fallout: 'border-red-200 bg-red-50',
    default: 'border-gray-200',
};