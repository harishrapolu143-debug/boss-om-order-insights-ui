import React from 'react';
import { List, LayoutGrid } from 'lucide-react';

interface ViewSwitcherProps {
  currentView: 'timeline' | 'table';
  onViewChange: (view: 'timeline' | 'table') => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5">
      <button
        onClick={() => onViewChange('timeline')}
        className={`
          p-2 rounded-md transition-all
          ${currentView === 'timeline' 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }
        `}
        title="Timeline View"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`
          p-2 rounded-md transition-all
          ${currentView === 'table' 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }
        `}
        title="Table View"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  );
};
