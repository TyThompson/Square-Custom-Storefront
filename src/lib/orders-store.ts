import { randomUUID } from "crypto";
import type { CatalogItem } from "@/lib/catalog";
import type {
  FulfillmentStatus,
  OrderLine,
  StoreOrder,
} from "@/lib/order-types";

export type { FulfillmentStatus, OrderLine, StoreOrder };

const globalStore = globalThis as typeof globalThis & {
  __northlineOrders?: Map<string, StoreOrder>;
};

function ordersMap() {
  if (!globalStore.__northlineOrders) {
    globalStore.__northlineOrders = new Map();
  }
  return globalStore.__northlineOrders;
}

export function createLocalOrder(input: {
  customerName: string;
  customerEmail: string;
  phone?: string;
  fulfillment: "PICKUP" | "SHIPPING";
  note?: string;
  lines: { item: CatalogItem; quantity: number }[];
  mode: "mock" | "square";
  squareOrderId?: string;
  squarePaymentId?: string;
}): StoreOrder {
  const now = new Date().toISOString();
  const lines: OrderLine[] = input.lines.map(({ item, quantity }) => ({
    itemId: item.id,
    name: item.name,
    quantity,
    unitPriceCents: item.priceCents,
  }));
  const totalCents = lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );

  const order: StoreOrder = {
    id: `nl_${randomUUID().slice(0, 8)}`,
    squareOrderId: input.squareOrderId,
    squarePaymentId: input.squarePaymentId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    phone: input.phone,
    fulfillment: input.fulfillment,
    note: input.note,
    lines,
    totalCents,
    currency: "USD",
    status: "RECEIVED",
    paymentStatus: "COMPLETED",
    mode: input.mode,
    createdAt: now,
    updatedAt: now,
    timeline: [
      { at: now, label: "Order placed on your storefront", status: "RECEIVED" },
    ],
  };

  ordersMap().set(order.id, order);

  if (input.mode === "mock") {
    scheduleMockProgress(order.id);
  }

  return order;
}

export function getOrder(id: string) {
  return ordersMap().get(id);
}

export function listOrders() {
  return Array.from(ordersMap().values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function updateOrderStatus(
  id: string,
  status: FulfillmentStatus,
  label: string,
) {
  const order = ordersMap().get(id);
  if (!order) return undefined;
  const at = new Date().toISOString();
  order.status = status;
  order.updatedAt = at;
  order.timeline.push({ at, label, status });
  ordersMap().set(id, order);
  return order;
}

function scheduleMockProgress(orderId: string) {
  const steps: { delayMs: number; status: FulfillmentStatus; label: string }[] =
    [
      {
        delayMs: 4000,
        status: "PREPARING",
        label: "Kitchen started preparing your order",
      },
      {
        delayMs: 10000,
        status: "READY",
        label: "Ready for pickup at the counter",
      },
    ];

  for (const step of steps) {
    setTimeout(() => {
      const current = getOrder(orderId);
      if (
        !current ||
        current.status === "CANCELED" ||
        current.status === "COMPLETED"
      ) {
        return;
      }
      if (
        current.status === "RECEIVED" ||
        (step.status === "READY" && current.status === "PREPARING")
      ) {
        updateOrderStatus(orderId, step.status, step.label);
      }
    }, step.delayMs);
  }
}
