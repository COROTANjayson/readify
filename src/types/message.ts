import { JSX } from "react";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers";

type RouterOutput = inferRouterOutputs<AppRouter>;

type Messages = RouterOutput["message"]["getFileMessages"]["messages"];

type OmitText = Omit<Messages[number], "text">;

type ExtendedText = {
  text: string | JSX.Element;
};

export type ExtendedMessage = OmitText & ExtendedText;
