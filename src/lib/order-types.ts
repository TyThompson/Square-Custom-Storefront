export type OrderLine = {
  itemId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
};

export type FulfillmentStatus =
  | "RECEIVED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELED";

export type StoreOrder = {
  id: string;
  squareOrderId?: string;
  squarePaymentId?: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  fulfillment: "PICKUP" | "SHIPPING";
  note?: string;
  lines: OrderLine[];
  totalCents: number;
  currency: string;
  status: FulfillmentStatus;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  mode: "mock" | "square";
  createdAt: string;
  updatedAt: string;
  timeline: { at: string; label: string; status: FulfillmentStatus }[];
};
