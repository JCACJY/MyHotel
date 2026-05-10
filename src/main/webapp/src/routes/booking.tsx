import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ROOM_TYPES, diffNights, ordersStore } from "@/lib/hotel-store";
import { toast } from "sonner";
import { CalendarDays, Users, BedDouble, Check } from "lucide-react";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "预定客房 — 华住酒店集团" },
      { name: "description", content: "选择心仪房型，在线预定华住酒店集团。" },
    ],
  }),
  component: Booking,
});

function todayStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function Booking() {
  const navigate = useNavigate();
  const [roomTypeId, setRoomTypeId] = useState(ROOM_TYPES[0].id);
  const [checkIn, setCheckIn] = useState(todayStr(0));
  const [checkOut, setCheckOut] = useState(todayStr(1));
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const room = ROOM_TYPES.find((r) => r.id === roomTypeId)!;
  const nights = useMemo(() => diffNights(checkIn, checkOut), [checkIn, checkOut]);
  const total = nights * room.price;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName || !phone || !idNumber) {
      toast.error("请填写完整入住人信息");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error("退房日期需晚于入住日期");
      return;
    }
    try {
      const order = await ordersStore.add({
        guestName,
        phone,
        idNumber,
        roomTypeId: room.id,
        roomTypeName: room.name,
        checkIn,
        checkOut,
        nights,
        guests,
        totalPrice: total,
      });
      toast.success("预定成功", { description: `订单号 ${order.id}，已发送至您的手机` });
      navigate({ to: "/orders", search: { q: order.id } as never });
    } catch (error) {
      toast.error("预定失败", { description: error instanceof Error ? error.message : "请稍后重试" });
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-gold tracking-[0.3em] text-xs mb-2">RESERVATION</p>
        <h1 className="font-display text-4xl">预定客房</h1>
        <p className="text-muted-foreground mt-2">三步即可完成预定，开启您的优雅旅程。</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1 房型 */}
          <section className="bg-card border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-xl mb-4 flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-gold" /> 选择房型
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {ROOM_TYPES.map((r) => {
                const active = r.id === roomTypeId;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRoomTypeId(r.id)}
                    className={`text-left rounded-lg overflow-hidden border-2 transition ${
                      active ? "border-gold shadow-elegant" : "border-transparent hover:border-border"
                    }`}
                  >
                    <div className="aspect-[4/3] relative">
                      <img src={r.image} alt={r.name} loading="lazy" className="h-full w-full object-cover" />
                      {active && (
                        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-gold-gradient flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground mb-1">{r.size} · {r.bed}</p>
                      <p className="text-gold font-display">¥{r.price}<span className="text-xs text-muted-foreground"> /晚</span></p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2 日期 */}
          <section className="bg-card border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-xl mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gold" /> 入住日期
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="入住日期">
                <input
                  type="date"
                  value={checkIn}
                  min={todayStr(0)}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="退房日期">
                <input
                  type="date"
                  value={checkOut}
                  min={todayStr(1)}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="入住人数">
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="input guest-select"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} 位</option>
                    ))}
                  </select>
                </div>
              </Field>
            </div>
          </section>

          {/* Step 3 入住人 */}
          <section className="bg-card border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-xl mb-4">入住人信息</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="姓名">
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="请输入真实姓名" className="input" />
              </Field>
              <Field label="手机号">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="11 位手机号" className="input" />
              </Field>
              <Field label="证件号" full>
                <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="身份证号" className="input" />
              </Field>
            </div>
          </section>
        </form>

        {/* 摘要 */}
        <aside className="lg:sticky lg:top-24 self-start bg-card border rounded-xl shadow-elegant overflow-hidden">
          <img src={room.image} alt={room.name} className="w-full aspect-[4/3] object-cover" />
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-display text-2xl">{room.name}</h3>
              <p className="text-sm text-muted-foreground">{room.desc}</p>
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <Row k="入住" v={checkIn} />
              <Row k="退房" v={checkOut} />
              <Row k="共计" v={`${nights} 晚 · ${guests} 位`} />
              <Row k="单价" v={`¥${room.price} / 晚`} />
            </div>
            <div className="border-t pt-4 flex items-baseline justify-between">
              <span className="text-muted-foreground text-sm">应付总额</span>
              <span className="font-display text-3xl text-gold">¥{total}</span>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-md bg-gold-gradient text-primary font-medium shadow-card hover:opacity-90 transition"
            >
              确认预定
            </button>
            <p className="text-xs text-muted-foreground text-center">免费取消 · 到店付款</p>
          </div>
        </aside>
      </div>

      <style>{`
        .input {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          color: var(--color-foreground);
          font-size: 14px;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .guest-select {
          padding-left: 40px;
          padding-right: 36px;
        }
        .input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px color-mix(in oklab, var(--gold) 20%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="block text-xs text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
