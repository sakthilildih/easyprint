import { useEffect, useMemo } from "react";
import type { Order } from "@/lib/types";
import { useOrders, queuePosition } from "@/store/orders";
import { StatusBadge } from "./StatusBadge";

export function QueueStatusCard({ order }: { order: Order }) {
  const allOrders = useOrders(); // live Firestore listener
  const pos = useMemo(() => queuePosition(order, allOrders), [order, allOrders]);
  const ready = order.status === "Ready";

  return (
    <div
      className={`block rounded-2xl p-6 shadow-sm transition ${
        ready
          ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground"
          : "border border-primary/20 bg-primary/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-xs uppercase tracking-wider ${ready ? "text-primary-foreground/80" : "text-primary/70"}`}>
            Your Token
          </div>
          <div className={`mt-1 text-6xl font-extrabold tabular-nums tracking-widest ${ready ? "" : "text-primary"}`}>
            {order.tokenNumber}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className={`mt-6 space-y-2 text-sm ${ready ? "text-primary-foreground/90" : "text-foreground/80"}`}>
        {ready ? (
          <div className="rounded-lg bg-white/20 p-3 text-center text-lg font-bold">
            Your print is ready! <br /> Show your token at the shop.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-background border border-border p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Est. Wait</div>
              <div className="mt-1 text-2xl font-black text-primary">
                {pos.ahead === 0 ? "< 1m" : `~${pos.ahead * 2}m`}
              </div>
            </div>
            <div className="rounded-xl bg-background border border-border p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">People Ahead</div>
              <div className="mt-1 text-2xl font-black text-foreground">
                {pos.ahead}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}