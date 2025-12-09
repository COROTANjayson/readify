"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";
import type { Value } from "platejs";

import { trpc } from "@/app/_trpc/client";
import { StateDisplay } from "../StateDisplay";
import { PlateEditor } from "./PlateEditor";

export default function MyEditorPage({ doc_id }: { doc_id: string }) {
  const params = useParams();
  const summaryId = params.doc_id as string;
  const [currentValue, setCurrentValue] = useState<string | Value | null>(null);
  const {
    data: summary,
    isLoading,
    error,
  } = trpc.docSummary.getDocSummary.useQuery(
    {
      id: doc_id,
    },
    {
      enabled: !!doc_id,
    }
  );

  // Update document summary
  const { mutate: updateSummary, isPending: isUpdating } = trpc.docSummary.updateDocSummary.useMutation({
    onSuccess: () => {
      // Show success toast or notification
      console.log("Summary updated successfully");
    },
    onError: (error) => {
      console.error("Error updating summary:", error);
      alert("Failed to update summary");
    },
  });

  // Delete document summary
  const { mutate: deleteSummary, isPending: isDeleting } = trpc.docSummary.deleteDocSummary.useMutation({
    onSuccess: () => {
      console.log("Summary deleted successfully");
      // router.push("/files"); // Redirect after deletion
    },
    onError: (error) => {
      console.error("Error deleting summary:", error);
      alert("Failed to delete summary");
    },
  });

  // Handler functions (you'll wire these to your UI)
  const handleSave = () => {
    if (!currentValue || !summaryId) return;

    updateSummary({
      id: summaryId,
      summary: typeof currentValue === "string" ? currentValue : JSON.stringify(currentValue),
    });
  };

  const handleDelete = () => {
    if (!summaryId) return;

    const confirmed = confirm("Are you sure you want to delete this summary?");
    if (confirmed) {
      deleteSummary({ id: summaryId });
    }
  };

  // Update currentValue when editor content changes
  const handleEditorChange = (newValue: string | Value) => {
    setCurrentValue(newValue);
  };
  const [loadedValue, setLoadedValue] = useState<string | Value | null>(null);
  return (
    <main className="mx-auto max-w-7xl md:p-10">
      {isLoading && <StateDisplay state="loading" message="Loading document..." />}
      {error && (
        <StateDisplay
          state={error.data?.code === "NOT_FOUND" ? "notFound" : "error"}
          message={error.message}
          backLabel="Back to Files"
        />
      )}
      {!isLoading && !error && summary && (
        <>
          <div className="">
            <div className="bg-white border-b sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="text-gray-600 hover:text-gray-800">Back</button>
                  <h1 className="text-lg font-semibold text-gray-800">{summary.File?.name || "Document Summary"}</h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="">
                <PlateEditor initialValue={summary.summary} />
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
