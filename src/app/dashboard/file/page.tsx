// import ChatWrapper from '@/components/chat/ChatWrapper'
// import PdfRenderer from '@/components/PdfRenderer'
import { notFound, redirect } from "next/navigation";
// import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import ChatWrapper from "@/components/chat/ChatWrapper";
import DocxEditorPage from "@/components/doc/DocxEditor";
import PDFWrapper from "@/components/PdfWrapper";
// import PdfRenderer from "@/components/PdfRenderer";
import { db } from "@/db";
import DocxEditorWithPlate from "@/components/doc/DocxEditorWithPlate";
import MyEditorPage from "@/components/doc/PlateDocxEditor";

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const resolved = await params;
  const { fileid } = resolved;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

  //   const plan = await getUserSubscriptionPlan();
  return <MyEditorPage />;
};

export default Page;
