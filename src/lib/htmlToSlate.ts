import parse from "html-react-parser";
import { Descendant } from "slate";

export function htmlToSlate(html: string): Descendant[] {
  const reactNodes = parse(html, { trim: true }) as any[];

  function traverse(elements: any[]): Descendant[] {
    const nodes: Descendant[] = [];

    elements.forEach((el: any) => {
      if (typeof el === "string") {
        if (el.trim()) {
          nodes.push({ text: el });
        }
      } else if (el?.type) {
        const childrenArray = Array.isArray(el.props.children) ? el.props.children : [el.props.children];

        const childrenNodes = traverse(childrenArray);

        // Only add a paragraph if there is text
        if (el.type === "p") {
          if (childrenNodes.length > 0) {
            nodes.push({ type: "paragraph", children: childrenNodes });
          }
        } else {
          // For other elements, wrap children
          if (childrenNodes.length > 0) {
            nodes.push({ type: el.type, children: childrenNodes });
          }
        }
      }
    });

    return nodes;
  }

  const result = traverse(Array.isArray(reactNodes) ? reactNodes : [reactNodes]);

  return result;
}
