import { useContext, useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { Loader2, MessageSquare } from "lucide-react";
import Skeleton from "react-loading-skeleton";

import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { ChatContext } from "./ChatContent";
import Message from "./Message";

interface MessagesProps {
  fileId: string;
}

const Messages = ({ fileId }: MessagesProps) => {
  const { isLoading: isAiThinking } = useContext(ChatContext);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, fetchNextPage } = trpc.message.getFileMessages.useInfiniteQuery(
    {
      fileId,
      limit: INFINITE_QUERY_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
    }
  );

  const { ref: intersectionRef, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const messages = data?.pages.flatMap((page) => page.messages) ?? [];

  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: "loading-message",
    isUserMessage: false,
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    ),
  };

  const combinedMessages = isAiThinking ? [loadingMessage, ...messages] : messages;

  if (!isLoading && combinedMessages.length === 0) {
    return (
      <div className="flex max-h-[calc(100vh-3.5rem-7rem)] flex-1 flex-col items-center justify-center gap-2 p-3">
        <MessageSquare className="h-8 w-8 text-blue-500" />
        <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
        <p className="text-zinc-500 text-sm">Ask your first question to get started.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex max-h-[calc(100vh-3.5rem-7rem)] flex-1 flex-col gap-2 p-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  // Messages list
  return (
    <div className="pb-36 scrollbar-thumb-blue scrollbar-track-blue-lighter scrollbar-thumb-rounded scrolling-touch scrollbar-w-2 flex max-h-[calc(100vh-3.5rem-5.5rem)] flex-1 flex-col-reverse gap-4 overflow-y-auto border-zinc-200 p-3">
      {combinedMessages.map((message, i) => {
        const isNextMessageSamePerson = combinedMessages[i - 1]?.isUserMessage === message.isUserMessage;
        const isLastMessage = i === combinedMessages.length - 1;

        return (
          <Message
            key={message.id}
            ref={isLastMessage ? intersectionRef : undefined}
            message={message}
            isNextMessageSamePerson={isNextMessageSamePerson}
          />
        );
      })}
    </div>
  );
};

export default Messages;
