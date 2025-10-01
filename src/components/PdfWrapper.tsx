"use client";

import dynamic from "next/dynamic";

// Dynamically import PDFViewer, with SSR disabled
const PdfRenderer = dynamic(() => import("./PdfRenderer"), {
  ssr: false,
});

export default function PDFWrapper({ url }: { url: string }) {
  return <PdfRenderer url={url} />;
}
