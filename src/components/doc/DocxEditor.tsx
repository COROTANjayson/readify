"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createEditor, Descendant, Node } from "slate";
import { Editable, Slate, withReact } from "slate-react";

// Make sure you have defined your custom types in types/slate.d.ts as before

export default function DocxEditorPage() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Descendant[]>([
    { type: "paragraph", children: [{ text: "Loading document..." }] },
  ]);
  const [loading, setLoading] = useState(false);

  const filename = "sample.docx"; // place this in /public

  useEffect(() => {
    const loadDocx = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/${filename}`);
        if (!res.ok) throw new Error("Failed to fetch DOCX");
        const arrayBuffer = await res.arrayBuffer();

        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer });

        const text = result.value?.trim() || "No text extracted.";

        // Prepare new Slate value
        const newValue: Descendant[] = [{ type: "paragraph", children: [{ text }] }];

        // Update editor manually
        (editor.children as Node[]) = newValue;
        editor.onChange();
        setValue(newValue);
      } catch (err) {
        console.error(err);
        const errorValue: Descendant[] = [{ type: "paragraph", children: [{ text: "Error loading document." }] }];
        (editor.children as Node[]) = errorValue;
        editor.onChange();
        setValue(errorValue);
      } finally {
        setLoading(false);
      }
    };

    loadDocx();
  }, [editor, filename]);

  const handleSave = useCallback(() => {
    const text = value.map((node: any) => node.children?.map((c: any) => c.text).join("") ?? "").join("\n\n");

    const blob = new Blob([text], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "edited-document.doc";
    a.click();
    URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple DOCX Editor</h1>

      <p className="text-sm text-gray-600 mb-2">
        Source: <code className="text-blue-600">/public/{filename}</code>
      </p>

      {/* EDITOR CONTAINER */}
      <div className="border rounded-xl bg-white shadow-sm p-4 min-h-[300px]">
        <Slate editor={editor} initialValue={value} onValueChange={(v) => setValue(v)}>
          <Editable
            placeholder={loading ? "Loading..." : "Start typing..."}
            className="min-h-[220px] p-2 focus:outline-none"
          />
        </Slate>
      </div>

      {/* BUTTONS */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          Save as .doc
        </button>

        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-gray-100 border hover:bg-gray-200"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
