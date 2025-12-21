"use client";

import PptxGenJS from "pptxgenjs";

// Main Component
export default function MySlidePage({ ppt_id }: { ppt_id: string }) {
  const generatePPT = async () => {
    const pptx = new PptxGenJS();

    // --- Slide 1 ---
    const slide1 = pptx.addSlide();
    slide1.addText("Hello from Next.js!", {
      x: 1,
      y: 1,
      fontSize: 28,
      bold: true,
    });

    slide1.addText("This PPT was generated using pptxgenjs", {
      x: 1,
      y: 2,
      fontSize: 16,
    });

    // --- Slide 2 ---
    const slide2 = pptx.addSlide();
    slide2.addText("Second Slide", {
      x: 1,
      y: 1,
      fontSize: 24,
      color: "363636",
    });

    slide2.addText(
      [
        { text: "• Bullet one\n", options: { fontSize: 16 } },
        { text: "• Bullet two\n", options: { fontSize: 16 } },
        { text: "• Bullet three", options: { fontSize: 16 } },
      ],
      { x: 1, y: 2 }
    );

    // Download file
    await pptx.writeFile({ fileName: "sample-presentation.pptx" });
  };

  return (
    <div className="min-h-screen ">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Generate PPT</h1>
        <button onClick={generatePPT} className="px-4 py-2 bg-blue-600 text-white rounded">
          Generate PPT
        </button>
      </div>
    </div>
  );
}
