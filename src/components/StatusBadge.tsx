import type { OrderStatus } from "@/lib/types";

const styles: Record<OrderStatus, string> = {
  Pending: "bg-muted text-muted-foreground",
  Printing: "bg-yellow-100 text-yellow-800",
  Ready: "bg-primary/10 text-primary",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "Ready" ? "bg-primary" : status === "Printing" ? "bg-yellow-500" : "bg-muted-foreground"}`} />
      {status}
    </span>
  );
}