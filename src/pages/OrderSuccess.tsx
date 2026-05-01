import { Link, useParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { useOrder } from "@/store/orders";

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const order = useOrder(id);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 pt-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-3xl">✓</div>
        <h2 className="mt-3 text-2xl font-extrabold">Order placed!</h2>
        <p className="mt-1 text-sm text-muted-foreground">Save your token. Show it at the shop when ready.</p>

        <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 p-6 text-primary-foreground shadow-lg shadow-primary/30">
          <div className="text-xs uppercase tracking-wider opacity-80">Your Token Number</div>
          <div className="mt-1 text-6xl font-extrabold tabular-nums tracking-widest">#{order.tokenNumber}</div>
          <div className="mt-3 text-xs opacity-80">Order ID</div>
          <div className="font-mono text-sm">{order.id}</div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to={`/orders/${order.id}`}
            className="rounded-xl border border-border bg-card py-3 text-sm font-semibold"
          >
            View order
          </Link>
          <Link
            to="/orders"
            className="rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            My orders
          </Link>
        </div>

        <Link to="/" className="mt-4 inline-block text-xs text-muted-foreground">← Back to home</Link>
      </main>
    </div>
  );
}