"use client";

import * as React from "react";
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

import { BlockquoteElement } from "@/components/ui/blockquote-node";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { H1Element, H2Element, H3Element } from "@/components/ui/heading-node";
import {
  BulletedListElement,
  ListItemElement,
  NumberedListElement,
  TaskListElement,
} from "@/components/ui/list-classic-node";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { ToolbarButton } from "@/components/ui/toolbar";
import { ListKit } from "../list-classic-kit";

// Convert HTML to Plate format with proper list and formatting support
function htmlToPlateValue(html: string): Value {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const result: Value = [];

  // Normalize text nodes with formatting
  function normalizeChildren(children: any[]): any[] {
    if (!Array.isArray(children) || children.length === 0) {
      return [{ text: "" }];
    }

    const normalized = children.flat().filter((child) => child != null);

    if (normalized.length === 0) {
      return [{ text: "" }];
    }

    // Ensure all children have text property
    return normalized.map((child) => {
      if (typeof child === "string") {
        return { text: child };
      }
      if (child && typeof child === "object" && !child.text && !child.type) {
        return { text: "" };
      }
      return child;
    });
  }

  function processNode(node: Node, marks: any = {}): any {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      return text ? { text, ...marks } : null;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      let children: any[] = [];
      node.childNodes.forEach((child) => {
        const processed = processNode(child, marks);
        if (processed !== null) {
          if (Array.isArray(processed)) {
            children.push(...processed);
          } else {
            children.push(processed);
          }
        }
      });

      // Handle inline formatting - pass marks down
      if (tagName === "strong" || tagName === "b") {
        return node.childNodes.length > 0
          ? Array.from(node.childNodes)
              .map((child) => processNode(child, { ...marks, bold: true }))
              .filter(Boolean)
          : null;
      }
      if (tagName === "em" || tagName === "i") {
        return node.childNodes.length > 0
          ? Array.from(node.childNodes)
              .map((child) => processNode(child, { ...marks, italic: true }))
              .filter(Boolean)
          : null;
      }
      if (tagName === "u") {
        return node.childNodes.length > 0
          ? Array.from(node.childNodes)
              .map((child) => processNode(child, { ...marks, underline: true }))
              .filter(Boolean)
          : null;
      }

      // Handle span (just pass through children)
      if (tagName === "span") {
        return children.length > 0 ? children : null;
      }

      // Handle block elements
      if (tagName === "h1") {
        return { type: "h1", children: normalizeChildren(children) };
      }
      if (tagName === "h2") {
        return { type: "h2", children: normalizeChildren(children) };
      }
      if (tagName === "h3") {
        return { type: "h3", children: normalizeChildren(children) };
      }
      if (tagName === "blockquote") {
        return { type: "blockquote", children: normalizeChildren(children) };
      }
      // Handle br - convert to newline character
      if (tagName === "br") {
        return { text: "\n" };
      }
      if (tagName === "p") {
        return { type: "p", children: normalizeChildren(children) };
      }

      // Handle lists - preserve actual list structure
      if (tagName === "ul") {
        const listItems: any[] = [];
        Array.from(element.children).forEach((child) => {
          if (child.tagName.toLowerCase() === "li") {
            const liChildren: any[] = [];

            child.childNodes.forEach((node) => {
              const processed = processNode(node, marks);
              if (processed !== null) {
                if (Array.isArray(processed)) {
                  liChildren.push(...processed);
                } else {
                  liChildren.push(processed);
                }
              }
            });

            listItems.push({
              type: "li",
              children: normalizeChildren(liChildren),
            });
          }
        });
        return {
          type: "ul",
          children: listItems.length > 0 ? listItems : [{ type: "li", children: [{ text: "" }] }],
        };
      }

      if (tagName === "ol") {
        const listItems: any[] = [];
        Array.from(element.children).forEach((child) => {
          if (child.tagName.toLowerCase() === "li") {
            const liChildren: any[] = [];

            child.childNodes.forEach((node) => {
              const processed = processNode(node, marks);
              if (processed !== null) {
                if (Array.isArray(processed)) {
                  liChildren.push(...processed);
                } else {
                  liChildren.push(processed);
                }
              }
            });

            listItems.push({
              type: "li",
              children: normalizeChildren(liChildren),
            });
          }
        });
        return {
          type: "ol",
          children: listItems.length > 0 ? listItems : [{ type: "li", children: [{ text: "" }] }],
        };
      }

      // For other block elements, return as paragraph
      if (children.length > 0) {
        return { type: "p", children: normalizeChildren(children) };
      }

      return null;
    }

    return null;
  }

  doc.body.childNodes.forEach((node) => {
    const processed = processNode(node);
    if (processed !== null) {
      if (Array.isArray(processed)) {
        result.push(...processed.filter((item) => item && item.type));
      } else if (processed && processed.type) {
        result.push(processed);
      }
    }
  });

  // Ensure we always return at least one paragraph
  return result.length > 0 ? result : [{ type: "p", children: [{ text: "" }] }];
}

export default function MyEditorPage() {
  const [loadedValue, setLoadedValue] = React.useState<Value | null>(null);

  // Load DOCX on mount
  React.useEffect(() => {
    async function loadDocx() {
      try {
        const response = await fetch("/sample-3.docx");
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }

        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const plateValue = htmlToPlateValue(result.value);
        console.log(result);
        console.log("Loaded value:", plateValue);
        setLoadedValue(plateValue);
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
function EditorWithData({ initialValue }: { initialValue: Value }) {
  const editor = usePlateEditor({
    plugins: [
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
      </FixedToolbar>
      <EditorContainer>
        <Editor placeholder="Type your amazing content here..." />
      </EditorContainer>
    </Plate>
  );
}
