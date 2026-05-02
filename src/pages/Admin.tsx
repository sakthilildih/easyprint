import { useState } from "react";
import { useOrders, updateOrderStatus } from "@/store/orders";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-300",
  Printing: "bg-blue-100 text-blue-800 border-blue-300",
  Ready: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const STATUS_CYCLE: Record<OrderStatus, OrderStatus> = {
  Pending: "Printing",
  Printing: "Ready",
  Ready: "Pending",
};

export default function Admin() {
  const orders = useOrders();
  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filtered =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  async function handleStatusChange(order: Order) {
    setUpdating(order.id);
    try {
      const next = STATUS_CYCLE[order.status];
      await updateOrderStatus(order.id, next);
    } finally {
      setUpdating(null);
    }
  }

  function toggleExpand(id: string) {
    setExpandedOrder((prev) => (prev === id ? null : id));
  }



  const counts = {
    All: orders.length,
    Pending: orders.filter((o) => o.status === "Pending").length,
    Printing: orders.filter((o) => o.status === "Printing").length,
    Ready: orders.filter((o) => o.status === "Ready").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderBottom: "1px solid #1e3a5f",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🖨️</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px" }}>
              EasyPrint Admin
            </div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Shop Control Panel</div>
          </div>
        </div>
        <div style={{
          padding: "6px 14px",
          background: "rgba(59,130,246,0.15)",
          border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: 8,
          fontSize: 12,
          color: "#93c5fd",
          fontWeight: 600,
        }}>
          {orders.length} Orders
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {(["All", "Pending", "Printing", "Ready"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                background: filter === s
                  ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                  : "rgba(30,41,59,0.8)",
                border: filter === s ? "1px solid #3b82f6" : "1px solid #1e293b",
                borderRadius: 12,
                padding: "14px 12px",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "center" as const,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: filter === s ? "#fff" : "#94a3b8" }}>
                {counts[s]}
              </div>
              <div style={{ fontSize: 11, color: filter === s ? "rgba(255,255,255,0.8)" : "#475569", fontWeight: 600, marginTop: 2 }}>
                {s}
              </div>
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              color: "#475569", fontSize: 14,
            }}>
              No {filter !== "All" ? filter.toLowerCase() : ""} orders yet.
            </div>
          )}

          {filtered.map((order) => {
            const isUploading = order.files.some(f => !f.url);
            
            return (
            <div
              key={order.id}
              style={{
                background: "rgba(30,41,59,0.7)",
                border: "1px solid #1e3a5f",
                borderRadius: 16,
                overflow: "hidden",
                transition: "border-color 0.2s",
                opacity: isUploading ? 0.7 : 1, // Dim uploading orders slightly
              }}
            >
              {/* Order Header Row */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                flexWrap: "wrap" as const,
              }}>
                {/* Token */}
                <div style={{
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: 1,
                  minWidth: 50,
                  textAlign: "center" as const,
                }}>
                  #{order.tokenNumber}
                </div>

                {/* User Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {order.userName}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {order.userEmail} | ID: {order.userId || "N/A"}
                  </div>
                  {order.projectUrl && (
                    <div style={{ fontSize: 10, color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Source: {order.projectUrl}
                    </div>
                  )}
                </div>

                {/* File Count */}
                <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>
                  {order.files.length} file{order.files.length !== 1 ? "s" : ""}
                </div>

                {/* Status Badge */}
                <span style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  border: "1px solid",
                  ...(isUploading 
                    ? { background: "rgba(245,158,11,0.1)", color: "#fcd34d", borderColor: "rgba(245,158,11,0.2)" }
                    : order.status === "Pending"
                    ? { background: "rgba(16,185,129,0.15)", color: "#34d399", borderColor: "rgba(16,185,129,0.3)" } // Pending but fully uploaded is "Ready" conceptually
                    : order.status === "Printing"
                    ? { background: "rgba(59,130,246,0.15)", color: "#60a5fa", borderColor: "rgba(59,130,246,0.3)" }
                    : { background: "rgba(139,92,246,0.15)", color: "#a78bfa", borderColor: "rgba(139,92,246,0.3)" }),
                }}>
                  {isUploading ? "⏳ Uploading" : order.status === "Pending" ? "✅ Ready" : order.status === "Printing" ? "🖨️ Printing" : "🏁 Finished"}
                </span>

                {/* Advance Status Button */}
                <button
                  onClick={() => handleStatusChange(order)}
                  disabled={updating === order.id || isUploading}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    background: (updating === order.id || isUploading) ? "#1e293b" : "rgba(99,102,241,0.2)",
                    color: (updating === order.id || isUploading) ? "#475569" : "#a5b4fc",
                    border: "1px solid rgba(99,102,241,0.3)",
                    cursor: (updating === order.id || isUploading) ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {updating === order.id ? "..." : isUploading ? "Wait for Files" : `→ ${STATUS_CYCLE[order.status]}`}
                </button>

                {/* Expand/Collapse */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    background: "rgba(30,41,59,0.6)",
                    color: "#64748b",
                    border: "1px solid #1e293b",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                >
                  {expandedOrder === order.id ? "▲ Hide" : "▼ Files"}
                </button>
              </div>

              {/* Files Panel */}
              {expandedOrder === order.id && (
                <div style={{
                  borderTop: "1px solid #1e3a5f",
                  padding: "12px 16px",
                  background: "rgba(15,23,42,0.6)",
                }}>
                  <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: 1 }}>
                    Files — Order {order.id}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {order.files.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          background: "rgba(30,41,59,0.6)",
                          borderRadius: 10,
                          border: "1px solid #1e3a5f",
                          flexWrap: "wrap" as const,
                        }}
                      >
                        {/* File Icon */}
                        <div style={{
                          width: 32, height: 32,
                          background: file.url
                            ? "rgba(59,130,246,0.15)"
                            : "rgba(100,116,139,0.15)",
                          borderRadius: 8,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, flexShrink: 0,
                        }}>
                          {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "🖼️"
                            : file.name.match(/\.pdf$/i) ? "📄"
                            : file.name.match(/\.(doc|docx)$/i) ? "📝"
                            : "📎"}
                        </div>

                        {/* File Name & Size */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 600, color: "#e2e8f0",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {file.name}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {(file.size / 1024).toFixed(0)} KB
                            {file.url
                              ? <span style={{ marginLeft: 8, color: "#34d399", fontWeight: 600 }}>✓ URL stored</span>
                              : <span style={{ marginLeft: 8, color: "#f87171", fontWeight: 600 }}>⚠ No URL (old order)</span>
                            }
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {file.url ? (
                          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                background: "rgba(59,130,246,0.2)",
                                color: "#60a5fa",
                                border: "1px solid rgba(59,130,246,0.35)",
                                textDecoration: "none",
                                display: "flex", alignItems: "center", gap: 5,
                                transition: "background 0.2s",
                              }}
                            >
                              👁 View
                            </a>
                            <a
                              href={file.url}
                              download={file.name}
                              style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                background: "rgba(16,185,129,0.2)",
                                color: "#34d399",
                                border: "1px solid rgba(16,185,129,0.35)",
                                textDecoration: "none",
                                display: "flex", alignItems: "center", gap: 5,
                                transition: "background 0.2s",
                              }}
                            >
                              ⬇ Download
                            </a>
                          </div>
                        ) : (
                          <span style={{
                            fontSize: 11, color: "#475569",
                            fontStyle: "italic",
                          }}>
                            Re-submit needed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
