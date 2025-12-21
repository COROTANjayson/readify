"use client";

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
import { BulletedListPlugin, ListPlugin, NumberedListPlugin } from "@platejs/list-classic/react";
import htmlDocx from "html-docx-js/dist/html-docx";
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

// Separate component that receives the loaded data
export function PlateEditor({
  initialValue,
  onValueChange,
}: {
  initialValue: string | Value;
  onValueChange?: (value: string | Value) => void;
}) {
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
    ],
    value: initialValue,
  });

  const exportToDocx = async () => {
    const html = await serializeHtml(editor);
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
    <Plate
      onChange={async () => {
        const html = await serializeHtml(editor);
        onValueChange?.(html);
      }}
      editor={editor}
    >
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
