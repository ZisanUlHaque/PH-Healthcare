"use client";

import { cn } from "cn";
import type { ReactNode } from "react";
import type { ChatUiMessage } from "@/types";
import ChatDoctorCard from "./chat-doctor-card";

type ListItem = { id: string; text: string };

type Block =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading"; text: string }
  | { id: string; type: "ul"; items: ListItem[] }
  | { id: string; type: "ol"; items: ListItem[] };

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

function renderInline(text: string): ReactNode[] {
  let offset = 0;

  return text
    .split(INLINE_PATTERN)
    .filter((part) => part.length > 0)
    .map((part) => {
      const key = `inline-${offset}`;
      offset += part.length;

      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={key} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }

      return <span key={key}>{part}</span>;
    });
}

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.split("\n");

  let paragraph: { id: string; parts: string[] } | null = null;
  let list: { id: string; type: "ul" | "ol"; items: ListItem[] } | null = null;

  const flushParagraph = () => {
    if (paragraph) {
      blocks.push({
        id: paragraph.id,
        type: "paragraph",
        text: paragraph.parts.join(" "),
      });
      paragraph = null;
    }
  };

  const flushList = () => {
    if (list) {
      blocks.push(
        list.type === "ul"
          ? { id: list.id, type: "ul", items: list.items }
          : { id: list.id, type: "ol", items: list.items },
      );
      list = null;
    }
  };

  lines.forEach((rawLine, lineIndex) => {
    const line = rawLine.trim();
    const id = `line-${lineIndex}`;

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ id, type: "heading", text: heading[1] });
      return;
    }

    const bullet = line.match(/^[-•]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      if (list?.type !== "ul") {
        flushList();
        list = { id, type: "ul", items: [] };
      }
      list.items.push({ id, text: bullet[1] });
      return;
    }

    const ordered = line.match(/^\d+[.)]\s+(.*)$/);
    if (ordered) {
      flushParagraph();
      if (list?.type !== "ol") {
        flushList();
        list = { id, type: "ol", items: [] };
      }
      list.items.push({ id, text: ordered[1] });
      return;
    }

    flushList();
    paragraph ??= { id, parts: [] };
    paragraph.parts.push(line);
  });

  flushParagraph();
  flushList();

  return blocks;
}

function MarkdownText({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      {parseBlocks(content).map((block) => {
        if (block.type === "ul") {
          return (
            <ul key={block.id} className="list-disc space-y-1 pl-4">
              {block.items.map((item) => (
                <li key={item.id}>{renderInline(item.text)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={block.id} className="list-decimal space-y-1 pl-4">
              {block.items.map((item) => (
                <li key={item.id}>{renderInline(item.text)}</li>
              ))}
            </ol>
          );
        }

        if (block.type === "heading") {
          return (
            <p key={block.id} className="font-semibold">
              {renderInline(block.text)}
            </p>
          );
        }

        return <p key={block.id}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}

export default function ChatMessage({
  message,
  onNavigate,
}: {
  message: ChatUiMessage;
  onNavigate?: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] space-y-2 rounded-2xl px-3 py-2 text-sm break-words",
          isUser && "bg-primary text-primary-foreground",
          !isUser && !message.isError && "bg-muted text-foreground",
          message.isError && "bg-destructive/10 text-destructive",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownText content={message.content} />
        )}

        {message.doctors && message.doctors.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-muted-foreground text-xs font-medium">
              Suggested doctors
            </p>
            {message.doctors.map((doctor) => (
              <ChatDoctorCard
                key={doctor.id}
                doctor={doctor}
                onSelect={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
