import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Terminal } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Helmet>
        <title>Docs | Dump - Online Clipboard</title>
        <meta name="description" content="Learn how to use Dump, the free and secure online clipboard. Explore features, FAQ, and developer APIs." />
      </Helmet>
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">docs</h1>
        <p className="text-lg text-[var(--text-secondary)]">
          Everything you need to know about using Dump.
        </p>
      </section>

      <section className="space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)]/30 p-6">
        <h2 className="font-mono text-lg font-semibold text-[var(--text-primary)]">
          What is DUMP?
        </h2>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          DUMP (backronym: <strong>Distributed Utility for Message Passing</strong>) is a minimalist, anonymous, and serverless online clipboard. It allows you to share text, code snippets, or configuration payloads between devices instantly and securely using custom, readable URLs.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-sm">
          <h3 className="mb-2 font-semibold">Quick Share ⚡</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Paste text and share via custom or random code.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-sm">
          <h3 className="mb-2 font-semibold">Security Options 🔒</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Public vs Protected mode (lock view or edit).
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-sm">
          <h3 className="mb-2 font-semibold">Self-Destruct 💣</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Deletes after first read using one-time view.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-[var(--border-color)]">
            <AccordionTrigger className="text-[var(--text-primary)] hover:text-[var(--accent-hover)] text-left">
              Why is there no sign-up or email?
            </AccordionTrigger>
            <AccordionContent className="text-[var(--text-secondary)] leading-relaxed">
              Dump is designed for anonymity and speed. We don't want your personal data. 
              You create a clipboard, share the link, and it eventually expires or is deleted. 
              No accounts mean zero tracking and maximum privacy.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="border-[var(--border-color)]">
            <AccordionTrigger className="text-[var(--text-primary)] hover:text-[var(--accent-hover)] text-left">
              How does "Bypass password for me" work?
            </AccordionTrigger>
            <AccordionContent className="text-[var(--text-secondary)] leading-relaxed">
              When you create a protected clipboard, your browser receives a secure, randomly generated owner token. 
              This token is stored locally on your device, allowing you to view, edit, or delete the clipboard 
              without re-entering the password. If you switch devices or clear your browser data, you'll need the password again.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-[var(--border-color)]">
            <AccordionTrigger className="text-[var(--text-primary)] hover:text-[var(--accent-hover)] text-left">
              Can I recover a deleted clipboard or lost password?
            </AccordionTrigger>
            <AccordionContent className="text-[var(--text-secondary)] leading-relaxed">
              No. Once a clipboard is deleted or expires, it is permanently purged from our servers. 
              We also hash all passwords using SHA-256 before storing them, meaning we cannot read, 
              recover, or reset your password under any circumstances.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-[var(--border-color)]">
            <AccordionTrigger className="text-[var(--text-primary)] hover:text-[var(--accent-hover)] text-left">
              How long do clipboards last?
            </AccordionTrigger>
            <AccordionContent className="text-[var(--text-secondary)] leading-relaxed">
              You choose the expiration time when creating a clipboard. By default, they last for 1 hour. 
              You can set it to expire in 5 minutes, 1 day, 1 week, 1 month, or up to 1 year. 
              Once the time is up, the clipboard is automatically and permanently deleted.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Developers</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="h-5 w-5 text-[var(--text-secondary)]" />
              <h3 className="font-medium text-[var(--text-primary)]">Public Clipboards</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Fetch the raw content of any public clipboard programmatically by appending <code className="bg-[var(--surface-overlay)] px-1.5 py-0.5 rounded text-[var(--text-primary)] font-mono">/raw</code> to the API URL.
            </p>
            <div className="rounded-md bg-[var(--surface-overlay)] p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-[var(--text-primary)]">
                <code>curl https://dump.ashwithrai.me/&lt;mycode&gt;/raw</code>
              </pre>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="h-5 w-5 text-[var(--text-secondary)]" />
              <h3 className="font-medium text-[var(--text-primary)]">Protected Clipboards</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              For protected clipboards, provide the password via the <code className="bg-[var(--surface-overlay)] px-1.5 py-0.5 rounded text-[var(--text-primary)] font-mono">x-clipboard-password</code> header.
            </p>
            <div className="rounded-md bg-[var(--surface-overlay)] p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-[var(--text-primary)]">
                <code>curl -H "x-clipboard-password: my_password" \{"\n"}  https://dump.ashwithrai.me/&lt;mycode&gt;/raw</code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
