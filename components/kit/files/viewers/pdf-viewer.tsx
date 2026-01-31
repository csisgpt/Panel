export function PdfViewer({ src }: { src: string }) {
  return (
    <iframe
      title="pdf-preview"
      src={src}
      className="h-[360px] w-full rounded-md border"
    />
  );
}
