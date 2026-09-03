'use client';

import React, { useState, useEffect, memo } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { setOrderId } from '@/lib/redux/slices/orderSlice';
import LogoYellow from '../../../public/assets/svg/logo.svg';
import ProfilePopover from '../common/ProfilePopover';

const OrderHeader: React.FC = memo(() => {
  const dispatch = useAppDispatch();
  const orderId = useAppSelector(state => state.order.orderId);

  const [searchInput, setSearchInput] = useState(orderId);
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debouncedSearchTerm !== orderId) {
      dispatch(setOrderId(debouncedSearchTerm));
    }
  }, [debouncedSearchTerm, dispatch, orderId]);

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-12">

        <div className="flex flex-1 items-center gap-3">

          <Image
            src={LogoYellow}
            width={30}
            height={30}
            alt="Brightspeed Logo"
            priority
            className="shrink-0"
          />

          <span className="hidden sm:block text-sm md:text-lg font-bold text-gray-700 whitespace-nowrap">
            Brightspeed Order Management
          </span>

          <div className="relative ml-2 sm:ml-6 flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search className="h-4 w-4" />
            </span>

            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search Order ID"
              className="h-10 w-full rounded-xl border border-gray-300 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              aria-label="Search by Order ID"
            />
          </div>
        </div>

        <div className="ml-3 flex shrink-0 items-center">
          <ProfilePopover />
        </div>
      </div>
    </header>
  );
});

OrderHeader.displayName = 'OrderHeader';

export default OrderHeader;
