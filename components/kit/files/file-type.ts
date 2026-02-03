export type FileType = "image" | "video" | "document" | "other";

export function getFileType(fileName: string): FileType {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return "other";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) return "document";
  return "other";
}

export function getFileIcon(type: FileType) {
  switch (type) {
    case "image":
      return "🖼️";
    case "video":
      return "🎬";
    case "document":
      return "📄";
    default:
      return "📎";
  }
}
