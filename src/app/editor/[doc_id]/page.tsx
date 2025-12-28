import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import MyEditorPage from "@/components/editor/EditorPage";

interface PageProps {
  params: {
    doc_id: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const resolved = await params;
  const { doc_id } = resolved;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard`);

  return <MyEditorPage doc_id={doc_id} />;
};

export default Page;
