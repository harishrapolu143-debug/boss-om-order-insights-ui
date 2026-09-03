import React, { useState } from 'react';
import { Copy, Maximize2, Check, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface PayloadViewerProps {
  payload: Record<string, any>;
  title?: string;
}

export const PayloadViewer: React.FC<PayloadViewerProps> = ({ payload, title = 'Payload' }) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const renderValue = (value: any, key: string, depth: number = 0): React.ReactNode => {
    const indent = depth * 20;
    
    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-purple-600">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      const isExpanded = expandedKeys.has(key);
      return (
        <div>
          <button
            onClick={() => toggleExpand(key)}
            className="inline-flex items-center text-gray-700 hover:bg-gray-100 rounded px-1"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span className="ml-1">[{value.length}]</span>
          </button>
          {isExpanded && (
            <div className="ml-4 border-l border-gray-300 pl-2 mt-1">
              {value.map((item, index) => (
                <div key={`${key}-${index}`} className="py-1">
                  <span className="text-gray-500">{index}: </span>
                  {renderValue(item, `${key}-${index}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const isExpanded = expandedKeys.has(key);
      const keys = Object.keys(value);
      return (
        <div>
          <button
            onClick={() => toggleExpand(key)}
            className="inline-flex items-center text-gray-700 hover:bg-gray-100 rounded px-1"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span className="ml-1">{`{${keys.length}}`}</span>
          </button>
          {isExpanded && (
            <div className="ml-4 border-l border-gray-300 pl-2 mt-1">
              {keys.map((k) => (
                <div key={`${key}-${k}`} className="py-1">
                  <span className="text-blue-700">"{k}"</span>
                  <span className="text-gray-500">: </span>
                  {renderValue(value[k], `${key}-${k}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  const PayloadContent = ({ fullScreen = false }: { fullScreen?: boolean }) => (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span className="ml-1 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
          {!fullScreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-7 px-2"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="ml-1 text-xs">Expand</span>
            </Button>
          )}
        </div>
      </div>
      <div className={`bg-gray-900 rounded-lg p-4 overflow-auto font-mono text-sm ${fullScreen ? 'max-h-[70vh]' : 'max-h-64'}`}>
        <div className="text-gray-300">
          {Object.keys(payload).map((key) => (
            <div key={key} className="py-1">
              <span className="text-blue-400">"{key}"</span>
              <span className="text-gray-500">: </span>
              {renderValue(payload[key], key)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PayloadContent />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <PayloadContent fullScreen />
        </DialogContent>
      </Dialog>
    </>
  );
};
