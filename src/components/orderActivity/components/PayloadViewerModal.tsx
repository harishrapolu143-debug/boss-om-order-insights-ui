import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog/dialog";
import { Button } from "./ui/button/button";
import { Check, Copy } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  payload: Record<string, any>;
  subTitle?: string;
};

function PayloadViewerModal({
  open,
  onOpenChange,
  title,
  payload,
  subTitle,
}: Props) {
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    const payloadString = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(payloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[80vw] max-h-[80vh] w-[80vw] h-[80vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 w-full">
              <span className="text-sm font-medium text-gray-700">
                {subTitle}
              </span>
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
                <span className="ml-1 text-xs">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </Button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto font-mono text-sm flex-1">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PayloadViewerModal;
