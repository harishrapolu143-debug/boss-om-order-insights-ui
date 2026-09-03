
import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "../../redux/slices/authSlice";
import orderSlice from "../../redux/slices/orderSlice";
import { OrderTimelineApi } from "../../redux/service/query/endpoints/orderTimelineApi";
import telecomOrderReducer from "../../redux/slices/telecomOrderSlice";

const rootReducer = combineReducers({
  auth: authSlice,
  order: orderSlice,
  telecomOrder: telecomOrderReducer,
  [OrderTimelineApi.reducerPath]: OrderTimelineApi.reducer,
});

export default rootReducer;
