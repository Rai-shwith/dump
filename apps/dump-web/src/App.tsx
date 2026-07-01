import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Heart } from "lucide-react";
import HomePage from "@/pages/HomePage";
import ViewPage from "@/pages/ViewPage";
import NotFound from "@/pages/NotFound";
import DocsPage from "@/pages/DocsPage";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pt-16 pb-6">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new" element={<Navigate to="/" replace />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/:code" element={<ViewPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        
        <footer className="mt-12 text-center text-sm text-[var(--text-muted)]">
          Made with <Heart className="inline h-3.5 w-3.5 text-red-500 fill-red-500 mx-0.5" /> by{" "}
          <a
            href="https://ashwithrai.me"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--accent)] hover:text-[var(--text-primary)] hover:underline transition-colors"
          >
            Rai-shwith
          </a>
        </footer>
      </main>
      <Toaster position="top-center" theme="system" richColors />
    </>
  );
}
