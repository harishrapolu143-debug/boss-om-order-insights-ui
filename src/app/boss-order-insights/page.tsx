import { getServerToken } from "@/lib/auth/authToken";
import TimelineHome from "./TimelineHome";
import OrderActivity from "@/components/orderActivity/OrderActivity";

type PageProps = {
  searchParams: Promise<{
    src?: string;
    orderId?: string;
  }>;
};

export default async function Home({ searchParams }: PageProps) {
  await getServerToken();

  const params = await searchParams;
  const isFromBossOm = !!(params.src && params.orderId);
  return (
    <OrderActivity isFromBossOm={isFromBossOm} bossOMOrderId={params.orderId} />
  );
}
