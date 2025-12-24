import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, HelpCircle, Lightbulb, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/app/_trpc/client";
import { useFileStore } from "@/app/store/fileStore";
import { Button } from "@/components/ui/button";
import ToolSectionHeader from "../toolsContent/ToolSectionHeader";
import ToolsSectionWrapper from "../toolsContent/ToolsSectionWrapper";
import ToolsUsageInfo from "../toolsContent/ToolsUsageInfo";

interface InsightWrapperProps {
  fileId: string;
  isSubscribed: boolean;
}

const InsightWrapper = ({ fileId, isSubscribed }: InsightWrapperProps) => {
  console.log(isSubscribed);
  const utils = trpc.useUtils();
  const { canInsight } = useFileStore();

  const { data: insightData, isLoading: isFetching } = trpc.docInsight.getDocInsightByFileId.useQuery(
    { fileId },
    {
      enabled: !!fileId,
      staleTime: 1000 * 60 * 5, 
      refetchOnWindowFocus: false, 
      retry: false,
    }
  );

  const generateMutation = useMutation({
    mutationFn: async (regenerate: boolean) => {
      const response = await fetch("/api/insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId, regenerate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate insight");
      }

      return response.json();
    },
    onSuccess: (data) => {
      utils.docInsight.getDocInsightByFileId.invalidate({ fileId });
      utils.file.getFileById.invalidate({ fileId });

      if (data.isNew) {
        toast.success("Insight generated successfully!");
      } else {
        toast.success("Insight regenerated successfully!");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate insight");
    },
  });

  const deleteMutation = trpc.docInsight.deleteDocInsightByFileId.useMutation({
    onSuccess: () => {
      toast.success("Insight deleted successfully!");
      utils.docInsight.getDocInsightByFileId.invalidate({ fileId });
    },
    onError: () => {
      toast.error("Failed to delete insight");
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate(false);
  };

  const handleRegenerate = () => {
    generateMutation.mutate(true);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this insight?")) {
      deleteMutation.mutate({ fileId });
    }
  };

  const isLoading = generateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const showEmptyState = !insightData && !isFetching && !isLoading;

  return (
    <ToolsSectionWrapper>
      <div className="flex items-center justify-between mb-4">
        <ToolSectionHeader
          title="Generate Insight"
          description="Analyze your document to uncover key patterns, trends, and actionable insights."
          toolType="insight"
        />
      </div>
      {insightData && (
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={handleRegenerate}
            disabled={isLoading || isDeleting}
            className="text-sm disabled:opacity-50 transition"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {isLoading ? "Regenerating..." : "Regenerate"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isLoading || isDeleting}
            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 transition"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      )}
      <div className="space-y-4">
        {!insightData && !isFetching && (
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !canInsight()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Insight...
              </>
            ) : (
              <>
                <Lightbulb className="w-5 h-5" />
                Generate Insight
              </>
            )}
          </Button>
        )}

        {isFetching && !insightData && (
          <div className="border rounded-lg p-6 bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {insightData && (
          <div className="space-y-6">
            {isLoading && (
              <div className="border rounded-lg p-4 bg-blue-50 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <p className="text-sm text-blue-700">Regenerating insight...</p>
              </div>
            )}

            <div className="border rounded-lg p-5 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-3">Deep Analysis</h4>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: insightData.insight }}
                  />
                </div>
              </div>
            </div>

            {insightData.keyFindings && insightData.keyFindings.length > 0 && (
              <div className="border rounded-lg p-5 bg-white">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Findings</h4>
                    <ul className="space-y-2">
                      {insightData.keyFindings.map((finding, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span className="text-sm text-gray-700">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {insightData.actionItems && insightData.actionItems.length > 0 && (
              <div className="border rounded-lg p-5 bg-white">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-3">Action Items</h4>
                    <ul className="space-y-2">
                      {insightData.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">→</span>
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {insightData.questions && insightData.questions.length > 0 && (
              <div className="border rounded-lg p-5 bg-white">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-3">Questions to Explore</h4>
                    <ul className="space-y-2">
                      {insightData.questions.map((question, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">?</span>
                          <span className="text-sm text-gray-700">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              Created: {new Date(insightData.createdAt).toLocaleDateString()}
              {insightData.updatedAt && <> • Updated: {new Date(insightData.updatedAt).toLocaleDateString()}</>}
            </div>
          </div>
        )}

        {showEmptyState && (
          <div className="border rounded-lg p-6 bg-gray-50 text-center">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              Click the button above to generate deep insights, patterns, and actionable intelligence from your
              document.
            </p>
          </div>
        )}
      </div>
    </ToolsSectionWrapper>
  );
};

export default InsightWrapper;
