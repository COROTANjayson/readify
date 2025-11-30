"use client";

import React, { useContext, useEffect, useState } from "react";
import { X } from "lucide-react";

import { tools } from "@/lib/config/tools";
import { ToolsContext } from "./ToolsContext";

const ToolsSelection: React.FC = () => {
  const { isToolsMenuOpen, setIsToolsMenuOpen, selectedTools, handleToolsSelect } = useContext(ToolsContext);

  // ⬅ keep panel mounted for animation
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isToolsMenuOpen) {
      setShouldRender(true); // mount instantly
    } else {
      // unmount *after* animation ends
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isToolsMenuOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`
        hidden md:block fixed right-0 top-14 bottom-0 w-80 bg-white border-l shadow-2xl z-50
        ${isToolsMenuOpen ? "animate-slide-in" : "animate-slide-out"}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Select Tools</h2>

        <button onClick={() => setIsToolsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolsSelect(tool.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left 
              ${
                selectedTools === tool.id
                  ? "bg-blue-50 text-blue-600 border-2 border-blue-500"
                  : "text-gray-700 hover:bg-gray-50 border-2 border-transparent"
              }
            `}
          >
            {tool.icon}
            <div className="flex-1">
              <div className="text-sm font-medium">{tool.name}</div>
              <div className="text-xs text-gray-500">{tool.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slide-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }

        .animate-slide-out {
          animation: slide-out 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default ToolsSelection;
