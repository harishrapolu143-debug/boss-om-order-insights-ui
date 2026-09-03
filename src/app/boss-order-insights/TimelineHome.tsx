"use client";

import OrderHeader from "@/components/orders/OrderHeader";
import OrderTimeline from "@/components/orders/OrderTimeline";
import OrderLandingPage from "@/components/common/OrderLandingPage";
import OrderTimelineSkeleton from "@/components/common/OrderTimelineSkeleton";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useGetOrderTimelineBypageQuery } from "@/lib/redux/service/query/endpoints/orderTimelineApi";
import { useEffect } from "react";
import { setOrderId } from "@/lib/redux/slices/orderSlice";

interface TimelineHomeProps {
  isFromBossOm?: boolean;
  searchParams?: {
    src?: string;
    orderId?: string;
  };
}

export default function TimelineHome({ isFromBossOm, searchParams }: TimelineHomeProps) {
  const { orderId } = useAppSelector((state) => state.order);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (searchParams?.orderId) {
      dispatch(setOrderId(searchParams.orderId));
    }
  }, [searchParams, dispatch]);

  const {
    data, isFetching, isLoading, isError, } = useGetOrderTimelineBypageQuery(
      { orderId }, { refetchOnMountOrArgChange: true, }
    );

  const timelineExists = Boolean(data?.timeline?.length);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">

      {!isFromBossOm && <OrderHeader />}

      <main className="flex flex-1 overflow-hidden bg-gray-100">

        <div className="mx-auto flex w-full flex-1 overflow-hidden">

          <div className="w-full overflow-y-auto">

            {(isLoading || isFetching) && (
              <OrderTimelineSkeleton />
            )}

            {!isLoading && !isFetching && timelineExists && !isError && (
              <OrderTimeline isFromBossOm={isFromBossOm} />
            )}

            {!isLoading && !isFetching && (!timelineExists || isError) && (
              <OrderLandingPage />
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
