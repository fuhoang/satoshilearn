import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

export function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <div
      className={cn(
        "rounded-3xl px-4 py-3 text-left text-sm",
        message.role === "assistant"
          ? "max-w-[72%] bg-transparent pr-8 text-zinc-200 leading-7"
          : "ml-auto mt-2 max-w-[80%] border border-white/15 bg-transparent text-zinc-300 leading-6",
      )}
    >
      {message.content}
    </div>
  );
}
