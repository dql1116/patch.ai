"use client";

import React from "react"

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { Team, UserProfile } from "@/lib/types";
import { ArrowLeft, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamChatProps {
  team: Team;
  currentUser: UserProfile;
  onBack: () => void;
}

export function TeamChat({ team, currentUser, onBack }: TeamChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const teamContext = `Project: "${team.project.title}" - ${team.project.description}. Team members: ${team.members.map((m) => `${m.name} (${m.role})`).join(", ")}. The team was matched with a ${team.matchScore}% compatibility score.`;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          messages,
          id,
          teamContext,
        },
      }),
    }),
    initialMessages: [
      {
        id: "bot-welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: `Hey team! Welcome to the ${team.project.title} project chat. I'm your TeamForge assistant -- here to help you collaborate. You've got a great group here: ${team.members.map((m) => m.name).join(", ")}. Let's build something amazing together! Feel free to ask me anything about coordinating your project.`,
          },
        ],
      },
    ],
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  function getMessageText(message: (typeof messages)[0]): string {
    if (!message.parts || !Array.isArray(message.parts)) return "";
    return message.parts
      .filter(
        (p): p is { type: "text"; text: string } => p.type === "text",
      )
      .map((p) => p.text)
      .join("");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-sm font-bold text-foreground">
              {team.project.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              {team.members.length} members
            </p>
          </div>
          <div className="flex -space-x-2">
            {team.members.slice(0, 4).map((member, idx) => (
              <div
                key={member.id}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-[10px] font-bold text-primary"
                style={{ zIndex: 10 - idx }}
              >
                {member.avatar}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex flex-col gap-4">
            {messages.map((message) => {
              const text = getMessageText(message);
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isUser ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                      {currentUser.avatar}
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {!isUser && (
                      <div className="mb-1 text-xs font-semibold text-primary">
                        TeamForge Bot
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {text}
                    </p>
                  </div>
                </div>
              );
            })}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-2xl bg-secondary px-4 py-3">
                  <div className="flex gap-1">
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground/40"
                      style={{ animation: "float 1s ease-in-out infinite" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground/40"
                      style={{
                        animation: "float 1s ease-in-out infinite 0.2s",
                      }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground/40"
                      style={{
                        animation: "float 1s ease-in-out infinite 0.4s",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/95 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
              input.trim() && !isLoading
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground",
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
