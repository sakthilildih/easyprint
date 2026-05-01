import { Link } from "react-router-dom";
import type { Order } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function OrderCard({ order }: { order: Order }) {
  const fileCount = order.files.length;
  const displayName = fileCount === 1 ? order.files[0].name : `${fileCount} files`;

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition active:scale-[.99] hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">Token</div>
          <div className="text-2xl font-bold tracking-wider text-primary">#{order.tokenNumber}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="min-w-0">
          <div className="truncate font-medium">{displayName}</div>
          <div className="text-xs text-muted-foreground">{order.id} · {formatDate(order.createdAt)}</div>
        </div>
      </div>
    </Link>
  );
}