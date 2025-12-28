"use client";

import { useContext } from "react";
import { Menu } from "lucide-react";

import { tools } from "@/lib/config/tools";
import { ToolsContext } from "./ToolsContext";

const ToolsHeader = () => {
  const { isToolsMenuOpen, setIsToolsMenuOpen, selectedTools } = useContext(ToolsContext);
  return (
    <div className="border-b p-4 flex items-center justify-between h-[80px]">
      <div>
        <h2 className="font-semibold">{tools.find((f) => f.id === selectedTools)?.name}</h2>
        <p className="text-xs text-gray-500 mt-1">{tools.find((f) => f.id === selectedTools)?.description}</p>
      </div>
      <button
        id="tools-panel-trigger"
        onClick={() => {
          console.log("hello");
          setIsToolsMenuOpen(!isToolsMenuOpen);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
        title="Change feature"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ToolsHeader;
