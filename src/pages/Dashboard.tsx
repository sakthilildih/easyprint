import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { MultiFileUpload } from "@/components/MultiFileUpload";
import { createOrder, useUser } from "@/store/orders";
import type { OrderFile } from "@/lib/types";

const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

export default function Dashboard() {
  const user = useUser();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  const addFiles = (newFiles: File[]) => {
    setError(null);
    setFiles((prev) => {
      const combined = [...prev, ...newFiles].slice(0, 20);
      const size = combined.reduce((s, i) => s + i.size, 0);
      if (size > MAX_TOTAL_BYTES) {
        setError("Total file size exceeds 50 MB. Please remove some files.");
        return prev;
      }
      return combined;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const submit = async () => {
    if (!user || files.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // 1. Create order in Firestore INSTANTLY (no file upload yet)
      const orderFiles: OrderFile[] = files.map((f) => ({
        name: f.name,
        size: f.size,
      }));

      const order = await createOrder({
        userEmail: user.email,
        userName: user.name,
        files: orderFiles,
      });

      // 2. Navigate to waiting screen immediately
      navigate(`/orders/${order.id}`);

      // 3. Upload files to Storage in the background (non-blocking)
      const { ref, uploadBytes } = await import("firebase/storage");
      const { storage } = await import("@/lib/firebase");
      files.forEach((file) => {
        const fileRef = ref(storage, `orders/${order.id}/${file.name}`);
        uploadBytes(fileRef, file).catch(console.warn);
      });

    } catch (e) {
      console.error(e);
      setError("Failed to place order. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-md space-y-6 px-4 pb-36 pt-6">

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Upload Documents</h2>
          <p className="text-sm text-muted-foreground">Select files to send directly to the print shop queue.</p>
          <MultiFileUpload
            totalFiles={files.length}
            totalSize={totalSize}
            onFiles={addFiles}
          />
          {error && (
            <div className="rounded-xl bg-destructive/15 p-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}
        </section>

        {files.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Selected Files ({files.length})</h2>
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="ml-3 p-1 text-muted-foreground transition hover:text-destructive"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-[52px] z-20 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-end px-4 py-3">
          <button
            onClick={submit}
            disabled={files.length === 0 || submitting}
            className="w-full rounded-xl bg-primary px-5 py-3.5 text-base font-bold text-primary-foreground shadow-md transition active:scale-[.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading to queue...
              </span>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}