"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// import { useRouter } from "next/router";
import {
  BlockquotePlugin,
  BoldPlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import {
  BulletedListPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
  TaskListPlugin,
} from "@platejs/list-classic/react";
import { Loader2, Save, Trash2 } from "lucide-react";
import * as mammoth from "mammoth";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { serializeHtml } from "platejs/static";

import { trpc } from "@/app/_trpc/client";
import { BlockquoteElement } from "@/components/ui/blockquote-node";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { H1Element, H2Element, H3Element } from "@/components/ui/heading-node";
import { BulletedListElement, NumberedListElement } from "@/components/ui/list-classic-node";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { ToolbarButton } from "@/components/ui/toolbar";
import { htmlToPlateValue } from "@/lib/docx";

// import htmlDocx from "html-docx-js/dist/html-docx";

// export default function MyEditorPage() {
//   // const [loadedValue, setLoadedValue] = useState<Value | null>(null);
//   const [loadedValue, setLoadedValue] = useState<string | Value | null>(null);

//   // Load DOCX on mount
//   useEffect(() => {
//     async function loadDocx() {
//       try {
//         const response = await fetch("/sample-3.docx");
//         if (!response.ok) {
//           throw new Error("Failed to fetch document");
//         }

//         const arrayBuffer = await response.arrayBuffer();
//         const result = await mammoth.convertToHtml({ arrayBuffer });
//         const plateValue = htmlToPlateValue(result.value);

//         console.log("result", result.value);
//         console.log("Loaded value:", plateValue);
//         setLoadedValue(result.value);
//       } catch (error) {
//         console.error("Error loading DOCX:", error);
//         setLoadedValue([
//           {
//             type: "p",
//             children: [{ text: "Error loading document." }],
//           },
//         ]);
//       }
//     }

//     loadDocx();
//   }, []);

//   // Show loading state
//   if (!loadedValue) {
//     return <div className="p-8">Loading document...</div>;
//   }

//   // Only render editor after data is loaded
//   return <EditorWithData initialValue={loadedValue} />;
// }

export default function MyEditorPage({ doc_id }: { doc_id: string }) {
  const params = useParams();
  // const router = useRouter();
  const summaryId = params.doc_id as string;

  const [loadedValue, setLoadedValue] = useState<string | Value | null>(null);
  const [currentValue, setCurrentValue] = useState<string | Value | null>(null);

  // Fetch document summary
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
      // onSuccess: (data) => {
      //   setLoadedValue(data.summary);
      //   setCurrentValue(data.summary);
      // },
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Document</h2>
          <p className="text-gray-600">{error.message}</p>
          <button
            // onClick={() => router.push("/files")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Files
          </button>
        </div>
      </div>
    );
  }
console.log(summary)
  // No data found
  if (!summary ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Document Not Found</h2>
          <button
            // onClick={() => router.push("/files")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Files
          </button>
        </div>
      </div>
    );
  }

  // Render editor with toolbar
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
            // onClick={() => router.push("/files")} 
            
            className="text-gray-600 hover:text-gray-800">
              ← Back
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{summary.File?.name || "Document Summary"}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Button */}
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

            {/* Delete Button */}
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
      </div>

      {/* Editor */}
      <div className="max-w-7xl mx-auto p-8">
        <EditorWithData
          initialValue={summary.summary}
          // onChange={handleEditorChange}
        />
      </div>
    </div>
  );
}

// Separate component that receives the loaded data
function EditorWithData({ initialValue }: { initialValue: string | Value }) {
  const editor = usePlateEditor({
    plugins: [
      // BasicNodesPlugin,
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      H1Plugin.withComponent(H1Element),
      H2Plugin.withComponent(H2Element),
      H3Plugin.withComponent(H3Element),
      BlockquotePlugin.withComponent(BlockquoteElement),
      ListPlugin,
      BulletedListPlugin.configure({
        node: { component: BulletedListElement },
        shortcuts: { toggle: { keys: "mod+alt+5" } },
      }),
      NumberedListPlugin.configure({
        node: { component: NumberedListElement },
        shortcuts: { toggle: { keys: "mod+alt+6" } },
      }),
      // ListKit,
    ],
    value: initialValue,
  });
  // useEffect(()=>{

  // })
  // Convert Plate value -> HTML -> DOCX -> Download
  const exportToDocx = async () => {
    // const html = editor.getHtml(); // Plate built-in HTML serializer
    const html = await serializeHtml(editor);
    console.log(html);
    // const docxBlob = htmlDocx.asBlob(html, {
    //   orientation: "portrait",
    // });

    // const url = window.URL.createObjectURL(docxBlob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "document.docx";
    // a.click();
    // window.URL.revokeObjectURL(url);
  };

  return (
    <Plate editor={editor}>
      <FixedToolbar className="flex justify-start gap-1 rounded-t-lg">
        <ToolbarButton onClick={() => editor.tf.h1.toggle()}>H1</ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.h2.toggle()}>H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.h3.toggle()}>H3</ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.blockquote.toggle()}>Quote</ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.ul.toggle()}>• List</ToolbarButton>
        <ToolbarButton onClick={() => editor.tf.ol.toggle()}>1. List</ToolbarButton>
        <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
          B
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
          I
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
          U
        </MarkToolbarButton>
        <ToolbarButton onClick={exportToDocx}>Export</ToolbarButton>
      </FixedToolbar>
      <EditorContainer>
        <Editor placeholder="Type your amazing content here..." />
      </EditorContainer>
    </Plate>
  );
}
