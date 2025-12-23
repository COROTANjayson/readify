"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Eye, FileText, Loader2, RefreshCw } from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import { useFileStore } from "@/app/store/fileStore";
import { Button } from "@/components/ui/button";
import ToolsUsageInfo from "../ToolsUsageInfo";

interface SummaryResponse {
  summary: string;
  fileId: string;
  fileName: string;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  isNew: boolean;
}

const SummaryWrapper = ({ fileId, isSubscribed }: { fileId: string; isSubscribed: boolean }) => {
  console.log(isSubscribed);
  const router = useRouter();
  const [regenerate, setRegenerate] = useState(false);
  const utils = trpc.useUtils();
  const { canSummarize } = useFileStore();

  // Check if summary already exists
  const {
    data: existingSummary,
    isLoading: isCheckingExisting,
    refetch: refetchSummary,
  } = trpc.docSummary.getDocSummaryByFileId.useQuery({ fileId }, { retry: false });

  const { mutate: generateSummary, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, regenerate }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate summary");
      }

      return response.json() as Promise<SummaryResponse>;
    },

    onSuccess: (data) => {
      // increment("summarizeCount"); // ✅ update usage
      refetchSummary();
      utils.file.getFileById.invalidate({ fileId });
      router.push(`/editor/${data.id}`);
    },

    onError: (error) => {
      console.error("Error generating summary:", error);
      alert(error instanceof Error ? error.message : "Failed to generate summary");
    },
  });

  if (isCheckingExisting) {
    return (
      <div className="p-6 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // ================= EXISTING SUMMARY =================
  if (existingSummary) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Document Summary</h3>
          <ToolsUsageInfo type="summarize" />
        </div>

        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="font-medium text-green-900">Summary Already Exists</p>
              <p className="text-sm text-green-700">
                Created on {new Date(existingSummary.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button onClick={() => router.push(`/editor/${existingSummary.id}`)}>
            <Eye className="h-4 w-4" />
            View Summary
          </Button>

          <Button
            variant="outline"
            disabled={isPending || !canSummarize()}
            onClick={() => {
              setRegenerate(true);
              generateSummary();
            }}
          >
            {!canSummarize() ? "Limit reached" : isPending ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>
      </div>
    );
  }

  // ================= NO SUMMARY =================
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Generate Document Summary</h3>
        <ToolsUsageInfo type="summarize" />
      </div>
      <div className="border rounded-lg p-4 space-y-3">
        <p className="text-sm text-gray-600">Generate an AI-powered summary of your PDF document.</p>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={regenerate}
            onChange={(e) => setRegenerate(e.target.checked)}
            disabled={isPending}
          />
          Regenerate if summary already exists
        </label>
      </div>

      <button
        onClick={() => generateSummary()}
        disabled={isPending || !canSummarize()}
        className="w-full bg-blue-500 text-white py-3 rounded-lg
          hover:bg-blue-600 transition
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Generating Summary..." : !canSummarize() ? "Summary limit reached" : "Generate Summary"}
      </button>
    </div>
  );
};

export default SummaryWrapper;
