"use client";

const PPTWrapper = ({ fileId, isSubscribed }: { fileId: string; isSubscribed: boolean }) => {
  return (
    <div className="p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4">Create Presentation</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Number of slides</label>
          <input type="number" defaultValue={5} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition">
          Generate Presentation
        </button>
      </div>
    </div>
  );
};

export default PPTWrapper;
