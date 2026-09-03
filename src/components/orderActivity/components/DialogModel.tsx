import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { CompactPayloadViewer } from "./CompactPayloadViewer";
import { Badge } from "./ui/badge";
import { Check, Code } from "lucide-react";

type Primitive = string | number | boolean | null | undefined;

type GenericObject = {
  [key: string]: any;
};

type CustomRenderFn<T = any> = (value: T, data: GenericObject) => React.ReactNode;

interface DynamicDialogProps {
  open: boolean;
  onClose: () => void;
  data: GenericObject | null;
  excludeKeys?: string[];
  customRender?: Record<string, CustomRenderFn>;
}

const isPrimitive = (val: unknown): val is Primitive => {
  return ["string", "number", "boolean"].includes(typeof val) || val == null;
};

const DialogModel: React.FC<DynamicDialogProps> = ({
  open,
  onClose,
  data,
  excludeKeys = [],
  customRender = {},
}) => {
  if (!data) return null;

  const getColumns = (
    arr: Record<string, any>[],
    excludeColumns: string[] = []
  ): string[] => {
    return Array.from(
      new Set(
        arr.flatMap((item) =>
          Object.keys(item).filter(
            (key) => !excludeColumns.includes(key)
          )
        )
      )
    );
  };

  const restRequestContent = useMemo(() => {
    if (!data.apiDetails) return null;
    return (
      <div className="pt-3 col-span-2">
        <p className="text-xs font-medium text-gray-700 mb-2">API Reference</p>
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-3 space-y-3">
          {/* API Endpoint */}
          <div className="flex gap-2 items-center">
            <Badge className="bg-indigo-600 text-white border-indigo-700 text-xs font-mono flex-shrink-0">
              {data.apiDetails.method}
            </Badge>
            <code className="text-xs bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-900 flex-1 break-all">
              {data.apiDetails.url}
            </code>
          </div>

          {/* Request */}
          <div className="grid grid-cols-1 gap-4">
            <CompactPayloadViewer
              payload={data.apiDetails.request}
              title="Request"
              icon={<Code className="w-3 h-3" />}
            />
            <CompactPayloadViewer
              payload={data.apiDetails.response}
              title="Response"
              icon={<Check className="w-3 h-3" />}
            />
          </div>
        </div>
      </div>
    );
  }, [data]);

  const notesContent = useMemo(() => {
      let tableRowcontent = [];
      let jsonContent = [];
  
      if (data?.note) {
        for (const key in data.note) {
          if (!Object.hasOwn(data.note, key)) continue;
          const value = data.note[key];
          if (value && typeof value === "object") {
            jsonContent.push(
              <div key={key} className="col-span-2"><CompactPayloadViewer
                payload={value}
                title={key?.toUpperCase()}
                key={key}
              /></div>,
            );
          } else {
            tableRowcontent.push(
              <tr key={key} className="hover:bg-gray-100 transition-colors">
                <td className="px-3 py-2 font-medium text-gray-900">{key}</td>
                <td className="px-3 py-2 text-gray-600">{value || ""}</td>
              </tr>,
            );
          }
        }
      }
  
      if (tableRowcontent.length === 0 && jsonContent.length === 0) return null;
  
      return (
        <>
          {tableRowcontent.length > 0 && (
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 mt-2 col-span-2">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">
                      Field
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tableRowcontent}
                </tbody>
              </table>
            </div>
          )}
          {jsonContent}
        </>
      );
    }, [data]);

  const renderTable = (key: string, arr: GenericObject[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;

    const columns = getColumns(arr, ["id"]);

    return (
      <div key={key} className="col-span-2 border-t pt-4 mt-4 border-gray-300">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 capitalize">
          Field Changes
        </h4>

        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-2 font-medium capitalize"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {arr.map((row, i) => (
                <tr key={i} className="bg-white hover:bg-gray-50 border-gray-200">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2 text-gray-900">
                      {row[col] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

   const renderField = (key: string, value: unknown): React.ReactNode => {
    if (excludeKeys.includes(key)) return null;

    if (customRender[key]) {
      return (
        <div key={key}>
          {customRender[key](value, data)}
        </div>
      );
    }

    if (Array.isArray(value) || key === 'note') {
      return renderTable(key, value as GenericObject[]);
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div key={key} className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2 capitalize">
            {key}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(value).map(([childKey, childValue]) =>
              renderField(childKey, childValue)
            )}
          </div>
        </div>
      );
    }

    // ✅ Primitive → Label
    if (isPrimitive(value)) {
      return (
        <div key={key}>
          <p className="text-sm text-gray-500 capitalize">{key}</p>
          <p className="text-sm text-gray-900">{value || "-"}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-3xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{data.title.trim() || "Untitled"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {Object.entries(data).map(([key, value]) =>
            renderField(key, value)
          )}
          {notesContent}
          {restRequestContent}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogModel;