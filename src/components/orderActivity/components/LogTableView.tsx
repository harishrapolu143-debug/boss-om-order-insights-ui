import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "./ui/badge/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select/select";
import { Button } from "./ui/button/button";
import moment from "moment";
import DialogModel from "./DialogModel";
import { TimelineEvent } from "@/lib/types/order";

interface LogTableViewProps {
  events: TimelineEvent[];
}

type SortField =
  | "timestamp"
  | "title"
  | "stage"
  | "user"
  | "status"
  | "version";
type SortDirection = "asc" | "desc";

export const LogTableView: React.FC<LogTableViewProps> = ({ events = [] }) => {
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedEvents = [...(events || [])].sort((a, b) => {
    if (!a || !b) return 0;
    let comparison = 0;

    switch (sortField) {
      case "timestamp":
        comparison =
          new Date(a.timestamp || 0).getTime() -
          new Date(b.timestamp || 0).getTime();
        break;
      case "title":
        comparison = (a.title || "").localeCompare(b.title || "");
        break;
      case "status":
        comparison = (a.status || "").localeCompare(b.status || "");
        break;
      case "user":
        comparison = (a.user || "").localeCompare(b.user || "");
        break;
      case "status":
        comparison = (a.status || "").localeCompare(b.status || "");
        break;
      case "version":
        comparison = a.version > b.version ? 1 : -1;
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      defalut: {
        label: status,
        className:
          "bg-gray-100 text-gray-800 border-gray-200 text-xs px-2 py-0.5",
      },
      userRemarks: {
        label: "User Remarks",
        className:
          "bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-0.5",
      },
      milestones: {
        label: "Milestones",
        className:
          "bg-orange-100 text-orange-800 border-orange-200 text-xs px-2 py-0.5",
      },
      remarks: {
        label: "Remarks",
        className: "bg-red-100 text-red-800 border-red-200 text-xs px-2 py-0.5",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.defalut;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <ChevronDown className="w-3.5 h-3.5 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg">No events found</p>
        <p className="text-sm mt-2">Try adjusting your filters</p>
    </div>
    );
  }   

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("timestamp")}
                >
                  <div className="flex items-center gap-1.5">
                    Timestamp
                    <SortIcon field="timestamp" />
                  </div>
                </th>
                <th
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-1.5">
                    Task Name
                    <SortIcon field="title" />
                  </div>
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  System
                </th>
                <th
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("version")}
                >
                  <div className="flex items-center gap-1.5">
                    Version
                    <SortIcon field="version" />
                  </div>
                </th>
                <th
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1.5">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedEvents.map((event,idx) => (
                <tr
                  key={`${event.id}-${idx}`}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                    {event.timestamp}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-900 max-w-xs truncate">
                    {event.title.trim() || "Untitled"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">
                    {event.user || "System"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">
                    V{event.version}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap capitalize">
                    {getStatusBadge(event.status)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-xs">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Dialog */}
      <DialogModel
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        data={selectedEvent}
        excludeKeys={["id", "isExpandable", "apiDetails"]}
        customRender={{
          status: (value: string) => (
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1 capitalize">
                {getStatusBadge(value)}
              </div>
            </div>
          ),
        }}
      />
    </>
  );
};
