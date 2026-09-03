'use client';

import React, { useState, useRef, useCallback } from 'react';
import { User, LogOut } from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectAuth } from '@/lib/redux/slices/authSlice';
import { signOut } from '@/lib/auth/msalInstance';
import { getInitials } from '@/lib/utils/helpers';
import useClickOutside from '@/lib/hooks/useClickOutside';
import useEscapeKey from '@/lib/hooks/useEscapeKey';

const ProfilePopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector(selectAuth);

  const closePopover = useCallback(() => setIsOpen(false), []);

  useClickOutside(popoverRef, isOpen, closePopover);
  useEscapeKey(isOpen, closePopover);

  const handleLogout = () => {
    try {
      closePopover();
      signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleToggle = () => {
    try {
      setIsOpen((prev) => !prev);
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={handleToggle}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
        aria-label="User profile"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user?.name ? (
          <span className="text-sm font-semibold text-white">
            {getInitials(user.name)}
          </span>
        ) : (
          <User className="h-5 w-5 text-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-xl border border-gray-200 bg-gray-200 shadow-2xl">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-3">
            <div className="flex h-8 w-8 text-white p-2 items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2">
              {user?.name ? getInitials(user.name) : <User className="h-5 w-5" />}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user?.name || 'User'}
              </p>
              <p
                className="truncate text-xs text-gray-500"
                title={user?.email}
              >
                {user?.email || 'No email'}
              </p>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4 text-gray-500" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePopover;
