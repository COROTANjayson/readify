import React from "react";
import { Calendar, Loader2, Trash2 } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { FileOutput } from "@/types/file";
import { Button } from "../ui/button";

// FileCard Component
interface FileCardProps {
  file: FileOutput;
  onDelete: (fileId: string) => void;
  isDeleting: boolean;
  onFileClick: (fileId: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onDelete, isDeleting, onFileClick }) => {
  const totalActions = file.chatCount + file.summarizeCount + file.insightCount + file.presentationCount;

  return (
    <div className="group relative bg-white rounded-md border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      <button onClick={() => onFileClick(file.id)} className="w-full p-5 text-left">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-2xl shadow-md">
            📄
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate mb-1 group-hover:text-primary transition-colors">
              {file.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(new Date(file.createdAt))}</span>
            </div>
          </div>
        </div>
      </button>
      <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">{totalActions}</span> total actions
        </div>
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file.id);
          }}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:text-destructive hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
