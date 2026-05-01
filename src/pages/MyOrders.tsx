import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { OrderCard } from "@/components/OrderCard";
import { useOrders, useUser } from "@/store/orders";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const user = useUser();
  const orders = useOrders().filter((o) => o.userEmail === user?.email);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-md space-y-3 px-4 pb-24 pt-4">
        <h2 className="text-lg font-bold">My Orders</h2>
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No orders yet.
            <div className="mt-3">
              <Link to="/" className="font-medium text-primary">Place your first order →</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}