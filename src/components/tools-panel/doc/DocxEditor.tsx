"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createEditor, Descendant, Editor, Node } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";

import { htmlToSlate } from "@/lib/htmlToSlate";

type Mark = "bold" | "italic" | "underline";

export default function DocxEditorPage() {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>([
    { type: "paragraph", children: [{ text: "Loading document..." }] },
  ]);
  const [loading, setLoading] = useState(false);

  const filename = "sample-3.docx";

  useEffect(() => {
    const loadDocx = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/${filename}`);
        if (!res.ok) throw new Error("Failed to fetch DOCX");
        const arrayBuffer = await res.arrayBuffer();

        const mammoth = await import("mammoth");
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const nodes = htmlToSlate(result.value);

        (editor.children as Node[]) = nodes;
        editor.onChange();
        setValue(nodes);
        console.log("nodes", nodes)

        console.log("result", result.value)

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

  const isMarkActive = (editor: Editor, format: Mark) => {
    const marks = Editor.marks(editor);
    return marks ? (marks[format] as boolean) === true : false;
  };

  const toggleMark = (editor: Editor, format: Mark) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) Editor.removeMark(editor, format);
    else Editor.addMark(editor, format, true);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">DOCX Editor with Formatting</h1>
      <div className="flex gap-2 mb-2 flex-wrap">
        {(["bold", "italic", "underline"] as Mark[]).map((mark) => (
          <button
            key={mark}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark(editor, mark);
            }}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            {mark.charAt(0).toUpperCase() + mark.slice(1)}
          </button>
        ))}
        <button onClick={() => editor.undo()} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">
          Undo
        </button>
        <button onClick={() => editor.redo()} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">
          Redo
        </button>
      </div>

      <div className="border rounded-xl bg-white shadow-sm p-4 min-h-[300px]">
        <Slate editor={editor} initialValue={value} onChange={(newValue) => setValue(newValue)}>
          <Editable
            placeholder={loading ? "Loading..." : "Start typing..."}
            className="min-h-[220px] p-2 focus:outline-none"
            renderLeaf={({ attributes, children, leaf }) => {
              if (leaf.bold) children = <strong>{children}</strong>;
              if (leaf.italic) children = <em>{children}</em>;
              if (leaf.underline) children = <u>{children}</u>;
              return <span {...attributes}>{children}</span>;
            }}
            renderElement={({ attributes, children, element }) => {
              switch ((element as any).type) {
                case "heading":
                  return <h2 {...attributes}>{children}</h2>;
                case "bulleted-list":
                  return <ul {...attributes}>{children}</ul>;
                case "numbered-list":
                  return <ol {...attributes}>{children}</ol>;
                case "list-item":
                  return <li {...attributes}>{children}</li>;
                default:
                  return <p {...attributes}>{children}</p>;
              }
            }}
          />
        </Slate>
      </div>

      <div className="mt-4 flex gap-3 flex-wrap">
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
