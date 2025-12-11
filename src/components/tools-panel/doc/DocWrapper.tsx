"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Eye, FileText, Loader2, RefreshCw } from "lucide-react";

import { trpc } from "@/app/_trpc/client";

interface SummaryResponse {
  summary: string;
  fileId: string;
  fileName: string;
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  isNew: boolean;
}

const DocWrapper = ({ fileId, isSubscribed }: { fileId: string; isSubscribed: boolean }) => {
  const router = useRouter();
  const [regenerate, setRegenerate] = useState(false);
  // error.data?.code === "NOT_FOUND"
  // Check if summary already exists for this file
  const {
    data: existingSummary,
    isLoading: isCheckingExisting,
    refetch: refetchSummary,
    error,
  } = trpc.docSummary.getDocSummaryByFileId.useQuery(
    { fileId },
    {
      retry: false,
      // Don't treat 404 as error since it's expected when no summary exists
      // onError: (error) => {
      //   // Only log non-404 errors
      //   if (!error.message.includes("not found")) {
      //     console.error("Error checking existing summary:", error);
      //   }
      // },
    }
  );

  const { mutate: generateSummary, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          regenerate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate summary");
      }

      return response.json() as Promise<SummaryResponse>;
    },
    onSuccess: (data) => {
      console.log(data);
      // Refetch to update the UI
      refetchSummary();
      // Redirect to editor with the summary ID
      router.push(`/editor/${data.id}`);
    },
    onError: (error) => {
      console.error("Error generating summary:", error);
      alert(error instanceof Error ? error.message : "Failed to generate summary");
    },
  });

  const handleGenerateSummary = () => {
    generateSummary();
  };

  const handleViewSummary = () => {
    if (existingSummary?.id) {
      router.push(`/editor/${existingSummary.id}`);
    }
  };

  // Show loading state while checking for existing summary
  if (isCheckingExisting) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // If summary exists, show different UI
  if (existingSummary) {
    return (
      <div className="p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4">Document Summary</h3>
        <div className="space-y-4">
          {/* Existing Summary Info */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Summary Already Exists</p>
                <p className="text-sm text-green-700 mt-1">
                  A summary was generated on{" "}
                  {new Date(existingSummary.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {existingSummary.updatedAt && existingSummary.updatedAt !== existingSummary.createdAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Last updated:{" "}
                    {new Date(existingSummary.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleViewSummary}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            >
              <Eye className="h-5 w-5" />
              View Summary
            </button>
            <button
              onClick={() => {
                setRegenerate(true);
                generateSummary();
              }}
              disabled={isPending}
              className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Regenerate
                </>
              )}
            </button>
          </div>

          {/* Info Text */}
          <div className="text-xs text-gray-500 text-center pt-2">
            Regenerating will create a new summary and replace the existing one.
          </div>
        </div>
      </div>
    );
  }

  // Default UI when no summary exists
  return (
    <div className="p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4">Generate Document Summary</h3>
      <div className="space-y-4">
        <div className="border rounded-lg p-4 space-y-3">
          <div className="text-sm text-gray-600 mb-3">
            Generate an AI-powered summary of your PDF document in DOCX format.
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded"
              checked={regenerate}
              onChange={(e) => setRegenerate(e.target.checked)}
              disabled={isPending}
            />
            <span className="text-sm">Regenerate if summary already exists</span>
          </label>
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={isPending}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Summary...
            </>
          ) : (
            "Generate Summary"
          )}
        </button>
      </div>
    </div>
  );
};

export default DocWrapper;
