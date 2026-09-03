'use client';

import React, { useState } from "react";

interface PreviewPayloadBtnProps {
    value: unknown;
    id?: string | number;
    title?: string;
}

const normalizeValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";

    let result: any = value;

    try {
        while (typeof result === "string") {
            result = JSON.parse(result);
        }
    } catch {
        return String(value);
    }

    return typeof result === "object"
        ? JSON.stringify(result, null, 2)
        : String(result);
};

export const PreviewPayloadBtn: React.FC<PreviewPayloadBtnProps> = ({
    value,
    id,
    title = "Payload"
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(normalizeValue(value));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.error("Clipboard copy failed");
        }
    };

    return (
        <table className="w-full table-fixed text-sm border-collapse">
            <tbody>
                <tr>
                    <td className="py-1 text-gray-700 w-full">
                        <pre className="bg-white border flex-1 font-mono leading-relaxed max-h-64 max-w-full overflow-auto p-4 ring-1 ring-gray-300 rounded-lg text-[12px] text-gray-900 whitespace-pre-wrap break-all">
                            <code>{normalizeValue(value)}</code>
                        </pre>
                    </td>
                </tr>
            </tbody>
        </table>
);
};
