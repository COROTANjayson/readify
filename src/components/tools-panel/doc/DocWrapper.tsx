"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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
      // Redirect to editor with the summary ID
      console.log(data)
      // router.push(`/files/editor/${data.id}`);
    },
    onError: (error) => {
      console.error("Error generating summary:", error);
      // You can add toast notification here
      alert(error instanceof Error ? error.message : "Failed to generate summary");
    },
  });

  const handleGenerateSummary = () => {
    generateSummary();
  };

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
