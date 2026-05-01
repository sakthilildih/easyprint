import { useRef } from "react";

const MAX_FILES = 20;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

interface Props {
  totalFiles: number;
  totalSize: number;
  onFiles: (files: File[]) => void;
}

export function MultiFileUpload({ totalFiles, totalSize, onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (raw: FileList | null) => {
    if (!raw) return;
    const accepted = Array.from(raw).filter(
      (f) => f.type === "application/pdf" || f.type.startsWith("image/")
    );
    onFiles(accepted);
  };

  const remaining = MAX_FILES - totalFiles;
  const sizePct = Math.min(100, (totalSize / MAX_TOTAL_BYTES) * 100);
  const sizeKB = (totalSize / 1024).toFixed(0);
  const maxKB = (MAX_TOTAL_BYTES / 1024 / 1024).toFixed(0);

  return (
    <div className="space-y-2">
      <div
        onClick={() => remaining > 0 && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed transition ${
          remaining <= 0
            ? "border-muted opacity-50 cursor-not-allowed"
            : "border-border hover:border-primary/50 active:scale-[.99]"
        } bg-card p-5 text-center`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-3xl mb-1">📤</div>
        <div className="text-sm font-medium">
          {remaining > 0 ? "Tap or drop files here" : `Maximum ${MAX_FILES} files reached`}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          PDF or image · {remaining} of {MAX_FILES} slots left
        </div>
      </div>

      {/* Size progress bar */}
      {totalSize > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Total size: {sizeKB} KB</span>
            <span>Limit: {maxKB} MB</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                sizePct > 85 ? "bg-destructive" : "bg-primary"
              }`}
              style={{ width: `${sizePct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
