import React from "react";
import {
  Filter,
  AlertTriangle,
  MessageSquare,
  StickyNote,
  Flag,
  Network,
  Truck,
  Zap,
  Radio,
  Receipt,
  Phone,
  Cpu,
  FileCheck,
  LucideIcon,
  Bell,
  RefreshCcw,
  Mail,
  ShieldCheck,
  Users,
  MessagesSquare,
  FolderKanban,
  Briefcase,
  Fingerprint,
  Router,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select/select";
import { Switch } from "./ui/switch/switch";
import { Label } from "./ui/label/label";
import { ViewSwitcher } from "./ViewSwitcher";
import { MultiSelect } from "./ui/multi-select/multi-select";
import { Button } from "../components/ui/button/button";
import { resetOnRefresh } from "@/lib/redux/slices/orderSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

interface FilterBarProps {
  logTypeFilter: string[];
  versionFilter: string;
  currentView: "timeline" | "table";
  onLogTypeChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onViewChange: (view: "timeline" | "table") => void;
  versionFilterOptions: { key: string; label: string }[];
  isLoading?: boolean;
  disabled?: boolean;
  isFromBossOm?: boolean;
  onRefresh?: () => void;
}

export const logTypeConfig: Record<
  string,
  { label: string; icon: LucideIcon; filterBy: string }
> = {
  userRemarks: {
    label: "User Activity",
    icon: MessageSquare,
    filterBy: "nodeType",
  },
  remarks: {
    label: "System Activity",
    icon: StickyNote,
    filterBy: "nodeType",
  },
  caseActivity: {
    label: "Case Activity",
    icon: FolderKanban,
    filterBy: "nodeType",
  },
  boss_dispatch: {
    label: "Dispatch Notification",
    icon: Bell,
    filterBy: "category",
  },
  interfaceLogs: {
    label: "Interface Log",
    icon: Network,
    filterBy: "nodeType",
  },
  brim: {
    label: "BRIM",
    icon: Receipt,
    filterBy: "category",
  },
  o2: {
    label: "O2",
    icon: Radio,
    filterBy: "category",
  },
  email: {
    label: "Email",
    icon: Mail,
    filterBy: "category",
  },
  bsw: {
    label: "BSW",
    icon: Zap,
    filterBy: "category",
  },
  neustar: {
    label: "Neustar",
    icon: ShieldCheck,
    filterBy: "category",
  },
  ivr: {
    label: "IVR",
    icon: Phone,
    filterBy: "nodeType",
  },
  CustomerInteraction: {
    label: "Customer Interactions",
    icon: Users,
    filterBy: "category",
  },
  contact_engine: {
    label: "Contact Engine",
    icon: Cpu,
    filterBy: "nodeType",
  },
  acs: {
    label: "ACS",
    icon: Fingerprint,
    filterBy: "category",
  },
  ont: {
    label: "ONT",
    icon: Router,
    filterBy: "category",
  },
};

export const FilterBar: React.FC<FilterBarProps> = ({
  logTypeFilter,
  versionFilter,
  currentView,
  onLogTypeChange,
  onVersionChange,
  onViewChange,
  versionFilterOptions,
  isLoading,
  disabled,
  isFromBossOm = false,
}) => {
  const { orderTimelineData, bossOMPage } = useAppSelector((state) => state.order);
  
  return (
    <div
      className={`bg-white px-6 py-3`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Log Type Multi-Select Filter */}
          <div className="flex flex-col gap-1">
            <MultiSelect
              options={Object.keys(logTypeConfig).map((value) => {
                const Icon = logTypeConfig[value].icon;
                return {
                  value,
                  label: logTypeConfig[value].label,
                  icon: <Icon className="w-4 h-4" />,
                };
              })}
              selected={logTypeFilter}
              onChange={onLogTypeChange}
              placeholder="Log Type"
              className="w-52"
              contentWidth="300px"
              disabled={disabled}
            />
          </div>

          {/* Version Filter */}
          <Select
            value={versionFilter}
            onValueChange={onVersionChange}
            disabled={isLoading || disabled}
          >
            <SelectTrigger className="w-52" isLoading={isLoading}>
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent>
              {versionFilterOptions.map(({ key, label }) => (
                <SelectItem value={key} key={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Errors Only Toggle */}
          {/* <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
            <Switch
              id="errors-only"
              checked={showErrorsOnly}
              onCheckedChange={onToggleErrors}
            />
            <Label
              htmlFor="errors-only"
              className="text-sm font-medium text-red-800 cursor-pointer flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Errors Only
            </Label>
          </div> */}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">

          {/* View Switcher */}
          {/* <div className="ml-2 pl-2 border-l border-gray-300">
            <ViewSwitcher
              currentView={currentView}
              onViewChange={onViewChange}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};