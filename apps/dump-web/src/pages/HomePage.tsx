import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CreateForm } from "@/components/CreateForm";
import { StarredStrip } from "@/components/StarredStrip";
import { SuccessCard } from "@/components/SuccessCard";
import type { CreateClipboardResponse } from "@/types";

export default function HomePage() {
  const [result, setResult] = useState<CreateClipboardResponse | null>(null);

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <section>
        <header className="mb-4">
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            dump
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Anonymous clipboards. Share text between devices in seconds.
          </p>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {result ? (
            <SuccessCard key="success" result={result} onCreateAnother={() => setResult(null)} />
          ) : (
            <CreateForm key="form" onCreated={setResult} />
          )}
        </AnimatePresence>
      </section>

      <StarredStrip />
    </div>
  );
}
