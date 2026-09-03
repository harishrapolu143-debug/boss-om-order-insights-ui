import TelecomNavBar from '@/components/telecom/TelecomNavBar';
import TelecomOrderDynamicView from '@/components/telecom/TelecomOrderDynamicView';

export const metadata = {
  title: 'Order Management - Brightspeed',
  description: 'Telecom order management dynamic view',
};

export default function TelecomOrdersPage() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f5f7fa' }}>
      <TelecomNavBar />
      <TelecomOrderDynamicView />
    </div>
  );
}
