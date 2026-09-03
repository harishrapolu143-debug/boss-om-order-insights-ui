import React, { useState } from "react";
import { Eye, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import PayloadViewerModal from "./PayloadViewerModal";

interface CompactPayloadViewerProps {
  payload: Record<string, any>;
  title?: string;
  defaultExpandDepth?: number;
  icon?: React.ReactNode;
}

export const CompactPayloadViewer: React.FC<CompactPayloadViewerProps> = ({
  payload,
  title = "Payload",
  defaultExpandDepth = 4,
  icon,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const payloadString = JSON.stringify(payload, null, 2);
  const payloadLines = payloadString.split("\n");
  const previewLines = payloadLines.slice(0, 5).join("\n");
  const hasMore = payloadLines.length > 5;

  const handleCopy = () => {
    navigator.clipboard.writeText(payloadString);
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

  const renderValue = (
    value: any,
    key: string,
    depth: number = 0,
  ): React.ReactNode => {
    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof value === "boolean") {
      return <span className="text-purple-600">{value.toString()}</span>;
    }

    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>;
    }

    if (typeof value === "string") {
      return <span className="text-green-600">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      // const isExpanded = expandedKeys.has(key) || depth < defaultExpandDepth; // ✅ updated
      const isExpanded = true;
      return (
        <div>
          {/* <button
            onClick={() => toggleExpand(key)}
            className="inline-flex items-center text-gray-700 hover:bg-gray-100 rounded px-1"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <span className="ml-1">[{value.length}]</span>
          </button> */}
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

    if (typeof value === "object") {
      // const isExpanded = expandedKeys.has(key) || depth < defaultExpandDepth; // ✅ updated
      const isExpanded = true;
      const keys = Object.keys(value);
      return (
        <div>
          {/* <button
            onClick={() => toggleExpand(key)}
            className="inline-flex items-center text-gray-700 hover:bg-gray-100 rounded px-1"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <span className="ml-1">{`{${keys.length}}`}</span>
          </button> */}
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

  return (
    <>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 inline-flex gap-2 items-center">
            {icon}
            {title}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2 text-xs"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-6 px-2 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              View Payload
            </Button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-gray-300">
          <pre className="whitespace-pre-wrap">{previewLines}</pre>
          {hasMore && (
            <div className="text-gray-500 mt-1">
              ... {payloadLines.length - 5} more lines
            </div>
          )}
        </div>
      </div>

      <PayloadViewerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        payload={payload}
        title={title}
        subTitle={title}
      />
    </>
  );
};
