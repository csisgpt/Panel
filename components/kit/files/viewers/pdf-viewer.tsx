export function PdfViewer({
  src,
  fit = true,
  onError,
  onLoad,
}: {
  src: string;
  fit?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}) {
  return (
    <div className="h-[360px] w-full overflow-auto rounded-md border">
      <iframe
        title="pdf-preview"
        src={src}
        className={fit ? "h-full w-full" : "h-[360px] min-w-[640px]"}
        onError={onError}
        onLoad={onLoad}
      />
    </div>
  );
}
