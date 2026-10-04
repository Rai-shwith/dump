import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";
import { downloadQrCanvas, shareQrCanvas } from "@/utils/qr";

interface Props {
  url: string;
  code: string;
}

export function QRCodeCard({ url, code }: Props): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function handleDownload(): void {
    const success = downloadQrCanvas(canvasRef.current, code);
    if (success) {
      toast.success("QR code downloaded");
    } else {
      toast.error("Could not download QR code");
    }
  }

  async function handleShare(): Promise<void> {
    try {
      const shared = await shareQrCanvas(canvasRef.current, code, url);
      if (shared) {
        toast.success("Shared successfully");
      } else {
        downloadQrCanvas(canvasRef.current, code);
        toast.info("Device sharing unavailable. QR code downloaded.");
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        toast.error("Could not share QR code");
      }
    }
  }

  return (
    <div className="mt-5 border-t border-[var(--border-color)] pt-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <QrCode className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span>Quick Scan</span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)]">Open on another device</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="rounded-xl border border-[var(--border-color)] bg-white p-3 shadow-xs">
          <QRCodeCanvas
            ref={canvasRef}
            value={url}
            size={144}
            level="Q"
            marginSize={1}
            bgColor="#ffffff"
            fgColor="#09090b"
          />
        </div>

        <div className="mt-4 flex w-full gap-2">
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download QR Code as PNG"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share QR Code"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share QR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
