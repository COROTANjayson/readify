"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { trpc } from "../_trpc/client";

const AuthCallback = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  //   const { data } = trpc.hello.useQuery({ text: "jayspon" });
  const { data, isError, error } = trpc.auth.authCallBack.useQuery(undefined, {
    retry: true,
    retryDelay: 500,
  });

  useEffect(() => {
    if (data?.succes) {
      router.push(origin ? `/${origin}` : "/dashboard");
    }
  }, [data?.succes, origin, router]);

  useEffect(() => {
    if (isError && error.data?.code === "UNAUTHORIZED") {
      router.push("/sign-in");
    }
  }, [isError, error, router]);

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
  //time stamp 2:18
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full mt-24 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
            <h3 className="font-semibold text-xl">Setting up your account...</h3>
            <p>You will be redirected automatically.</p>
          </div>
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  );
};
export default Page;
