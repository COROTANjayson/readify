"use client";

import React, { useEffect, useMemo } from "react";
import { BasicBlocksPlugin, BoldPlugin, ItalicPlugin } from "@platejs/basic-nodes/react";
import { createPlateEditor, Editable, Plate } from "platejs/react";

export default function DocxEditor() {
  const editor = useMemo(
    () =>
      createPlateEditor({
        plugins: [BasicBlocksPlugin, BoldPlugin, ItalicPlugin],
      }),
    []
  );

  useEffect(() => {
    const loadDocx = async () => {
      const res = await fetch("/sample.docx");
      const arrayBuffer = await res.arrayBuffer();

      const mammoth = await import("mammoth");
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      const html = htmlResult.value;

      // Deserialize HTML → Plate nodes
      const nodes = editor.api.html.deserialize({ element: html });

      // Wrap top-level text nodes in paragraphs
      const normalized = nodes.map((node) => ("text" in node ? { type: "p", children: [node] } : node));

      editor.children = normalized;

      // Trigger internal re-render
      (editor.onChange as () => void)();
    };

    loadDocx();
  }, [editor]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">DOCX Editor (Plate v52)</h1>

      {/* ✅ Use Editable from PlateJS v52 */}
      <Plate editor={editor}>
        <Editable placeholder="Start typing..." />
      </Plate>
    </div>
  );
}
