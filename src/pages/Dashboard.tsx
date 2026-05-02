import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { MultiFileUpload } from "@/components/MultiFileUpload";
import { createOrder, useUser } from "@/store/orders";
import type { OrderFile } from "@/lib/types";

import * as pdfjsLib from "pdfjs-dist";
// Use a CDN for the worker to avoid complex Vite configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const submit = async () => {
    if (!user || files.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      const { uploadToS3 } = await import("@/lib/aws");

      // 1. Create the Firestore document first with empty URLs
      const initialFiles: OrderFile[] = files.map(f => ({
        name: f.name,
        size: f.size,
        url: ""
      }));

      const order = await createOrder({
        userId: user.email,
        userEmail: user.email,
        userName: user.name,
        projectUrl: window.location.origin,
        files: initialFiles,
      });

      console.log("✅ Order placed immediately. Beginning background uploads...");
      navigate(`/orders/${order.id}`);

      // 2. Upload ALL files to S3 in the background
      (async () => {
        try {
          const { updateOrderFiles } = await import("@/store/orders");
          const imageCompression = (await import("browser-image-compression")).default;

          const finalFiles: OrderFile[] = [...initialFiles];

          for (let i = 0; i < files.length; i++) {
            const originalFile = files[i];
            let fileToUpload = originalFile;
            
            // Compress images before uploading to save massive bandwidth
            if (originalFile.type.startsWith("image/")) {
              try {
                fileToUpload = await imageCompression(originalFile, {
                  maxSizeMB: 2, 
                  maxWidthOrHeight: 3500, // Preserves high-res for printing
                  useWebWorker: true,
                });
                console.log(`Compressed ${originalFile.name}: ${(originalFile.size/1024/1024).toFixed(1)}MB -> ${(fileToUpload.size/1024/1024).toFixed(1)}MB`);
              } catch (err) {
                console.warn("Image compression failed, using original file", err);
              }
            }

            // Upload to S3 STRICTLY SEQUENTIALLY to prevent network timeouts
            let finalUrl = "failed";
            try {
              finalUrl = await uploadToS3(fileToUpload, user, (percent) => {
                window.dispatchEvent(new CustomEvent('upload-progress', {
                  detail: { orderId: order.id, filename: originalFile.name, percent }
                }));
              });
            } catch (err: any) {
              console.error(`Upload failed for ${originalFile.name}:`, err);
              finalUrl = `failed:${err.message || 'Unknown error'}`;
            }

            finalFiles[i] = {
              name: originalFile.name, // keep original name for UI tracking
              size: fileToUpload.size, // reflect the new optimized size
              url: finalUrl
            };
            
            // Incrementally update the order document so files that finish show checkmarks
            await updateOrderFiles(order.id, finalFiles);
          }

          console.log("✅ Background uploads completed and URLs updated.");
        } catch (uploadError) {
          console.error("Background upload failed:", uploadError);
        }
      })();

    } catch (e: any) {
      console.error("Order placement failed:", e);
      setError(e.message || "Failed to place order. Please check your connection.");
      setSubmitting(false);
      setUploadProgress(0);
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
                <div key={idx} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
                  <FilePreview file={file} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="ml-2 p-2 text-muted-foreground transition hover:text-destructive shrink-0"
                    aria-label="Remove file"
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
      <div className="fixed inset-x-0 bottom-[64px] z-20 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-end px-4 py-3">
          <button
            onClick={submit}
            disabled={files.length === 0 || submitting}
            className="w-full rounded-xl bg-primary px-5 py-3.5 text-base font-bold text-primary-foreground shadow-md transition active:scale-[.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {uploadProgress < 100 
                  ? `Uploading ${uploadProgress}%...` 
                  : "Finalizing Order..."
                }
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

function FilePreview({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (file.type === "application/pdf") {
      setLoading(true);
      const generatePdfThumb = async () => {
        try {
          const buffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: buffer });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) return;
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          await page.render(renderContext).promise;
          
          if (!isCancelled) {
            setUrl(canvas.toDataURL("image/jpeg", 0.8));
          }
        } catch (e) {
          console.warn("Failed to generate PDF preview", e);
        } finally {
          if (!isCancelled) setLoading(false);
        }
      };
      generatePdfThumb();
      
      return () => { isCancelled = true; };
    }
  }, [file]);

  if (url) {
    return (
      <img
        src={url}
        alt={file.name}
        className="h-16 w-16 shrink-0 rounded-md object-cover border border-border shadow-sm"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 shadow-sm">
      {loading ? (
        <svg className="h-6 w-6 animate-spin text-primary/50" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
        </svg>
      ) : (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )}
    </div>
  );
}