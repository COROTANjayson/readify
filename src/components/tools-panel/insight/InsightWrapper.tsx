"use client";

const InsightWrapper = ({ fileId, isSubscribed }: { fileId: string; isSubscribed: boolean }) => {
  return (
    <div className="p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4">Document Summary</h3>
      <div className="space-y-4">
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition">
          Generate Summary
        </button>
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Summary will appear here...</p>
        </div>
      </div>
    </div>
  );
};

export default InsightWrapper;
