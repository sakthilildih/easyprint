import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Order, OrderStatus, User } from "@/lib/types";

// ─── User (Firebase Auth-backed) ───────────────────────────────────────────────
// Auth state is managed by useFirebaseAuth in App.tsx; these helpers just
// expose the cached value to components that don't need the full auth object.

const USER_KEY = "easyprint:user";

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setUser(u: User | null) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("easyprint:user"));
}

export function useUser(): User | null {
  const [u, setU] = useState<User | null>(getUser);
  useEffect(() => {
    const h = () => setU(getUser());
    window.addEventListener("easyprint:user", h);
    return () => window.removeEventListener("easyprint:user", h);
  }, []);
  return u;
}

// ─── Orders (Firestore) ────────────────────────────────────────────────────────

const ORDERS_COL = "orders";

/** Get the next sequential token number. */
async function getNextTokenNumber(): Promise<string> {
  const snap = await getDocs(collection(db, ORDERS_COL));
  if (snap.empty) return "1000";
  const tokens = snap.docs
    .map((d) => parseInt((d.data() as Order).tokenNumber, 10))
    .filter((n) => !isNaN(n));
  return tokens.length === 0 ? "1000" : String(Math.max(...tokens) + 1);
}

/** Create a new order in Firestore, returns the created Order. */
export async function createOrder(
  input: Omit<Order, "id" | "tokenNumber" | "createdAt" | "status">
): Promise<Order> {
  try {
    const tokenNumber = await getNextTokenNumber();
    const id = `EP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const order: Order = {
      ...input,
      id,
      tokenNumber,
      status: "Pending",
      createdAt: Date.now(),
    };
    await setDoc(doc(db, ORDERS_COL, id), order);
    console.log("✅ Order created in Firestore:", id, "Token:", tokenNumber);
    return order;
  } catch (err) {
    console.error("❌ Firestore write failed:", err);
    throw err;
  }
}

/** Update the status of an order (for the shop admin panel). */
export async function updateOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(db, ORDERS_COL, id), { status });
}

/** Calculate queue position for a given order. */
export function queuePosition(order: Order, allOrders: Order[]) {
  const ahead = allOrders.filter(
    (o) => (o.status === "Pending" || o.status === "Printing") && o.createdAt < order.createdAt && o.id !== order.id
  ).length;
  return { position: ahead + 1, ahead };
}

/** Live-subscribe to ALL orders (sorted by most recent first). */
export function useOrders(): Order[] {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    const q = query(collection(db, ORDERS_COL), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => d.data() as Order));
    });
    return () => unsub();
  }, []);
  return orders;
}

/** Live-subscribe to a single order by ID. */
export function useOrder(id: string | undefined): Order | undefined {
  const [order, setOrder] = useState<Order | undefined>();
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, ORDERS_COL, id), (snap) => {
      if (snap.exists()) setOrder(snap.data() as Order);
    });
    return () => unsub();
  }, [id]);
  return order;
}