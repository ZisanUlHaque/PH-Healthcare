"use client";

import { MessageCircleIcon, SendIcon, XIcon } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useSendChatMessage } from "@/hooks";
import type { ChatUiMessage } from "@/types";
import ChatMessage from "./chat-message";

const MAX_MESSAGE_LENGTH = 1000;

const WELCOME_MESSAGE: ChatUiMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the PH Healthcare assistant. Tell me your symptoms or what kind of care you need, and I'll suggest the right specialist.",
};

const SUGGESTIONS = [
  "I have trouble sleeping, which doctor should I see?",
  "I often feel anxious. Who can help?",
  "Which doctors are available today?",
];

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatUiMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();

  const { mutateAsync, isPending } = useSendChatMessage();

  const sendingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to the latest message whenever the conversation changes
  useEffect(() => {
    const container = scrollRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isPending]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => inputRef.current?.focus(), 150);

    return () => window.clearTimeout(timeout);
  }, [open]);

  const handleSend = async (rawMessage?: string) => {
    const message = (rawMessage ?? input).trim();

    if (!message || sendingRef.current) {
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      toast.add({
        title: "Message too long",
        description: `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`,
        type: "warning",
      });
      return;
    }

    sendingRef.current = true;

    setMessages((previous) => [
      ...previous,
      { id: createMessageId(), role: "user", content: message },
    ]);
    setInput("");

    try {
      const response = await mutateAsync({ message, sessionId });
      const reply = response.data;

      setSessionId(reply.sessionId);
      setMessages((previous) => [
        ...previous,
        {
          id: createMessageId(),
          role: "assistant",
          content: reply.answer,
          doctors: reply.doctors,
        },
      ]);
    } catch {
      toast.add({
        title: "Message not sent",
        description: "The assistant could not reply. Please try again.",
        type: "error",
      });
      setMessages((previous) => [
        ...previous,
        {
          id: createMessageId(),
          role: "assistant",
          isError: true,
          content:
            "Sorry, I couldn't reach the assistant. Please check your connection and try again.",
        },
      ]);
    } finally {
      sendingRef.current = false;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              size="icon-lg"
              className="size-14 rounded-full shadow-lg"
              aria-label={
                open
                  ? "Close PH Healthcare assistant"
                  : "Chat with PH Healthcare assistant"
              }
            />
          }
        >
          {open ? (
            <XIcon className="size-5" />
          ) : (
            <MessageCircleIcon className="size-6" />
          )}
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          aria-label="PH Healthcare assistant chat"
          className="h-[min(560px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-sm gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-md"
        >
          <div className="flex items-start justify-between gap-3 border-b p-4">
            <div className="flex items-center gap-2.5">
              <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                <MessageCircleIcon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">PH Healthcare Assistant</p>
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Online
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <XIcon />
            </Button>
          </div>

          <div
            ref={scrollRef}
            aria-live="polite"
            className="flex-1 space-y-4 overflow-y-auto p-4"
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onNavigate={() => setOpen(false)}
              />
            ))}

            {messages.length === 1 && !isPending && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="xs"
                    className="h-auto max-w-full rounded-2xl px-3 py-1.5 text-left text-xs whitespace-normal"
                    onClick={() => void handleSend(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}

            {isPending && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-2xl px-3 py-2 text-sm">
                  <Spinner className="size-3.5" />
                  Thinking…
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms…"
                aria-label="Message"
                maxLength={MAX_MESSAGE_LENGTH}
                rows={1}
                disabled={isPending}
                className="bg-background max-h-28 min-h-10 flex-1 rounded-2xl px-3 py-2 text-sm"
              />
              <Button
                size="icon"
                onClick={() => void handleSend()}
                disabled={isPending || input.trim().length === 0}
                aria-label="Send message"
              >
                <SendIcon />
              </Button>
            </div>
            <p className="text-muted-foreground mt-2 text-[11px] leading-snug">
              Enter to send · Shift+Enter for a new line. This assistant gives
              general guidance, not a medical diagnosis.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
