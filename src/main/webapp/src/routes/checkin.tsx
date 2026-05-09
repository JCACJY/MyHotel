import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ordersStore, useOrders, type Order } from "@/lib/hotel-store";
import { toast } from "sonner";
import { KeyRound, Search, CheckCircle2, ShieldCheck, Clock, Wifi, Coffee, BedDouble } from "lucide-react";

export const Route = createFileRoute("/checkin")({
  head: () => ({
    meta: [
      { title: "办理入住 — 华住酒店集团" },
      { name: "description", content: "凭订单号核验身份，3 分钟即可拿到房卡。" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  component: CheckinPage,
});

function CheckinPage() {
  const search = Route.useSearch();
  useOrders(); // subscribe for live updates
  const [q, setQ] = useState(search.q || "");
  const [idTail, setIdTail] = useState("");
  const [found, setFound] = useState<Order | null>(null);
  const [done, setDone] = useState<{ order: Order; room: string } | null>(null);

  useEffect(() => {
    if (!search.q) return;
    void ordersStore.getById(search.q).then((order) => {
      setFound(order);
      if (order) {
        toast.success("订单核验成功", { description: `${order.guestName} · ${order.roomTypeName}` });
      }
    });
  }, [search.q]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const kw = q.trim();
    if (!kw) {
      toast.error("请输入订单号");
      return;
    }
    const order = await ordersStore.getById(kw);
    if (!order) {
      toast.error("未查询到该订单", { description: "请确认订单号是否正确" });
      setFound(null);
      return;
    }
    setFound(order);
    setIdTail("");
    toast.success("订单核验成功", { description: `${order.guestName} · ${order.roomTypeName}` });
  }

  async function handleCheckin() {
    if (!found) return;
    if (found.status === "checked_in") {
      toast.info("该订单已办理入住", { description: `房间号 ${found.roomNumber}` });
      setDone({ order: found, room: found.roomNumber || "" });
      return;
    }
    if (found.status !== "booked") {
      toast.error("订单当前状态无法办理入住");
      return;
    }
    const tail = idTail.trim();
    if (tail.length < 4) {
      toast.error("请输入证件号后 4 位以核验身份");
      return;
    }
    if (found.idNumber.slice(-4).toLowerCase() !== tail.toLowerCase()) {
      toast.error("证件号后 4 位不匹配", { description: "请确认入住人身份信息" });
      return;
    }
    try {
      const updated = await ordersStore.checkin(found.id, tail);
      const room = updated.roomNumber || "";
      setFound(updated);
      setDone({ order: updated, room });
      toast.success("入住办理成功", { description: `欢迎入住 ${room} 房` });
    } catch (error) {
      toast.error("入住办理失败", { description: error instanceof Error ? error.message : "请稍后重试" });
    }
  }

  if (done) return <KeyCard order={done.order} room={done.room} onBack={() => setDone(null)} />;

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <div className="mb-8">
        <p className="text-gold tracking-[0.3em] text-xs mb-2">CHECK IN</p>
        <h1 className="font-display text-4xl">办理入住</h1>
        <p className="text-muted-foreground mt-2">输入预定订单号核验身份，确认无误后即可获取房卡。</p>
      </div>

      <form onSubmit={handleSearch} className="bg-card border rounded-xl p-6 shadow-card mb-6">
        <label className="block text-sm text-muted-foreground mb-2">订单号</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="例如 HT12345678"
              className="w-full h-12 pl-12 pr-4 rounded-lg border bg-background outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition font-mono"
            />
          </div>
          <button type="submit" className="px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition">
            核验订单
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">温馨提示：仅支持凭酒店预定订单号办理入住。</p>
      </form>

      {found && (
        <div className="bg-card border rounded-xl p-6 shadow-elegant">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-muted-foreground">已找到预定</p>
              <p className="font-mono text-lg">{found.id}</p>
            </div>
            <StatusBadge status={found.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm border-t pt-5">
            <Info k="入住人" v={found.guestName} />
            <Info k="证件号" v={maskId(found.idNumber)} />
            <Info k="手机号" v={found.phone} />
            <Info k="房型" v={found.roomTypeName} />
            <Info k="入住" v={found.checkIn} />
            <Info k="退房" v={found.checkOut} />
            <Info k="夜数" v={`${found.nights} 晚`} />
            <Info k="入住人数" v={`${found.guests} 位`} />
            <Info k="金额" v={`¥${found.totalPrice}`} highlight />
          </div>

          {found.status === "booked" ? (
            <>
              <div className="mt-6 pt-5 border-t">
                <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ShieldCheck className="h-4 w-4 text-gold" />
                  请输入入住人证件号后 4 位以核验身份
                </label>
                <input
                  value={idTail}
                  onChange={(e) => setIdTail(e.target.value)}
                  maxLength={6}
                  placeholder="证件号后 4 位"
                  className="w-full md:w-64 h-11 px-4 rounded-lg border bg-background outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition tracking-widest"
                />
              </div>
              <div className="mt-6 pt-5 border-t flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">核验通过后将自动分配房间并标记为已入住</p>
                <button
                  onClick={handleCheckin}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gold-gradient text-primary font-medium shadow-card hover:opacity-90 transition"
                >
                  <KeyRound className="h-4 w-4" />
                  确认办理入住
                </button>
              </div>
            </>
          ) : found.status === "checked_in" ? (
            <div className="mt-6 pt-5 border-t flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                <span className="text-muted-foreground">已分配房间：</span>
                <span className="text-gold font-display text-2xl ml-1">{found.roomNumber}</span>
              </p>
              <button
                onClick={() => setDone({ order: found, room: found.roomNumber || "" })}
                className="px-5 py-2 rounded-md border hover:bg-muted text-sm transition"
              >
                查看房卡
              </button>
            </div>
          ) : (
            <p className="mt-6 pt-5 border-t text-sm text-muted-foreground">该订单当前状态无法办理入住。</p>
          )}
        </div>
      )}
    </div>
  );
}

function KeyCard({ order, room, onBack }: { order: Order; room: string; onBack: () => void }) {
  return (
    <div className="container mx-auto px-6 py-16 max-w-xl">
      <div className="bg-card border rounded-2xl shadow-elegant p-10 text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-gold-gradient flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-display text-3xl mb-2">欢迎入住</h2>
        <p className="text-muted-foreground mb-8">{order.guestName} 先生/女士，您的房卡已就绪</p>

        <div className="bg-hero text-primary-foreground rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[10px] tracking-[0.3em] text-gold/80">KEY CARD</div>
          <p className="text-gold text-xs tracking-[0.3em] mb-2">YOUR ROOM</p>
          <p className="font-display text-7xl tracking-wider">{room}</p>
          <p className="mt-4 text-primary-foreground/80 text-sm">{order.roomTypeName}</p>
          <div className="mt-6 pt-5 border-t border-primary-foreground/20 flex justify-between text-xs">
            <div className="text-left">
              <p className="text-primary-foreground/60">入住</p>
              <p className="font-medium">{order.checkIn}</p>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground/60">退房</p>
              <p className="font-medium">{order.checkOut}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <Perk icon={<Wifi className="h-4 w-4" />} label="高速 WiFi" />
          <Perk icon={<Coffee className="h-4 w-4" />} label="迎宾茶点" />
          <Perk icon={<BedDouble className="h-4 w-4" />} label="行政礼遇" />
        </div>

        <p className="mt-6 text-xs text-muted-foreground inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> 退房时间：当日 12:00 前
        </p>

        <div className="mt-8 flex gap-3 justify-center">
          <button onClick={onBack} className="px-5 py-2 rounded-md border hover:bg-muted transition text-sm">
            返回
          </button>
          <Link to="/orders" className="px-5 py-2 rounded-md border hover:bg-muted transition text-sm">
            查看订单
          </Link>
          <Link to="/" className="px-5 py-2 rounded-md bg-gold-gradient text-primary text-sm font-medium">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

function Perk({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2 rounded-lg bg-muted/40">
      <span className="text-gold">{icon}</span>
      <span>{label}</span>
    </div>
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

function maskId(id: string) {
  if (!id || id.length < 6) return id;
  return id.slice(0, 4) + "******" + id.slice(-4);
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map = {
    booked: ["待入住", "bg-accent/30 text-accent-foreground"],
    checked_in: ["已入住", "bg-gold-gradient text-primary"],
    checked_out: ["已退房", "bg-muted text-muted-foreground"],
    cancelled: ["已取消", "bg-destructive/10 text-destructive"],
  } as const;
  const [label, cls] = map[status];
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}
