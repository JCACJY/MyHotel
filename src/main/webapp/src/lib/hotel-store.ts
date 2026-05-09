import { useSyncExternalStore } from "react";

export type RoomType = {
  id: string;
  name: string;
  desc: string;
  price: number;
  bed: string;
  size: string;
  image: string;
};

export type Order = {
  id: string;
  guestName: string;
  phone: string;
  idNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  status: "booked" | "checked_in" | "checked_out" | "cancelled";
  roomNumber?: string;
  createdAt: string;
};

const STORAGE_KEY = "hotel.orders.v1";

const listeners = new Set<() => void>();
let cache: Order[] | null = null;

function read(): Order[] {
  if (typeof window === "undefined") return [];
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

function write(orders: Order[]) {
  cache = orders;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
  listeners.forEach((l) => l());
}

export const ordersStore = {
  getAll: () => read(),
  add(o: Omit<Order, "id" | "createdAt" | "status">): Order {
    const order: Order = {
      ...o,
      id: "HT" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10),
      createdAt: new Date().toISOString(),
      status: "booked",
    };
    write([order, ...read()]);
    return order;
  },
  update(id: string, patch: Partial<Order>) {
    write(read().map((o) => (o.id === id ? { ...o, ...patch } : o)));
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};

export function useOrders(): Order[] {
  return useSyncExternalStore(
    ordersStore.subscribe,
    () => read(),
    () => [],
  );
}

import deluxe from "@/assets/room-deluxe.jpg";
import suite from "@/assets/room-suite.jpg";
import twin from "@/assets/room-twin.jpg";

export const ROOM_TYPES: RoomType[] = [
  {
    id: "deluxe",
    name: "豪华大床房",
    desc: "城市景观、定制大床、意式咖啡机，享受静谧舒适的入住体验。",
    price: 888,
    bed: "1.8m 大床",
    size: "42㎡",
    image: deluxe,
  },
  {
    id: "twin",
    name: "高级双床房",
    desc: "宽敞双床布局，适合商旅同行或家庭出行的舒适之选。",
    price: 728,
    bed: "1.2m 双床",
    size: "38㎡",
    image: twin,
  },
  {
    id: "suite",
    name: "行政套房",
    desc: "独立客厅与会客区，享行政酒廊礼遇与专属管家服务。",
    price: 1688,
    bed: "1.8m 大床 + 客厅",
    size: "78㎡",
    image: suite,
  },
];

export function getRoomType(id: string) {
  return ROOM_TYPES.find((r) => r.id === id);
}

export function diffNights(a: string, b: string) {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.max(1, Math.round((d2 - d1) / 86400000));
}
