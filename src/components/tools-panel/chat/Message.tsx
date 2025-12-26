import { forwardRef } from "react";
import { format } from "date-fns";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";

interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(({ message, isNextMessageSamePerson }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-start gap-3 group", {
        "flex-row-reverse": message.isUserMessage,
      })}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center transition-opacity duration-200",
          "w-8 h-8 rounded-full",
          {
            "bg-primary shadow-sm": message.isUserMessage,
            "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm": !message.isUserMessage,
            "opacity-0": isNextMessageSamePerson,
            "opacity-100": !isNextMessageSamePerson,
          }
        )}
      >
        {message.isUserMessage ? (
          <User className="w-5 h-5 text-white" strokeWidth={2.5} />
        ) : (
          <Bot className="w-5 h-5 text-white" strokeWidth={2.5} />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn("flex flex-col max-w-[75%] sm:max-w-[65%]", {
          "items-end": message.isUserMessage,
          "items-start": !message.isUserMessage,
        })}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            "relative px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200",
            "group-hover:shadow-md",
            {
              "bg-primary/90 text-white": message.isUserMessage,
              "bg-white border border-gray-200 text-gray-900": !message.isUserMessage,
              "rounded-tr-md": !isNextMessageSamePerson && message.isUserMessage,
              "rounded-tl-md": !isNextMessageSamePerson && !message.isUserMessage,
            }
          )}
        >
          {/* Message Text */}
          <div
            className={cn("text-[15px] leading-relaxed", {
              "text-white": message.isUserMessage,
              "text-gray-800": !message.isUserMessage,
            })}
          >
            {typeof message.text === "string" ? (
              <div
                className={cn("prose prose-sm max-w-none", {
                  "prose-invert": message.isUserMessage,
                })}
              >
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1">
                <span
                  className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            )}
          </div>

          {/* Timestamp */}
          {message.id !== "loading-message" && (
            <div
              className={cn(
                "text-[11px] font-medium mt-1.5 select-none opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                {
                  "text-blue-100": message.isUserMessage,
                  "text-gray-500": !message.isUserMessage,
                }
              )}
            >
              {format(new Date(message.createdAt), "HH:mm")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Message.displayName = "Message";

export default Message;
