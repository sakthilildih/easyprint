import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { QueueStatusCard } from "@/components/QueueStatusCard";
import { FactCard } from "@/components/FactCard";
import React from "react";
import { useOrder } from "@/store/orders";

// Lazy load the MiniGame so it doesn't block initial render
const MiniGame = React.lazy(() => import("@/components/MiniGame"));

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const order = useOrder(id);
  const [showGame, setShowGame] = useState(false);

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

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Order Details</h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              Files Secured
            </span>
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Order ID</div>
          <div className="font-mono text-xs mb-3">{order.id}</div>
          
          <div className="space-y-2">
            {order.files.map((file, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate font-medium text-foreground/80">{file.name}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
              </div>
            ))}
          </div>
        </section>

      </main>
      <BottomNav />
    </div>
  );
}