import type { Value } from "platejs";

// Convert HTML to Plate format with proper list and formatting support
export function htmlToPlateValue(html: string): Value {
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

      const children: any[] = [];
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
