import { OrderTimelineApi } from "../../redux/service/query/endpoints/orderTimelineApi";

const middleware = [
  OrderTimelineApi.middleware,
];

export default middleware;