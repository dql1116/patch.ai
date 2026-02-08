"use client";

import React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Team, UserProfile } from "@/lib/types";
import { ArrowLeft, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface TeamChatProps {
  team: Team;
  currentUser: UserProfile;
  onBack: () => void;
}

function getBotReply(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hey there! Great to see you in the chat. How are you feeling about the project so far? Let me know if there's anything I can help coordinate.";
  }
  if (lower.includes("task") || lower.includes("todo") || lower.includes("what should")) {
    return "Great question! I'd suggest starting with a quick kickoff meeting to align on goals and divide responsibilities. Each team member could pick a feature area that matches their strengths.";
  }
  if (lower.includes("meeting") || lower.includes("schedule") || lower.includes("call")) {
    return "Scheduling a sync is a great idea! I'd recommend a short 30-minute kickoff to align on the project vision, then weekly 15-minute standups.";
  }
  if (lower.includes("help") || lower.includes("stuck") || lower.includes("issue")) {
    return "Don't worry, we've got a solid team here! Try describing the specific challenge you're facing and I'm sure one of your teammates can jump in.";
  }
  if (lower.includes("deadline") || lower.includes("timeline") || lower.includes("when")) {
    return "Setting clear milestones will help keep everyone on track. I'd suggest breaking the project into 2-week sprints with demo checkpoints.";
  }
  if (lower.includes("role") || lower.includes("who") || lower.includes("responsibility")) {
    return "Engineers can tackle the technical architecture, designers can lead on UX/UI flows, and PMs can own the roadmap and stakeholder communication. Clear ownership prevents overlap!";
  }
  if (lower.includes("tech") || lower.includes("stack") || lower.includes("tool")) {
    return "For the tech stack, I'd recommend choosing tools the majority of the team is comfortable with. Consistency beats novelty!";
  }
  if (lower.includes("thank") || lower.includes("thanks") || lower.includes("awesome")) {
    return "You're welcome! This team has a lot of potential. Keep the communication flowing and don't hesitate to reach out if you need anything.";
  }

  const responses = [
    "That's a great point! I think the team should discuss this together. What does everyone else think?",
    "Interesting thought! This could be a good topic for your next team sync.",
    "Thanks for sharing that! Collaboration is key -- make sure everyone's voice is heard.",
    "Good input! I'd recommend documenting that so everyone stays aligned.",
    "Nice thinking! The best teams iterate quickly and communicate often.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export function TeamChat({ team, currentUser, onBack }: TeamChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "bot-welcome",
      role: "assistant",
      text: `Hey team! Welcome to the ${team.project.title} project chat. I'm your TeamForge assistant -- here to help you collaborate. You've got a great group here: ${team.members.map((m) => m.name).join(", ")}. Let's build something amazing together! Feel free to ask me anything about coordinating your project.`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const simulateBotReply = useCallback((userText: string) => {
    setIsTyping(true);
    const reply = getBotReply(userText);

    // Simulate typing delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          text: reply,
        },
      ]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const text = input.trim();
    setInput("");
    simulateBotReply(text);
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
                      {message.text}
                    </p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
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
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
              input.trim() && !isTyping
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
