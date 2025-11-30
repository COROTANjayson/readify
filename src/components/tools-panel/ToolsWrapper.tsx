"use client";

import { useContext } from "react";
import { Menu } from "lucide-react";

import { tools } from "@/lib/config/tools";
import ToolsContent from "./ToolsContent";
import { ToolsContext, ToolsContextProvider } from "./ToolsContext";
import ToolsHeader from "./ToolsHeader";
import ToolsSelection from "./ToolsSelection";

const ToolsWrapper = ({ fileId, isSubscribed }: { fileId: string; isSubscribed: boolean }) => {
  const { isToolsMenuOpen } = useContext(ToolsContext);
  return (
    <ToolsContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <ToolsHeader />
        <ToolsContent fileId={fileId} isSubscribed={isSubscribed} />
      </div>
      {isToolsMenuOpen && <ToolsSelection />}
    </ToolsContextProvider>
  );
};

export default ToolsWrapper;
