import { useEffect, useSyncExternalStore } from "react";

import deluxe from "@/assets/room-deluxe.jpg";
import suite from "@/assets/room-suite.jpg";
import twin from "@/assets/room-twin.jpg";

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

const listeners = new Set<() => void>();
let ordersCache: Order[] = [];
let ordersLoaded = false;
let ordersLoading: Promise<Order[]> | null = null;

const imageMap: Record<string, string> = {
  "room-deluxe": deluxe,
  "room-suite": suite,
  "room-twin": twin,
};

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
};

type ApiRoom = Omit<RoomType, "image"> & {
  image: string;
};

type BookingPayload = Omit<Order, "id" | "createdAt" | "status">;

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(body.message || "请求失败");
  }
  return body.data;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    roomNumber: order.roomNumber || undefined,
  };
}

function setOrders(orders: Order[]) {
  ordersCache = orders.map(normalizeOrder);
  ordersLoaded = true;
  notify();
}

async function loadOrders(): Promise<Order[]> {
  if (ordersLoading) return ordersLoading;
  ordersLoading = request<PageResponse<Order>>("/api/orders?page=0&size=100")
    .then((page) => {
      setOrders(page.items);
      return ordersCache;
    })
    .finally(() => {
      ordersLoading = null;
    });
  return ordersLoading;
}

async function loadOrder(orderNo: string): Promise<Order> {
  const order = normalizeOrder(await request<Order>(`/api/orders/${encodeURIComponent(orderNo)}`));
  const rest = ordersCache.filter((item) => item.id !== order.id);
  setOrders([order, ...rest]);
  return order;
}

function read(): Order[] {
  if (typeof window !== "undefined" && !ordersLoaded) {
    void loadOrders().catch(() => {
      ordersLoaded = true;
      notify();
    });
  }
  return ordersCache;
}

export const ordersStore = {
  getAll: () => read(),
  async refresh() {
    return loadOrders();
  },
  async getById(id: string): Promise<Order | null> {
    const cached = ordersCache.find((order) => order.id.toLowerCase() === id.toLowerCase());
    if (cached) return cached;
    try {
      return await loadOrder(id);
    } catch {
      return null;
    }
  },
  async add(o: BookingPayload): Promise<Order> {
    const order = normalizeOrder(
      await request<Order>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          guestName: o.guestName,
          phone: o.phone,
          idNumber: o.idNumber,
          roomTypeId: o.roomTypeId,
          checkIn: o.checkIn,
          checkOut: o.checkOut,
          guests: o.guests,
        }),
      }),
    );
    setOrders([order, ...ordersCache.filter((item) => item.id !== order.id)]);
    return order;
  },
  async update(id: string, patch: Partial<Order>): Promise<Order | null> {
    if (patch.status === "checked_in") {
      const order = await request<Order>("/api/checkins", {
        method: "POST",
        body: JSON.stringify({
          orderNo: id,
          idNumberTail: patch.idNumber?.slice(-4) || "",
        }),
      });
      const normalized = normalizeOrder(order);
      setOrders([normalized, ...ordersCache.filter((item) => item.id !== normalized.id)]);
      return normalized;
    }
    const current = ordersCache.find((order) => order.id === id);
    if (!current) return null;
    const next = normalizeOrder({ ...current, ...patch });
    setOrders([next, ...ordersCache.filter((item) => item.id !== id)]);
    return next;
  },
  async checkin(orderNo: string, idNumberTail: string): Promise<Order> {
    const order = normalizeOrder(
      await request<Order>("/api/checkins", {
        method: "POST",
        body: JSON.stringify({ orderNo, idNumberTail }),
      }),
    );
    setOrders([order, ...ordersCache.filter((item) => item.id !== order.id)]);
    return order;
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};

export function useOrders(): Order[] {
  useEffect(() => {
    void ordersStore.refresh().catch(() => {
      ordersLoaded = true;
      notify();
    });
  }, []);
  return useSyncExternalStore(
    ordersStore.subscribe,
    () => read(),
    () => [],
  );
}

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

export async function loadRoomTypes(): Promise<RoomType[]> {
  try {
    const page = await request<PageResponse<ApiRoom>>("/api/rooms?page=0&size=20");
    return page.items.map((room) => ({
      ...room,
      image: imageMap[room.image] || room.image,
    }));
  } catch {
    return ROOM_TYPES;
  }
}

export function getRoomType(id: string) {
  return ROOM_TYPES.find((r) => r.id === id);
}

export function diffNights(a: string, b: string) {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.max(1, Math.round((d2 - d1) / 86400000));
}
