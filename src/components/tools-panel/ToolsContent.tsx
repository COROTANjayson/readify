"use client";

import { useContext, useEffect } from "react";

import { useFileStore } from "@/app/store/fileStore";
import { FileOutput } from "@/types/file";
import ChatWrapper from "./chat/ChatWrapper";
import InsightWrapper from "./insight/InsightWrapper";
import PPTWrapper from "./ppt/PPTWrapper";
import SummaryWrapper from "./summary/SummaryWrapper";
import { ToolsContext } from "./ToolsContext";

const ToolsContent = ({ file, isSubscribed }: { file: FileOutput; isSubscribed: boolean }) => {
  const setFile = useFileStore((state) => state.setFile);

  useEffect(() => {
    console.log("file updated in tools content");
    setFile(file);
  }, [file, setFile]);

  const { selectedTools } = useContext(ToolsContext);

  const renderFeatureContent = () => {
    switch (selectedTools) {
      case "chat":
        return <ChatWrapper fileId={file.id} isSubscribed={isSubscribed} />;
      case "summarize":
        return <SummaryWrapper fileId={file.id} isSubscribed={isSubscribed} />;
      case "ppt":
        return <PPTWrapper fileId={file.id} isSubscribed={isSubscribed} />;
      case "insights":
        return <InsightWrapper fileId={file.id} isSubscribed={isSubscribed} />;

      default:
        return null;
    }
  };

  return <div className="flex-1 overflow-y-auto">{renderFeatureContent()}</div>;
};

export default ToolsContent;
