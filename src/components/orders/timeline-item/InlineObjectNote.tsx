import React, { memo } from "react";
import {
  isComplexValue,
  normalizeValue,
} from "@/lib/utils/helpers";

interface InlineObjectNoteProps {
  note: Record<string, unknown>;
}

const InlineObjectNote: React.FC<InlineObjectNoteProps> = ({ note }) => {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
      <table className="w-full table-fixed border-collapse text-sm">
        <tbody>
          {Object.entries(note).map(([key, value]) => {
            const isComplex = isComplexValue(value);
            return (
              <tr key={key} className="align-top">
                <td className="w-2/5 sm:w-1/3 pr-3 py-1 font-semibold text-gray-600 wrap-break-word">
                  {key}
                </td>
                <td className="py-1 text-gray-700">
                  {isComplex ? (
                    <pre className="max-h-64 max-w-full overflow-x-auto overflow-y-auto rounded-lg border bg-white p-3 text-[11px] sm:text-[12px] font-mono whitespace-pre-wrap break-all">
                      <code>{normalizeValue(value)}</code>
                    </pre>
                  ) : (
                    <span className="wrap-break-word">{String(value)}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default memo(InlineObjectNote);
