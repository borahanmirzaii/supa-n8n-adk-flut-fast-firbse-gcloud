"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useMessagesQuery, useCreateMessage } from "@/lib/hooks/useFirestoreQuery";
import { useCreateMessage as useCreateMessageMutation } from "@/lib/hooks/useFirestoreMutation";
import { streamAgentResponse, type StreamChunk } from "@/lib/agentClient";
import { MessageList } from "./MessageList";
import { logger } from "@/lib/logger";
import toast from "react-hot-toast";
import { Send, Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  sessionId: string;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useMessagesQuery(sessionId, 50);
  const createMessage = useCreateMessageMutation(sessionId);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!message.trim() || !user || isStreaming) return;

    const userMessage = message.trim();
    setMessage("");

    try {
      // Save user message
      await createMessage.mutateAsync({
        content: userMessage,
        role: "user",
        createdAt: new Date(),
      });

      setIsStreaming(true);
      setStreamingContent("");

      // Stream agent response
      await streamAgentResponse(
        {
          message: userMessage,
          sessionId,
        },
        (chunk: StreamChunk) => {
          if (chunk.done) {
            setIsStreaming(false);
            // Save complete assistant message
            createMessage.mutate({
              content: streamingContent + chunk.content,
              role: "assistant",
              createdAt: new Date(),
            });
            setStreamingContent("");
          } else {
            setStreamingContent((prev) => prev + chunk.content);
          }
        }
      );
    } catch (error) {
      logger.error({ error, sessionId }, "Failed to send message");
      toast.error("Failed to send message. Please try again.");
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} streamingContent={streamingContent} isStreaming={isStreaming} />

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-end space-x-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isStreaming}
            className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStreaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

