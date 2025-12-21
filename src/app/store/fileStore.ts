import { create } from "zustand";

import { FileOutput } from "@/types/file";

type IncrementKey = "chatCount" | "summarizeCount" | "insightCount" | "presentationCount";

type FileStore = {
  currentFile: FileOutput | null;

  setFile: (file: FileOutput) => void;
  clearFile: () => void;

  increment: (key: IncrementKey) => void;

  canChat: () => boolean;
  canSummarize: () => boolean;
  canInsight: () => boolean;
  canPresentation: () => boolean;
};

export const useFileStore = create<FileStore>((set, get) => ({
  currentFile: null,

  setFile: (file) => set({ currentFile: file }),

  clearFile: () => set({ currentFile: null }),

  increment: (key) =>
    set((state) =>
      state.currentFile
        ? {
            currentFile: {
              ...state.currentFile,
              [key]: state.currentFile[key] + 1,
            },
          }
        : state
    ),

  canChat: () => {
    const f = get().currentFile;
    return !!f && f.chatCount < f.chatLimit;
  },

  canSummarize: () => {
    const f = get().currentFile;
    return !!f && f.summarizeCount < f.summarizeLimit;
  },

  canInsight: () => {
    const f = get().currentFile;
    return !!f && f.insightCount < f.insightLimit;
  },

  canPresentation: () => {
    const f = get().currentFile;
    return !!f && f.presentationCount < f.presentationLimit;
  },
}));
