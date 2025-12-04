// import ChatWrapper from '@/components/chat/ChatWrapper'
// import PdfRenderer from '@/components/PdfRenderer'
import { redirect } from "next/navigation";
// import { getUserSubscriptionPlan } from '@/lib/stripe'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import MyEditorPage from "@/components/tools-panel/doc/PlateDocxEditor";
// import AppHello from "@/components/tools-panel/test";
// import PdfRenderer from "@/components/PdfRenderer";
import { db } from "@/db";

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
  // return <AppHello />;
};

export default Page;
