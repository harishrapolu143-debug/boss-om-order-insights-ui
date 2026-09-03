import React, { useEffect, useMemo, useState } from "react";
import { Search, Bell, ChevronDown, Clock, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu/dropdown-menu";
import { BrightspeedLogo } from "./BrightspeedLogo";
import { UserAvatar } from "./UserAvatar";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

interface HeaderProps {
  onSearch: (orderId: string) => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, isLoading }) => {
  const orderId = useAppSelector((state) => state.order.orderId);
  const user = useAppSelector((state) => state.auth.user);
  const [searchValue, setSearchValue] = useState(orderId);
  const dispatch = useAppDispatch();

  const recentSearches: string[] = [];

  const handleSearch = () => {
    if (searchValue) {
      onSearch(searchValue);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [searchValue]);

  const emailToName = (email?: string): string => {
    if (!email) return "";

    const username = email.split("@")[0];

    const parts = username.split(/[.\-_]/).filter(Boolean);

    const cleaned =
      parts.length > 1 && parts[parts.length - 1].length === 1
        ? parts.slice(0, -1)
        : parts;

    return cleaned
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const userName = useMemo(() => {
    return user && typeof user.email === "string"
      ? emailToName(user.email)
      : user?.name;
  }, [user]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Product Name */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <BrightspeedLogo width={32} height={32} />
              <h1 className="font-semibold text-gray-900">Order Tracker</h1>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="relative"
              >
                {isLoading ? (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin align-middle"></span>
                ) : (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}

                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value.toUpperCase().trim())}
                  placeholder="Search Order ID (ex: NC4100400228)"
                  className="pl-10 pr-10 py-2 w-[28rem] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
                {/*
                {searchValue && (
                  <DropdownMenu open={showRecent} onOpenChange={setShowRecent}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                  </DropdownMenu>
                )}
                  */}
              </form>

              {/* Recent Searches Dropdown */}
              {/* {showRecent && recentSearches.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      Recent Searches
                    </div>
                    {recentSearches.map((orderId) => (
                      <button
                        key={orderId}
                        onClick={() => handleRecentSearch(orderId)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        {orderId}
                      </button>
                    ))}
                  </div>
                </div>
              )}
                */}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            {/* <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button> */}

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <UserAvatar name={userName || ""} imageUrl="n/a" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {userName}
                </span>
                {/* <span className="text-xs text-gray-500">{user?.email}</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
