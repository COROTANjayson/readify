"use client";

import React, { useContext, useEffect, useState } from "react";
import { X } from "lucide-react";

import { tools } from "@/lib/config/tools";
import { ToolsContext } from "./ToolsContext";

const ToolButton = ({ tool, selectedTools, onSelect }: any) => (
  <button
    onClick={() => onSelect(tool.id)}
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
);

const DesktopContent = ({ onClose, selectedTools, handleToolsSelect }: any) => (
  <>
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-semibold">Select Tools</h2>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
        <X className="w-5 h-5" />
      </button>
    </div>

    <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
      {tools.map((tool) => (
        <ToolButton key={tool.id} tool={tool} selectedTools={selectedTools} onSelect={handleToolsSelect} />
      ))}
    </div>
  </>
);

const MobileContent = ({ onClose, selectedTools, handleToolsSelect }: any) => (
  <>
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-semibold">Tools</h2>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
        <X className="w-5 h-5" />
      </button>
    </div>

    <div className="p-4 space-y-2 overflow-y-auto h-full">
      {tools.map((tool) => (
        <ToolButton key={tool.id} tool={tool} selectedTools={selectedTools} onSelect={handleToolsSelect} />
      ))}
    </div>
  </>
);

const ToolsSelection: React.FC = () => {
  const { isToolsMenuOpen, setIsToolsMenuOpen, selectedTools, handleToolsSelect } = useContext(ToolsContext);

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isToolsMenuOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isToolsMenuOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* DESKTOP PANEL (slides from right) */}
      <div
        className={`
          hidden md:block fixed right-0 top-14 bottom-0 w-80 bg-white border-l shadow-2xl z-50
          ${isToolsMenuOpen ? "animate-slide-in" : "animate-slide-out"}
        `}
      >
        <DesktopContent
          onClose={() => setIsToolsMenuOpen(false)}
          selectedTools={selectedTools}
          handleToolsSelect={handleToolsSelect}
        />
      </div>

      {/* MOBILE PANEL (slides from bottom) */}
      <div
        className={`
          md:hidden fixed left-0 right-0 bottom-0 h-[60vh] bg-white shadow-2xl z-50 rounded-t-2xl
          ${isToolsMenuOpen ? "animate-slide-up" : "animate-slide-down"}
        `}
      >
        <MobileContent
          onClose={() => setIsToolsMenuOpen(false)}
          selectedTools={selectedTools}
          handleToolsSelect={handleToolsSelect}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        /* Desktop Animations */
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

        /* Mobile Animations */
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes slide-down {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-in forwards;
        }
      `}</style>
    </>
  );
};

export default ToolsSelection;
