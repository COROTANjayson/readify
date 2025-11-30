"use client";

const DocWrapper = ({ fileId, isSubscribed }: { fileId: string; isSubscribed: boolean }) => {
  return (
    <div className="p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4">Convert to DOCX</h3>
      <div className="space-y-4">
        <div className="border rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Include images</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Preserve formatting</span>
          </label>
        </div>
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition">
          Convert & Download
        </button>
      </div>
    </div>
  );
};

export default DocWrapper;
