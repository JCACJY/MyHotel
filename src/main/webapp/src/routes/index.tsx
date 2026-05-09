import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-lobby.jpg";
import { ROOM_TYPES } from "@/lib/hotel-store";
import { CalendarCheck, Search, KeyRound, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="华住酒店集团大堂"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary/80" />
        <div className="relative z-10 container mx-auto h-full px-6 flex flex-col justify-center text-primary-foreground">
          <p className="text-gold tracking-[0.3em] text-xs mb-4">QIYUN · PULI HOTEL</p>
          <h1 className="font-display text-5xl md:text-7xl max-w-3xl leading-tight">
            一处栖息，<br />一段优雅时光
          </h1>
          <p className="mt-6 max-w-xl text-primary-foreground/80">
            从城市天际线到静谧客房，我们以匠心服务，让每一次到访都成为难忘旅程。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/booking"
              className="px-7 py-3 rounded-md bg-gold-gradient text-primary font-medium shadow-elegant hover:opacity-90 transition"
            >
              立即预定
            </Link>
            <Link
              to="/checkin"
              className="px-7 py-3 rounded-md border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 transition"
            >
              快速办理入住
            </Link>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="container mx-auto px-6 -mt-16 relative z-20 grid md:grid-cols-3 gap-4">
        {[
          { to: "/booking", icon: CalendarCheck, title: "在线预定", desc: "选择心仪房型，灵活安排日期" },
          { to: "/orders", icon: Search, title: "订单查询", desc: "凭手机号或订单号实时查看" },
          { to: "/checkin", icon: KeyRound, title: "办理入住", desc: "前台快速核验，3分钟即可入住" },
        ].map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="bg-card rounded-xl p-6 shadow-card hover:shadow-elegant transition group border"
          >
            <div className="h-12 w-12 rounded-lg bg-gold-gradient flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-xl mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </section>

      {/* Rooms */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold text-xs tracking-[0.3em] mb-2">OUR ROOMS</p>
            <h2 className="font-display text-4xl">精选客房</h2>
          </div>
          <Link to="/booking" className="text-sm text-foreground/70 hover:text-gold transition">
            查看全部 →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {ROOM_TYPES.map((r) => (
            <article key={r.id} className="bg-card rounded-xl overflow-hidden shadow-card border group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={r.image}
                  alt={r.name}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-2xl mb-2">{r.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{r.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {r.size} · {r.bed}
                  </span>
                  <span className="text-gold font-display text-xl">
                    ¥{r.price}
                    <span className="text-xs text-muted-foreground ml-1">/晚</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-10">
          {[
            ["匠心服务", "24h 礼宾管家随时响应您的需求"],
            ["静谧选址", "城市中心却远离喧嚣的私享秘境"],
            ["臻选体验", "Aesop 沐浴系列、米其林餐厅伴您左右"],
          ].map(([t, d]) => (
            <div key={t}>
              <Sparkles className="h-6 w-6 text-gold mb-4" />
              <h3 className="font-display text-2xl mb-2">{t}</h3>
              <p className="text-primary-foreground/70 text-sm">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
