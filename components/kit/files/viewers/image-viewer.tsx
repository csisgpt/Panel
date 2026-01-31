export function ImageViewer({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex h-[360px] w-full items-center justify-center overflow-hidden rounded-md border bg-muted">
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
    </div>
  );
}
