import React, { useEffect, useState } from "react";
import {
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Groq } from "groq-sdk";
import ReactMarkdown from "react-markdown";

interface AIInsightPanelProps {
  timelineData: any[];
}

export type Summary = {
  generatedAt: string;
  result: string;
};

const groq = new Groq({
  apiKey: "",
  dangerouslyAllowBrowser: true,
});

function transformData(data: any[]) {
  return data.map((item) => {
    const time = new Date(item.timestamp).toLocaleString();

    if (item.notesType === "interfaceLogs") {
      const task = item.title || "Task";
      const error = item.apiDetails?.errorMessage;

      if (typeof error === "string" && error.trim() !== "") {
        return `${time} - ${task} [FAILED]: ${error}`;
      }

      return `${time} - ${task} [EXECUTED]`;
    }

    if (item.notesType === "userRemarks" || item.notesType === "remarks") {
      const title = item.title || "Untitle";
      const isError =
        item?.status === "fallout" &&
        !item?.errorMessage?.toLowerCase().includes("success");
      return `${time} - ${title} ${isError ? "[FAILED]: This task may cause unintended fallout" : "[EXECUTED]"}`;
    }

    return `${time} - Event occurred`;
  });
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  timelineData,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<Summary>({
    generatedAt: "",
    result: "",
  });

  const colors = {
    gradient: "from-blue-50 via-indigo-50 to-purple-50",
    border: "border-blue-200/60",
    glow: "shadow-blue-100/50",
  };

  const currentTime = new Date(summary.generatedAt).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  );

  const fetchOrderSummary = async () => {
    setIsRefreshing(true);
    const events = transformData(timelineData).slice(-25);

    const prompt = `
You are a senior telecom operations analyst.

Your task is to analyze an order execution timeline and produce a clear, concise business summary.

### Instructions:
- Write ONLY 3-4 lines
- Focus on:
  - Failures (if any)
  - Retries (if any)
  - Overall execution flow
  - Final status
- Do NOT list events
- Do NOT repeat information
- Avoid technical noise
- Keep it human-readable and professional

### Output Format (STRICT JSON):
{
  "summary": "<formatted summary>"
}

### Formatting Rules:
- Use Markdown
- Highlight key points using **bold**
- Keep sentences clean and non-repetitive
- Do NOT include special symbols or unnecessary punctuation

### Timeline:
${events.join("\n")}
`.trim();

    const generatedAt = new Date().toISOString();
    const chatCompletion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    });

    const raw = chatCompletion.choices[0]?.message?.content || "";

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { summary: raw };
    }

    setSummary({
      generatedAt,
      result: parsed.summary,
    });

    setIsRefreshing(false);
  };

  useEffect(() => {
    if (timelineData.length > 0 && !summary.result) {
      fetchOrderSummary();
    }
  }, [timelineData, summary]);

  if (!summary || (summary && !summary.result)) return null;

  return (
    <div className="mb-6">
      <div
        className={`
          relative overflow-hidden
          bg-gradient-to-br ${colors.gradient}
          border-2 ${colors.border}
          rounded-xl shadow-lg ${colors.glow}
          transition-all duration-300
        `}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.15) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* AI Icon with shimmer */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-md opacity-30 animate-pulse" />
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    AI Insight
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 bg-white/80 text-indigo-700 border-indigo-200"
                  >
                    Auto-generated
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span>Generated at {currentTime}</span>
                  {/* <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {insights.confidence}% confidence
                  </span> */}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchOrderSummary}
                disabled={isRefreshing}
                className="h-8 px-2.5 text-xs hover:bg-white/60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed">
            <ReactMarkdown>{summary.result}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
