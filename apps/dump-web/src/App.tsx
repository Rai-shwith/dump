import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import ViewPage from "@/pages/ViewPage";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pt-16 pb-12">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<Navigate to="/" replace />} />
          <Route path="/:code" element={<ViewPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster position="top-center" theme="system" richColors />
    </>
  );
}
