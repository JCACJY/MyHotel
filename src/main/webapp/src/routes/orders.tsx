import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useOrders, type Order } from "@/lib/hotel-store";
import { Search, FileText } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "订单查询 — 华住酒店集团" },
      { name: "description", content: "凭订单号或手机号查询您的酒店预定订单。" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  component: OrdersPage,
});

const STATUS_MAP: Record<Order["status"], { label: string; className: string }> = {
  booked: { label: "已预定", className: "bg-accent/30 text-accent-foreground" },
  checked_in: { label: "已入住", className: "bg-gold-gradient text-primary" },
  checked_out: { label: "已退房", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "已取消", className: "bg-destructive/10 text-destructive" },
};

function OrdersPage() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q || "");
  const orders = useOrders();

  const results = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return orders;
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(kw) ||
        o.phone.includes(kw) ||
        o.guestName.toLowerCase().includes(kw),
    );
  }, [q, orders]);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-gold tracking-[0.3em] text-xs mb-2">RESERVATIONS</p>
        <h1 className="font-display text-4xl">订单查询</h1>
        <p className="text-muted-foreground mt-2">输入订单号、姓名或手机号，快速找到您的预定。</p>
      </div>

      <div className="bg-card border rounded-xl p-4 md:p-6 shadow-card mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索订单号 / 姓名 / 手机号"
            className="w-full h-14 pl-12 pr-4 rounded-lg border bg-background outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
          />
        </div>
      </div>

      {results.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid gap-4">
          {results.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const s = STATUS_MAP[order.status];
  return (
    <article className="bg-card border rounded-xl p-6 shadow-card hover:shadow-elegant transition">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">订单号</p>
          <p className="font-mono text-lg font-medium">{order.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.className}`}>{s.label}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <Info k="入住人" v={order.guestName} />
        <Info k="手机号" v={order.phone} />
        <Info k="房型" v={order.roomTypeName} />
        <Info k="人数" v={`${order.guests} 位`} />
        <Info k="入住" v={order.checkIn} />
        <Info k="退房" v={order.checkOut} />
        <Info k="夜数" v={`${order.nights} 晚`} />
        <Info k="金额" v={`¥${order.totalPrice}`} highlight />
      </div>
      {order.roomNumber && (
        <p className="mt-4 text-sm">
          <span className="text-muted-foreground">房间号：</span>
          <span className="text-gold font-display text-lg">{order.roomNumber}</span>
        </p>
      )}
      {order.status === "booked" && (
        <div className="mt-5 pt-5 border-t flex justify-end">
          <Link
            to="/checkin"
            search={{ q: order.id } as never}
            className="px-5 py-2 rounded-md bg-gold-gradient text-primary text-sm font-medium hover:opacity-90 transition"
          >
            前往办理入住
          </Link>
        </div>
      )}
    </article>
  );
}

function Info({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{k}</p>
      <p className={highlight ? "text-gold font-medium" : "font-medium"}>{v}</p>
    </div>
  );
}

function Empty() {
  return (
    <div className="bg-card border rounded-xl py-20 text-center shadow-card">
      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground mb-4">暂无相关订单</p>
      <Link to="/booking" className="text-gold hover:underline">去预定 →</Link>
    </div>
  );
}
