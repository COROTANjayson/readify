"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  InfoIcon,
  Loader2,
  Presentation,
  Sparkles,
  Trash2,
} from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import { useFileStore } from "@/app/store/fileStore";
import { Button } from "@/components/ui/button";
import { IconTooltip } from "@/components/ui/icon-tooltip";
import { formatDate } from "@/lib/utils";
import ToolSectionHeader from "../toolsContent/ToolSectionHeader";
import ToolsSectionWrapper from "../toolsContent/ToolsSectionWrapper";

interface PresentationResponse {
  id: string;
  fileName: string;
  downloadUrl: string;
  isNew: boolean;
  slideCount: number;
}

const PPTWrapper = ({ fileId, isSubscribed }: { fileId: string; isSubscribed: boolean }) => {
  const [slideCount, setSlideCount] = useState(5);
  const { canPresentation } = useFileStore();
  const utils = trpc.useUtils();

  const { data: presentation, isLoading } = trpc.presentation.getPresentation.useQuery({ fileId });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ppt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          slideCount,
          regenerate: !!presentation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate presentation");
      }

      return response.json() as Promise<PresentationResponse>;
    },
    onSuccess: (data) => {
      utils.presentation.getPresentation.invalidate({ fileId });
      utils.file.getFileById.invalidate({ fileId });

      if (data.isNew && data.downloadUrl) {
        window.location.href = data.downloadUrl;
      }
    },
  });

  const deleteMutation = trpc.presentation.deletePresentation.useMutation({
    onSuccess: () => {
      utils.presentation.getPresentation.invalidate({ fileId });
    },
  });

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
    <ToolsSectionWrapper>
      <div className="space-y-5">
        <ToolSectionHeader
          title="Presentation"
          description="Generate a PowerPoint presentation from your document"
          toolType="presentation"
        />
        {presentation && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 rounded-md border border-gray-200 bg-gray-50">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-md border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-500 shadow-sm">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{presentation.fileName}fsdfsdsd</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {presentation.slideCount} slides
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(new Date(presentation.createdAt))}</span>
                    </div>
                    <div className="flex items-center justify-end flex-shrink-0">
                      <Button
                        variant="ghost"
                        onClick={() => handleDownload(presentation.downloadUrl)}
                        className="justify-center hover:bg-transparent text-primary hover:text-primary"
                        title="Download"
                      >
                        <Download className="h-4 w-4 " />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(presentation.id)}
                        disabled={deleteMutation.isPending}
                        className=" rounded-lg  text-destructive hover:text-destructive disabled:opacity-50 hover:bg-transparent"
                        title="Delete"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Configuration Card */}
        <div className="rounded-md border border-gray-200 bg-card  p-5 space-y-4">
          <div className="flex gap-3">
            <div className="space-y-4 flex-1">
              {/* Slide Count Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    Number of slides
                  </span>
                  <span className="text-xs font-normal text-gray-600">
                    {slideCount} {slideCount === 1 ? "slide" : "slides"}
                  </span>
                </label>

                <input
                  type="number"
                  min={3}
                  max={isSubscribed ? 20 : 10}
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={generateMutation.isPending}
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>3 slides</span>
                  <span className="flex items-center gap-1">
                    <IconTooltip
                      icon={<InfoIcon className="h-4 w-4" />}
                      label={
                        isSubscribed
                          ? "Pro users can create up to 20 slides per presentation"
                          : "Free users can create up to 10 slides. Upgrade to Pro for up to 20 slides"
                      }
                    />
                    {isSubscribed ? "20" : "10"} slides max
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {generateMutation.isError && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Generation Failed</p>
              <p className="text-sm text-red-700 mt-1">
                {generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : "An error occurred while generating the presentation"}
              </p>
            </div>
          </div>
        )}

        {hasPresentation && canPresentation() && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">Replace Existing Presentation</p>
              <p className="text-sm text-yellow-700 mt-1">
                A presentation already exists for this document. Generating a new one will replace the current version.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !canPresentation()}
            className="w-full  gap-2 px-6 py-6 rounded-md  text-white font-semibold disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {hasPresentation ? "Regenerating Presentation..." : "Generating Presentation..."}
              </>
            ) : !canPresentation() ? (
              <>
                <AlertCircle className="h-5 w-5" />
                Presentation Limit Reached
              </>
            ) : (
              <>
                <Presentation className="h-5 w-5" />
                {hasPresentation ? "Regenerate Presentation" : "Generate Presentation"}
              </>
            )}
          </Button>
        </div>
      </div>
    </ToolsSectionWrapper>
  );
};

export default PPTWrapper;
