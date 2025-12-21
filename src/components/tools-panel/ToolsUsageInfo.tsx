import { useFileStore } from "@/app/store/fileStore";

type ToolKey = "chat" | "summarize" | "insight" | "presentation";

const TOOL_LABELS: Record<ToolKey, string> = {
  chat: "Chats used",
  summarize: "Summaries used",
  insight: "Insights used",
  presentation: "Presentations used",
};

const ToolsUsageInfo = ({ type }: { type: ToolKey }) => {
  const currentFile = useFileStore((state) => state.currentFile);
  const canDo = useFileStore((state) => {
    switch (type) {
      case "chat":
        return state.canChat();
      case "summarize":
        return state.canSummarize();
      case "insight":
        return state.canInsight();
      case "presentation":
        return state.canPresentation();
    }
  });

  if (!currentFile) return null;

  // Dynamically get counts and limits
  const countKey = `${type}Count` as keyof typeof currentFile;
  const limitKey = `${type}Limit` as keyof typeof currentFile;

  return (
    <div className="text-xs text-gray-600 flex justify-between items-center mb-2">
      <span>
        {TOOL_LABELS[type]}:{" "}
        <strong>
          {currentFile[countKey]} / {currentFile[limitKey]}
        </strong>
      </span>
      {!canDo && <span className="text-red-500 font-medium">Limit reached</span>}
    </div>
  );
};

export default ToolsUsageInfo;
