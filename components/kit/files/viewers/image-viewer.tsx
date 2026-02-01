export function ImageViewer({
  src,
  alt,
  fit = true,
  onError,
  onLoad,
}: {
  src: string;
  alt: string;
  fit?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}) {
  return (
    <div className="flex h-[360px] w-full items-center justify-center overflow-auto rounded-md border bg-muted">
      <img
        src={src}
        alt={alt}
        onError={onError}
        onLoad={onLoad}
        className={fit ? "max-h-full max-w-full object-contain" : "h-auto w-auto object-none"}
      />
    </div>
  );
}
