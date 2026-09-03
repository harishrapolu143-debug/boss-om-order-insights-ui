import React from 'react';
import { Badge } from './ui/badge/badge';
import { Calendar, User, Wrench, FileText, AlertCircle } from 'lucide-react';

interface OrderSummaryProps {
  order: {
    orderId: string;
    customerName: string;
    orderStatus: 'Completed' | 'In Progress' | 'Pending' | 'Failed';
    createdDate: string;
    lastUpdated: string;
    assignedTechnician: string;
    serviceType: string;
    caseStatus: string;
  };
}

export const OrderSummaryPanel: React.FC<OrderSummaryProps> = ({ order }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Order Summary</h2>
          <p className="font-semibold text-gray-900">{order.orderId}</p>
        </div>
        <Badge className={`${getStatusColor(order.orderStatus)} border`}>
          {order.orderStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 mb-1">Customer Name</p>
            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 mb-1">Created Date</p>
            <p className="text-sm font-medium text-gray-900">{order.createdDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 mb-1">Last Updated</p>
            <p className="text-sm font-medium text-gray-900">{order.lastUpdated}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Wrench className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 mb-1">Assigned Technician</p>
            <p className="text-sm font-medium text-gray-900">{order.assignedTechnician}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 mb-1">Service Type</p>
            <p className="text-sm font-medium text-gray-900">{order.serviceType}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 mb-1">Case Status</p>
            <p className="text-sm font-medium text-gray-900">{order.caseStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
