export type GetOrderTimeLine = {
  orderId: string;
  page?: number;
  size?: number;
  notesType?: any;
  loadedDetails?: any;
};

export type GetMilestone = {
  productType: string;
  orderAction: string;
  accountType: string;
  voiceCategory: string;
  networkType: string;
  fulfillmentTaskMap?: any;
  dispatchStatus?: string;
};
