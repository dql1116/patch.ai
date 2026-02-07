import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, teamContext }: { messages: UIMessage[]; teamContext: string } =
    await req.json();

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: `You are TeamForge Bot, a friendly and helpful team assistant for a project collaboration platform. You help team members communicate, organize tasks, and work together effectively.

Context about this team:
${teamContext}

Guidelines:
- Be warm, encouraging, and professional
- Help facilitate team discussions
- Suggest action items when appropriate
- Keep responses concise (2-3 sentences typically)
- Reference team members by name when relevant`,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  });
}
