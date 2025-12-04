"use client";

import { useEffect, useState } from "react";
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
import * as mammoth from "mammoth";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { serializeHtml } from "platejs/static";

import { BlockquoteElement } from "@/components/ui/blockquote-node";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { H1Element, H2Element, H3Element } from "@/components/ui/heading-node";
import { BulletedListElement, NumberedListElement } from "@/components/ui/list-classic-node";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { ToolbarButton } from "@/components/ui/toolbar";
import { htmlToPlateValue } from "@/lib/docx";
import htmlDocx from "html-docx-js/dist/html-docx";

export default function MyEditorPage() {
  // const [loadedValue, setLoadedValue] = useState<Value | null>(null);
  const [loadedValue, setLoadedValue] = useState<string | Value | null>(null);

  // Load DOCX on mount
  useEffect(() => {
    async function loadDocx() {
      try {
        const response = await fetch("/sample-3.docx");
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }

        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const plateValue = htmlToPlateValue(result.value);

        console.log("result", result.value);
        console.log("Loaded value:", plateValue);
        setLoadedValue(result.value);
      } catch (error) {
        console.error("Error loading DOCX:", error);
        setLoadedValue([
          {
            type: "p",
            children: [{ text: "Error loading document." }],
          },
        ]);
      }
    }

    loadDocx();
  }, []);

  // Show loading state
  if (!loadedValue) {
    return <div className="p-8">Loading document...</div>;
  }

  // Only render editor after data is loaded
  return <EditorWithData initialValue={loadedValue} />;
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
    const docxBlob = htmlDocx.asBlob(html, {
      orientation: "portrait",
    });

    const url = window.URL.createObjectURL(docxBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.docx";
    a.click();
    window.URL.revokeObjectURL(url);
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
