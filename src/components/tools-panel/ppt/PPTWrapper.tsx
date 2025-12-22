"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, FileText, Loader2, Trash2 } from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import { useFileStore } from "@/app/store/fileStore";
import ToolsUsageInfo from "../ToolsUsageInfo";

const PPTWrapper = ({ fileId, isSubscribed }: { fileId: string; isSubscribed: boolean }) => {
  const [slideCount, setSlideCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { canPresentation } = useFileStore();

  const utils = trpc.useUtils();

  // Query for existing presentation (only one per file)
  const { data: presentation, isLoading } = trpc.presentation.getPresentation.useQuery({ fileId });
  // if (presentation?.content) console.log("presentation", presentation.pptxData);
  // Delete mutation
  const deleteMutation = trpc.presentation.deletePresentation.useMutation({
    onSuccess: () => {
      utils.presentation.getPresentation.invalidate({ fileId });
    },
  });

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch("/api/ppt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          slideCount,
          regenerate: !!presentation, // Set to true if presentation exists
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate presentation");
      }

      const data = await response.json();

      // Refresh the presentation
      utils.presentation.getPresentation.invalidate({ fileId });
      utils.file.getFileById.invalidate({ fileId });
      // Auto-download if new presentation
      if (data.isNew && data.downloadUrl) {
        window.location.href = data.downloadUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (downloadUrl: string) => {
    window.location.href = downloadUrl;
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this presentation?")) {
      deleteMutation.mutate({ id });
    }
  };

  const hasPresentation = !!presentation;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Generation Section */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold mb-4">
            {hasPresentation ? "Regenerate Presentation" : "Create Presentation"}
          </h3>
          <ToolsUsageInfo type="presentation" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Number of slides</label>
            <input
              type="number"
              min={3}
              max={isSubscribed ? 20 : 10}
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500">
              {isSubscribed ? "Pro users can create up to 20 slides" : "Free users can create up to 10 slides"}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {hasPresentation && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                A presentation already exists for this document. Clicking generate will replace it with a new one.
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !canPresentation()}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {hasPresentation ? "Regenerating..." : "Generating Presentation..."}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                {hasPresentation ? "Regenerate Presentation" : "Generate Presentation"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Presentation */}
      {presentation && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Current Presentation</h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{presentation.fileName}</p>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-500">{presentation.slideCount} slides</p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(presentation.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(presentation.downloadUrl)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(presentation.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  title="Delete"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PPTWrapper;
