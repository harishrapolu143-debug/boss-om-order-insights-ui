const orderInsightsID = '/boss-order-insights'


export const ENDPOINTS_CONSTANTS = {
    GET_AUTH_TOKEN: `${orderInsightsID}/api/auth/token`,
    GET_SUMMARY_TOKEN: `${orderInsightsID}/api/auth/summary-token`,
    GET_ORDER_TIMELINE: `${orderInsightsID}/api/order-timeline`,
    GET_ORDER_TIMELINE_PAGE: `${orderInsightsID}/api/order-timeline-page`,
    GET_ORDER_TIMELINE_MILESTONES : `${orderInsightsID}/api/order-milestone`,
    GET_ORDER_SUMMARY : `${orderInsightsID}/api/order-summary`,
    API_TOKEN_URL: "/oauth/client_credential/accesstoken?grant_type=client_credentials",
    API_ORDER_TIMELINE: "/order-insights",
    API_ORDER_TIMELINE_PAGINATION: "/order-insights/history",
    API_ORDER_TIMELINE_NOTE_TYPE: "/order-insights/all",
    API_ORDER_TIMELINE_MILESTONES: "/order-insights/milestones/tasks",
    API_ORDER_SUMMARY: "/order-summary"
} as const;