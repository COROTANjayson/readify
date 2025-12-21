import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import MySlidePage from "@/components/slide/SlidePage";
import { db } from "@/db";

interface PageProps {
  params: {
    ppt_id: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const resolved = await params;
  const { ppt_id } = resolved;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard`);

  return <MySlidePage ppt_id={ppt_id} />;
};

export default Page;
