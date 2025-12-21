"use client";

import { useContext, useEffect } from "react";

import { useFileStore } from "@/app/store/fileStore";
import { FileOutput } from "@/types/file";
import ToolsContent from "./ToolsContent";
import { ToolsContext, ToolsContextProvider } from "./ToolsContext";
import ToolsHeader from "./ToolsHeader";
import ToolsSelection from "./ToolsSelection";

const ToolsWrapper = ({ file, isSubscribed }: { file: FileOutput; isSubscribed: boolean }) => {
  const { isToolsMenuOpen } = useContext(ToolsContext);
  const setFile = useFileStore((state) => state.setFile);

  useEffect(() => {
    setFile(file);
  }, [file, setFile]);

  return (
    <ToolsContextProvider fileId={file.id}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <ToolsHeader />
        <ToolsContent fileId={file.id} isSubscribed={isSubscribed} />
      </div>
      {isToolsMenuOpen && <ToolsSelection />}
    </ToolsContextProvider>
  );
};
export default ToolsWrapper;
