import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";

const Page = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  //   const { data } = trpc.hello.useQuery({ text: "jayspon" });
  const { data } = trpc.authCallBack.useQuery();

  if (data?.succes) {
    router.push(origin ? `/${origin}` : "/dashboard");
  }
  //time stamp 2:06
};
