"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import type { Value } from "platejs";
import { trpc } from "@/app/_trpc/client";
import { StateDisplay } from "../StateDisplay";
import { EditorHeader } from "./EditorHeader";
import { PlateEditor } from "./PlateEditor";

// Main Component
export default function MyEditorPage({ doc_id }: { doc_id: string }) {
  const params = useParams();
  const summaryId = (params.doc_id as string) || doc_id;
  const [currentValue, setCurrentValue] = useState<string | Value | null>(null);

  // Queries and Mutations
  const {
    data: summary,
    isLoading,
    error,
  } = trpc.docSummary.getDocSummary.useQuery({ id: doc_id }, { enabled: !!doc_id });

  const { mutate: updateSummary, isPending: isUpdating } = trpc.docSummary.updateDocSummary.useMutation({
    onSuccess: () => console.log("Summary updated successfully"),
    onError: (error) => {
      console.error("Error updating summary:", error);
      alert("Failed to update summary");
    },
  });

  const { mutate: deleteSummary, isPending: isDeleting } = trpc.docSummary.deleteDocSummary.useMutation({
    onSuccess: () => console.log("Summary deleted successfully"),
    onError: (error) => {
      console.error("Error deleting summary:", error);
      alert("Failed to delete summary");
    },
  });

  // Handlers
  const handleSave = () => {

    if (!currentValue || !summaryId) return;

    updateSummary({
      id: summaryId,
      summary: typeof currentValue === "string" ? currentValue : JSON.stringify(currentValue),
    });
  };

  const handleDelete = () => {
    if (!summaryId) return;

    if (confirm("Are you sure you want to delete this summary?")) {
      deleteSummary({ id: summaryId });
    }
  };

  // Loading and Error States
  if (isLoading) {
    return <StateDisplay state="loading" message="Loading document..." />;
  }

  if (error) {
    return (
      <StateDisplay
        state={error.data?.code === "NOT_FOUND" ? "notFound" : "error"}
        message={error.message}
        backLabel="Back to Files"
      />
    );
  }

  if (!summary) return null;

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      <EditorHeader
        fileName={summary.File?.name || "Document Summary"}
        onSave={handleSave}
        onDelete={handleDelete}
        isSaving={isUpdating}
        isDeleting={isDeleting}
      />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <PlateEditor initialValue={summary.summary} onValueChange={setCurrentValue} />
        </div>
      </main>
    </div>
  );
}
