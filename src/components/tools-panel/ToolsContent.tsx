"use client";

import { useContext } from "react";
import { Menu } from "lucide-react";

import { tools } from "@/lib/config/tools";
import DocWrapper from "./doc/DocWrapper";
import InsightWrapper from "./insight/InsightWrapper";
import PPTWrapper from "./ppt/PPTWrapper";
import SummaryWrapper from "./summary/SummaryWrapper";
import { ToolsContext } from "./ToolsContext";
import ChatWrapper from "./chat/ChatWrapper";

const ToolsContent = ({ fileId, isSubscribed }: { fileId: string; isSubscribed: boolean }) => {
  const { isToolsMenuOpen, setIsToolsMenuOpen, selectedTools, handleToolsSelect } = useContext(ToolsContext);

  const renderFeatureContent = () => {
    switch (selectedTools) {
      case "chat":
        return <ChatWrapper fileId={fileId} isSubscribed={isSubscribed} />;

      case "summarize":
        return <SummaryWrapper fileId={fileId} isSubscribed={isSubscribed} />;

      case "docx":
        return <DocWrapper fileId={fileId} isSubscribed={isSubscribed} />;

      case "ppt":
        return <PPTWrapper fileId={fileId} isSubscribed={isSubscribed} />;

      case "insights":
        return <InsightWrapper fileId={fileId} isSubscribed={isSubscribed} />;

      default:
        return null;
    }
  };

  return <div className="flex-1 overflow-y-auto">{renderFeatureContent()}</div>;
};

export default ToolsContent;
