import React from 'react';
import { Layers } from 'lucide-react';

interface VersionSwitcherProps {
  selectedVersion: string;
  onVersionChange: (version: string) => void;
  versions: string[];
}

export const VersionSwitcher: React.FC<VersionSwitcherProps> = ({
  selectedVersion,
  onVersionChange,
  versions,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Layers className="w-4 h-4" />
          <span className="font-medium">Version:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVersionChange('consolidated')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedVersion === 'consolidated'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Consolidated View
          </button>
          
          {versions.map((version) => (
            <button
              key={version}
              onClick={() => onVersionChange(version)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedVersion === version
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {version}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
