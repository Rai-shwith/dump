/**
 * Utilities for downloading and sharing QR code canvas graphics.
 */

export function downloadQrCanvas(canvas: HTMLCanvasElement | null, code: string): boolean {
  if (!canvas) return false;

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `dump-${code}-qr.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

export async function shareQrCanvas(
  canvas: HTMLCanvasElement | null,
  code: string,
  url: string,
): Promise<boolean> {
  if (!canvas) return false;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png");
  });

  if (!blob) return false;

  const file = new File([blob], `dump-${code}-qr.png`, { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: `Dump - ${code}`,
      text: `Dump clipboard: ${url}`,
      files: [file],
    });
    return true;
  }

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share({
      title: `Dump - ${code}`,
      url,
    });
    return true;
  }

  return false;
}
