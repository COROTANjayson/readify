import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

// Element types
export type ParagraphElement = {
  type: "paragraph";
  children: Descendant[];
};

export type HeadingElement = {
  type: "heading";
  level: number;
  children: Descendant[];
};

export type ListItemElement = {
  type: "list-item";
  children: Descendant[];
};

export type BulletedListElement = {
  type: "bulleted-list";
  children: Descendant[];
};

export type NumberedListElement = {
  type: "numbered-list";
  children: Descendant[];
};

// Text node type
export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

// Slate CustomTypes
declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: ParagraphElement | HeadingElement | ListItemElement | BulletedListElement | NumberedListElement;
    Text: CustomText;
  }
}
