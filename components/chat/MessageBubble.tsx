import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

export function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-3xl px-4 py-3 text-left text-sm leading-7",
        message.role === "assistant"
          ? "bg-transparent text-zinc-300"
          : "ml-auto border border-white/15 bg-transparent text-zinc-300",
      )}
    >
      {message.content}
    </div>
  );
}
