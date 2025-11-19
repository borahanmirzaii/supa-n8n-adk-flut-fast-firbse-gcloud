"use client";

import { useRef, useEffect } from "react";
import { formatRelativeTime } from "@repo/utils";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
}

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
  isStreaming?: boolean;
}

export function MessageList({ messages, streamingContent = "", isStreaming = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const formatTimestamp = (timestamp: Date | { seconds: number; nanoseconds: number }): string => {
    if (timestamp instanceof Date) {
      return formatDate(timestamp);
    }
    if ("seconds" in timestamp) {
      return formatDate(new Date(timestamp.seconds * 1000));
    }
    return "";
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start space-x-3",
              message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                message.role === "user" ? "bg-blue-600" : "bg-gray-400"
              )}
            >
              {message.role === "user" ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[70%] rounded-lg px-4 py-2",
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              )}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <p
                className={cn(
                  "mt-1 text-xs",
                  message.role === "user" ? "text-blue-100" : "text-gray-500"
                )}
              >
                {formatTimestamp(message.createdAt)}
              </p>
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="max-w-[70%] rounded-lg bg-gray-100 px-4 py-2">
              <p className="whitespace-pre-wrap break-words">{streamingContent}</p>
              <div className="mt-1 flex items-center space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0.1s" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

