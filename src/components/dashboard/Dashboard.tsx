"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Files, Ghost, Sparkles } from "lucide-react";
import Skeleton from "react-loading-skeleton";

import { trpc } from "@/app/_trpc/client";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { FileCard } from "./FileCard";
import UploadButton from "./UploadButton";

interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const Dashboard = ({ subscriptionPlan }: PageProps) => {
  const router = useRouter();
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null);
  const utils = trpc.useContext();

  const { data: files, isLoading } = trpc.file.getUserFiles.useQuery();

  const { mutate: deleteFile } = trpc.file.deleteFile.useMutation({
    onSuccess: () => {
      utils.file.getUserFiles.invalidate();
    },
    onMutate({ id }) {
      setCurrentlyDeletingFile(id);
    },
    onSettled() {
      setCurrentlyDeletingFile(null);
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-10 md:py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-800   to-primary p-6 shadow-xl md:p-8">
          <div className="absolute inset-0 bg-black/10"></div>

          <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                <Files className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-3xl text-white">My Files</h1>
                <p className="mt-0.5 text-blue-100 text-sm">
                  {files?.length || 0} {files?.length === 1 ? "document" : "documents"} uploaded
                </p>
              </div>
            </div>
            <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
          </div>
        </div>

        {/* Files Grid */}
        {files && files?.length !== 0 ? (
          <div className="mt-10">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h2 className="font-semibold text-xl text-gray-900">Recent Documents</h2>
            </div>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {files
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onDelete={() => {
                      deleteFile({ id: file.id });
                    }}
                    isDeleting={currentlyDeletingFile === file.id}
                    onFileClick={() => {
                      router.push(`/dashboard/${file.id}`);
                    }}
                  />
                ))}
            </ul>
          </div>
        ) : isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton height={200} className="rounded-2xl" />
            <Skeleton height={200} className="rounded-2xl" />
            <Skeleton height={200} className="rounded-2xl" />
          </div>
        ) : (
          <div className="mt-20 flex flex-col items-center gap-6">
            <div className="rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-8">
              <Ghost className="h-16 w-16 text-indigo-600" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-2xl text-gray-900">No files yet</h3>
              <p className="mt-2 text-gray-600 text-lg">
                Upload your first PDF to get started with your document library
              </p>
            </div>
            <div className="mt-4">
              <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
