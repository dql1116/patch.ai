export async function POST(req: Request) {
  const { messages, teamContext } = await req.json();

  // Get the last user message text
  const lastMessage = messages[messages.length - 1];
  let userText = "";
  if (lastMessage?.parts) {
    userText = lastMessage.parts
      .filter((p: { type: string; text?: string }) => p.type === "text")
      .map((p: { text: string }) => p.text)
      .join("");
  } else if (lastMessage?.content) {
    userText =
      typeof lastMessage.content === "string" ? lastMessage.content : "";
  }

  const lower = userText.toLowerCase();

  // Smart response generation based on message content
  let reply = "";

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    reply =
      "Hey there! Great to see you in the chat. How are you feeling about the project so far? Let me know if there's anything I can help coordinate.";
  } else if (lower.includes("task") || lower.includes("todo") || lower.includes("what should")) {
    reply =
      "Great question! I'd suggest starting with a quick kickoff meeting to align on goals and divide responsibilities. Each team member could pick a feature area that matches their strengths. Want me to suggest a task breakdown?";
  } else if (lower.includes("meeting") || lower.includes("schedule") || lower.includes("call")) {
    reply =
      "Scheduling a sync is a great idea! I'd recommend a short 30-minute kickoff to align on the project vision, then weekly 15-minute standups. Try to find a time that works across all team members' time zones.";
  } else if (lower.includes("help") || lower.includes("stuck") || lower.includes("issue")) {
    reply =
      "Don't worry, we've got a solid team here! Try describing the specific challenge you're facing and I'm sure one of your teammates can jump in. Pair programming or a quick design review session often helps unblock things fast.";
  } else if (lower.includes("deadline") || lower.includes("timeline") || lower.includes("when")) {
    reply =
      "Setting clear milestones will help keep everyone on track. I'd suggest breaking the project into 2-week sprints with demo checkpoints. This way you can iterate and adjust without the pressure of one big deadline.";
  } else if (lower.includes("role") || lower.includes("who") || lower.includes("responsibility")) {
    reply = `Based on the team composition, I'd suggest dividing work by expertise. Engineers can tackle the technical architecture, designers can lead on UX/UI flows, and PMs can own the roadmap and stakeholder communication. Clear ownership prevents overlap!`;
  } else if (lower.includes("tech") || lower.includes("stack") || lower.includes("tool")) {
    reply =
      "For the tech stack, I'd recommend choosing tools the majority of the team is comfortable with. Consistency beats novelty -- pick a framework everyone can contribute to, and document your setup decisions early.";
  } else if (lower.includes("thank") || lower.includes("thanks") || lower.includes("awesome")) {
    reply =
      "You're welcome! This team has a lot of potential. Keep the communication flowing and don't hesitate to reach out if you need anything. You've got this!";
  } else {
    const responses = [
      "That's a great point! I think the team should discuss this together. What does everyone else think?",
      "Interesting thought! This could be a good topic for your next team sync. Would you like me to suggest some discussion points?",
      "Thanks for sharing that! Collaboration is key -- make sure everyone's voice is heard on this. Any other thoughts from the team?",
      "Good input! I'd recommend documenting that decision so everyone stays aligned. A shared doc or project board works great for this.",
      "Nice thinking! Remember, the best teams iterate quickly and communicate often. Keep that energy going!",
    ];
    reply = responses[Math.floor(Math.random() * responses.length)];
  }

  // Stream the response using SSE format compatible with useChat + DefaultChatTransport
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send message start
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "start", messageId: `msg-${Date.now()}` })}\n\n`,
        ),
      );

      // Stream text in chunks for a natural typing feel
      const words = reply.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? "" : " ") + words[i];
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "text-delta", delta: chunk })}\n\n`,
          ),
        );
        await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
      }

      // Send finish
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "finish", finishReason: "stop" })}\n\n`,
        ),
      );

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
