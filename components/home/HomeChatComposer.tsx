type HomeChatComposerProps = {
  onPromptChange: (value: string) => void;
  onSubmit: (prompt?: string) => void;
  prompt: string;
  starters: readonly string[];
  starterKeyPrefix?: string;
};

export function HomeChatComposer({
  onPromptChange,
  onSubmit,
  prompt,
  starters,
  starterKeyPrefix = "starter",
}: HomeChatComposerProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/70 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <input
        className="w-full bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
        placeholder="Ask anything about crypto..."
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-2 pt-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {starters.map((starter) => (
            <button
              key={`${starterKeyPrefix}-${starter}`}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-zinc-300 transition hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-orange-100"
              type="button"
              onClick={() => onSubmit(starter)}
            >
              {starter}
            </button>
          ))}
        </div>
        <button
          className="shrink-0 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-orange-400"
          type="button"
          onClick={() => onSubmit()}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
