import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");
  
  return (
    <div className="border-t">
      <div className="bg-slate-100">
        {/* <MaxWidthWrapper></MaxWidthWrapper> */}
        <div className="mx-auto max-w-5xl justify-center px-2 md:px-40"></div>
      </div>
    </div>
  );
};

export default Page;
