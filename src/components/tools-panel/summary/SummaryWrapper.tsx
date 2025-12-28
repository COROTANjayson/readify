"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Eye, FileText, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import { useFileStore } from "@/app/store/fileStore";
import { Button } from "@/components/ui/button";
import ToolSectionHeader from "../toolsContent/ToolSectionHeader";
import ToolsSectionWrapper from "../toolsContent/ToolsSectionWrapper";

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
  const router = useRouter();
  const [regenerate, setRegenerate] = useState(false);
  const utils = trpc.useUtils();
  const { canSummarize } = useFileStore();

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
      refetchSummary();
      utils.file.getFileById.invalidate({ fileId });
      router.push(`/editor/${data.id}`);
    },

    onError: (error) => {
      console.error("Error generating summary:", error);
      alert(error instanceof Error ? error.message : "Failed to generate summary");
    },
  });

  // Loading state
  if (isCheckingExisting) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">Checking for existing summary...</p>
      </div>
    );
  }

  return (
    <ToolsSectionWrapper>
      <ToolSectionHeader
        title="Generate Summary"
        description="Create an AI-powered summary of your document"
        toolType="summarize"
      />

      <div className="space-y-5">
        {existingSummary ? (
          <>
            <div className="relative overflow-hidden rounded-md border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-500 shadow-sm">
                  <FileText className="h-6 w-6 text-background" />
                </div>

                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-emerald-900">Summary Generated Successfully</p>
                  <p className="text-sm text-emerald-700">
                    Created{" "}
                    {new Date(existingSummary.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button onClick={() => router.push(`/editor/${existingSummary.id}`)} className="gap-2 px-4 py-6">
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
                className="gap-2 px-4 py-6"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : !canSummarize() ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    Limit Reached
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Info */}
            <div className="rounded-md border bg-primary-foreground p-5">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-primary/70">
                  Generate a concise, AI-powered summary that captures the key points and main ideas of your document.
                </p>
              </div>
            </div>

            {/* Generate */}
            <Button
              onClick={() => generateSummary()}
              disabled={isPending || !canSummarize()}
              className="w-full gap-2 py-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Summary...
                </>
              ) : !canSummarize() ? (
                <>
                  <AlertCircle className="h-5 w-5" />
                  Summary Limit Reached
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Summary
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </ToolsSectionWrapper>
  );
};
export default SummaryWrapper;
