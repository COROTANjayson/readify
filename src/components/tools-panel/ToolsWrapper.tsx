"use client";

import { useContext } from "react";

import { trpc } from "@/app/_trpc/client";
import { FileOutput } from "@/types/file";
import ToolsContent from "./ToolsContent";
import { ToolsContext, ToolsContextProvider } from "./ToolsContext";
import ToolsHeader from "./ToolsHeader";
import ToolsSelection from "./ToolsSelection";

const ToolsWrapper = ({ file, isSubscribed }: { file: FileOutput; isSubscribed: boolean }) => {
  const { isToolsMenuOpen } = useContext(ToolsContext);

  const { data: currentFile } = trpc.file.getFileById.useQuery(
    { fileId: file.id },
    {
      initialData: file,
    }
  );

  return (
    <ToolsContextProvider fileId={file.id}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <ToolsHeader />
        <ToolsContent file={currentFile} isSubscribed={isSubscribed} />
      </div>
      {isToolsMenuOpen && <ToolsSelection />}
    </ToolsContextProvider>
  );
};
export default ToolsWrapper;
