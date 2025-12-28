import { AlertCircle, Eye, FileText, Sparkles } from "lucide-react";

import { useFileStore } from "@/app/store/fileStore";
import { IconTooltip } from "@/components/ui/icon-tooltip";

// =================== TOOLS USAGE INFO ===================
export type ToolKey = "chat" | "summarize" | "insight" | "presentation";

const TOOL_CONFIG: Record<ToolKey, { label: string; icon: any }> = {
  chat: { label: "Chats", icon: FileText },
  summarize: { label: "Summaries", icon: Sparkles },
  insight: { label: "Insights", icon: Eye },
  presentation: { label: "Presentations", icon: FileText },
};

const ToolsUsageInfo = ({ type }: { type: ToolKey }) => {
  const currentFile = useFileStore((state) => state.currentFile);
  const canDo = useFileStore((state) => {
    switch (type) {
      case "chat":
        return state.canChat?.() ?? true;
      case "summarize":
        return state.canSummarize?.() ?? true;
      case "insight":
        return state.canInsight?.() ?? true;
      case "presentation":
        return state.canPresentation?.() ?? true;
    }
  });

  if (!currentFile) return null;

  const countKey = `${type}Count` as keyof typeof currentFile;
  const limitKey = `${type}Limit` as keyof typeof currentFile;
  const count = currentFile[countKey] as number;
  const limit = currentFile[limitKey] as number;

  return (
    <div className="inline-flex  flex-col items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-1.5">
        {!canDo && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
            <IconTooltip icon={<AlertCircle className="h-4 w-4" />} label="You have reached the limit" />
          </span>
        )}
        <span className="text-xs font-medium text-gray-600">
          {count} / {limit}
        </span>
        <span className="text-xs text-gray-500">{TOOL_CONFIG[type].label}</span>
      </div>
    </div>
  );
};

export default ToolsUsageInfo;
