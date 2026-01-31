import { Badge } from "@/components/ui/badge";
import type { FileMeta } from "@/lib/types/backend";

export function AttachmentBadge({ file }: { file: FileMeta }) {
  return (
    <Badge variant="secondary" className="gap-2">
      <span>{file.fileName}</span>
      <span className="text-xs text-muted-foreground">{Math.round(file.sizeBytes / 1024)} KB</span>
    </Badge>
  );
}
