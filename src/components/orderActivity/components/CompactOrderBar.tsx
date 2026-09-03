import React, { useMemo, useState } from "react";
import { Badge } from "./ui/badge/badge";
import {
  Calendar,
  User,
  FileText,
  AlertTriangle,
  List,
  GitBranch,
  RefreshCcw,
  Phone,
  MapPin,
  Mail,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip/tooltip";
import moment from "moment";
import { DisplayMode } from "../OrderActivity";
import { useAppSelector } from "@/lib/redux/hooks";
import { OrderRecord } from "@/lib/redux/slices/orderSlice";
import { emailToName } from "@/lib/utils/helpers";

interface CompactOrderBarProps {
  order?: OrderRecord;
  displayMode: DisplayMode;
  setDisplayMode: React.Dispatch<DisplayMode>;
  isLoading?: boolean;
  isMilestoneLoading?: boolean;
  daysPastDue: number;
}

const Text = ({
  isLoading,
  children,
}: {
  isLoading?: boolean;
  children: React.ReactNode;
}) => {
  return isLoading ? (
    <div className="h-3 bg-gray-300 rounded-full w-38  animate-pulse" />
  ) : (
    children
  );
};

export const CompactOrderBar: React.FC<CompactOrderBarProps> = ({
  order,
  displayMode,
  setDisplayMode,
  isLoading,
  isMilestoneLoading,
  daysPastDue: passedDays,
}) => {
  const [isCustomerExpanded, setIsCustomerExpanded] = useState(false);

  const orderMilestones = useAppSelector(
    (state) => state.order.orderMilestones,
  );

  const currentOrderVersion = useAppSelector(
    (state) => state.order.currentOrderVersion,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const haveValidOrderNumber =
    (order &&
      typeof order.external_id === "string" &&
      order.external_id.trim()) ||
    isLoading;

  const enableVersionCard = Number(currentOrderVersion) > 1;

  const isHaveMilestones =
    orderMilestones?.isHaveMilestones ||
    isMilestoneLoading ||
    enableVersionCard;

  if (!haveValidOrderNumber) return null;
  return (
    <>
      {/* Order details Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <Text isLoading={isLoading}>
              <span className="font-semibold text-gray-900">
                {order?.external_id}
              </span>
            </Text>
          </div>

          {order?.u_agent_id && (
            <>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">
                  Agent: {emailToName(order.u_agent_id)}
                </span>
              </div>
            </>
          )}

          {order?.sys_created_on && !isHaveMilestones && (
            <>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">
                  Order Date:{" "}
                  {moment(order.sys_created_on).format("MMM Do YYYY")}
                </span>
              </div>
            </>
          )}

          {order?.u_dispatch_status && (
            <>
              <div className="w-px h-4 bg-gray-300"></div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600">Dispatch Status:</span>
                <Badge
                  className={`${getStatusColor(order.u_dispatch_status?.toLowerCase())} border text-xs`}
                >
                  {order.u_dispatch_status}
                </Badge>{" "}
              </div>
            </>
          )}

          {order?.u_due_date && !isHaveMilestones && (
            <>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Due {moment(order?.u_due_date).format("MMM Do YYYY")}
                </span>
                {passedDays > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-red-100 text-red-800 border-red-200 border text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Expired
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white">
                        Past due by {passedDays} days
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </>
          )}
        </div>

        {/* Customer tab toggle — visible only when collapsed */}
        {!isCustomerExpanded && (
          <button
            onClick={() => setIsCustomerExpanded(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-3 py-1.5 cursor-pointer transition-colors duration-150 select-none"
            style={{
              transform: "skewX(-10deg)",
              borderRadius: "2px 3px 3px 2px",
            }}
          >
            <span
              className="flex items-center gap-1.5"
              style={{ transform: "skewX(10deg)" }}
            >
              <User className="w-3 h-3" />
              Customer
            </span>
          </button>
        )}
      </div>

      {/* Customer Details Bar — accordion */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: isCustomerExpanded ? "1fr" : "0fr",
          transition: "grid-template-rows 280ms ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-2.5 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-yellow-600 font-semibold shrink-0">
              <User className="w-4 h-4" />
              <span>Customer</span>
            </div>

            <div className="w-px h-4 bg-yellow-200 mx-1" />

            <div className="flex items-center gap-1.5">
              <span className="text-yellow-500 font-medium text-xs uppercase tracking-wide">
                Name
              </span>
              <Text isLoading={isLoading}>
                <span className="text-gray-800 font-semibold">
                  {order?.account_primary_contact_first_name}{" "}
                  {order?.account_primary_contact_last_name}
                </span>
              </Text>
            </div>

            <div className="w-px h-4 bg-yellow-200 mx-1" />
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-yellow-500 font-medium text-xs uppercase tracking-wide">
                Email
              </span>
              <Text isLoading={isLoading}>
                <span className="text-gray-800 font-semibold">
                  {order?.account_primary_contact_email}
                </span>
              </Text>
            </div>

            <div className="w-px h-4 bg-yellow-200 mx-1" />
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-yellow-500 font-medium text-xs uppercase tracking-wide">
                Phone
              </span>
              <Text isLoading={isLoading}>
                <span className="text-gray-800 font-semibold">
                  {order?.account_primary_contact_mobile_phone}
                </span>
              </Text>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsCustomerExpanded(false)}
              className="ml-auto flex items-center justify-center w-6 h-6 rounded-full hover:bg-yellow-200 text-yellow-500 hover:text-yellow-800 transition-colors duration-150 cursor-pointer shrink-0"
              aria-label="Close customer details"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
