import { notFound, redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import PDFWrapper from "@/components/PdfWrapper";
import ToolsWrapper from "@/components/tools-panel/ToolsWrapper";
import { createCaller } from "@/trpc/server";

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = await params;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    redirect(`/auth-callback?origin=dashboard/${fileid}`);
  }


  const trpc = await createCaller();
  const file = await trpc.file.getFileById({ fileId: fileid });

  if (!file) notFound();

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)] ">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <PDFWrapper url={file.url} />
          </div>
        </div>

        <div className="relative shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ToolsWrapper isSubscribed={true} file={file} />
        </div>
      </div>
    </div>
  );
};

export default Page;
