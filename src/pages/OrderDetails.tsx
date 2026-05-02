import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { QueueStatusCard } from "@/components/QueueStatusCard";
import { FactCard } from "@/components/FactCard";
import React from "react";
import { useOrder } from "@/store/orders";
import { Progress } from "@/components/ui/progress";

// Lazy load the MiniGame so it doesn't block initial render
const MiniGame = React.lazy(() => import("@/components/MiniGame"));

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const order = useOrder(id);
  const [showGame, setShowGame] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const handleProgress = (e: any) => {
      const { orderId, filename, percent } = e.detail;
      if (order?.id && orderId === order.id) {
        setProgressMap((prev) => ({ ...prev, [filename]: percent }));
      }
    };
    window.addEventListener("upload-progress", handleProgress);
    return () => window.removeEventListener("upload-progress", handleProgress);
  }, [order?.id]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-md px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">Order not found.</p>
          <Link to="/orders" className="mt-3 inline-block text-sm font-medium text-primary">Back to My Orders</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-md space-y-6 px-4 pb-24 pt-4">
        
        <section>
          <div className="mb-2 text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Queue Status
          </div>
          <QueueStatusCard order={order} />
        </section>

        <section className="space-y-4">
          <FactCard />
          
          {!showGame ? (
            <button
              onClick={() => setShowGame(true)}
              className="w-full rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-4 text-sm font-bold text-primary hover:bg-primary/10 transition"
            >
              Play a Mini Game while you wait 🎮
            </button>
          ) : (
            <React.Suspense fallback={<div className="text-center text-xs text-muted-foreground py-4">Loading game...</div>}>
              <MiniGame />
            </React.Suspense>
          )}
        </section>

        <section className={`rounded-xl border p-4 transition-colors duration-500 ${
          order.files.every(f => f.url && !f.url.startsWith("failed")) && order.files.length > 0
            ? "border-emerald-400 bg-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
            : "border-border bg-card"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold ${
              order.files.every(f => f.url && !f.url.startsWith("failed")) ? "text-emerald-900" : ""
            }`}>Order Details</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
              order.files.every(f => f.url && !f.url.startsWith("failed"))
                ? "bg-emerald-200 text-emerald-800 border border-emerald-300"
                : "bg-primary/10 text-primary"
            }`}>
              {order.files.every(f => f.url && !f.url.startsWith("failed")) ? "All Files Secured" : "Uploading..."}
            </span>
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Order ID</div>
          <div className="font-mono text-xs mb-3">{order.id}</div>
          
          <div className="space-y-3">
            {order.files.map((file, idx) => {
              const isFailed = file.url?.startsWith("failed");
              const isSuccess = file.url && !isFailed;
              const percent = isSuccess ? 100 : progressMap[file.name] || 0;

              return (
                <div key={idx} className="flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate font-medium text-foreground/80">{file.name}</span>
                      {isFailed ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">Failed</span>
                          <span className="text-[9px] text-destructive/80 leading-tight max-w-[200px] truncate" title={file.url.replace('failed:', '')}>
                            {file.url.replace('failed:', '')}
                          </span>
                        </div>
                      ) : isSuccess ? (
                        <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                      ) : (
                        <span className="text-[10px] text-primary">{percent}%</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                  
                  {/* Persistent Progress Bar */}
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                    isFailed ? "bg-destructive/20" : isSuccess ? "bg-emerald-100" : "bg-primary/20"
                  }`}>
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isFailed ? "bg-destructive" : isSuccess ? "bg-emerald-500" : "bg-primary"
                      }`}
                      style={{ width: `${isFailed ? 100 : percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>
      <BottomNav />
    </div>
  );
}