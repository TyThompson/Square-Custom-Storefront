import { SquareClient, SquareEnvironment } from "square";
import { DEMO_CATALOG, type CatalogItem } from "@/lib/catalog";

export type SquareRuntimeConfig = {
  configured: boolean;
  applicationId: string | null;
  locationId: string | null;
  environment: "sandbox" | "production";
  mode: "mock" | "square";
};

export function getSquareConfig(): SquareRuntimeConfig {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN?.trim();
  const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.trim() || null;
  const locationId = process.env.SQUARE_LOCATION_ID?.trim() || null;
  const environment =
    process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";

  const configured = Boolean(accessToken && applicationId && locationId);

  return {
    configured,
    applicationId,
    locationId,
    environment,
    mode: configured ? "square" : "mock",
  };
}

export function getSquareClient() {
  const token = process.env.SQUARE_ACCESS_TOKEN?.trim();
  if (!token) return null;

  return new SquareClient({
    token,
    environment:
      process.env.SQUARE_ENVIRONMENT === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
}

export async function loadCatalog(): Promise<{
  items: CatalogItem[];
  source: "mock" | "square";
}> {
  const config = getSquareConfig();
  const client = getSquareClient();

  if (!config.configured || !client) {
    return { items: DEMO_CATALOG, source: "mock" };
  }

  try {
    const response = await client.catalog.list({ types: "ITEM" });
    const items: CatalogItem[] = [];

    for await (const obj of response) {
      if (obj.type !== "ITEM" || !obj.itemData) continue;
      const variation = obj.itemData.variations?.[0];
      if (!variation || variation.type !== "ITEM_VARIATION") continue;
      const money = variation.itemVariationData?.priceMoney;
      if (!money?.amount) continue;

      items.push({
        id: obj.id ?? variation.id ?? crypto.randomUUID(),
        name: obj.itemData.name ?? "Untitled item",
        description: obj.itemData.description ?? "From your Square catalog.",
        priceCents: Number(money.amount),
        category: obj.itemData.categoryId ? "Catalog" : "Square",
        image: "/products/beans.svg",
        accent: "#3d5a45",
      });
    }

    if (items.length === 0) {
      return { items: DEMO_CATALOG, source: "mock" };
    }

    return { items, source: "square" };
  } catch {
    return { items: DEMO_CATALOG, source: "mock" };
  }
}

export async function createSquareOrderAndPayment(input: {
  locationId: string;
  sourceId: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  note?: string;
  fulfillment: "PICKUP" | "SHIPPING";
  lines: { name: string; quantity: number; unitPriceCents: number; catalogObjectId?: string }[];
}) {
  const client = getSquareClient();
  if (!client) {
    throw new Error("Square client is not configured");
  }

  const totalCents = input.lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );

  const orderResponse = await client.orders.create({
    order: {
      locationId: input.locationId,
      lineItems: input.lines.map((line) => ({
        name: line.name,
        quantity: String(line.quantity),
        basePriceMoney: {
          amount: BigInt(line.unitPriceCents),
          currency: "USD",
        },
        ...(line.catalogObjectId
          ? { catalogObjectId: line.catalogObjectId }
          : {}),
      })),
      fulfillments: [
        {
          type: input.fulfillment === "PICKUP" ? "PICKUP" : "SHIPMENT",
          state: "PROPOSED",
          ...(input.fulfillment === "PICKUP"
            ? {
                pickupDetails: {
                  recipient: {
                    displayName: input.customerName,
                    emailAddress: input.customerEmail,
                    phoneNumber: input.phone,
                  },
                  scheduleType: "ASAP",
                  note: input.note,
                },
              }
            : {
                shipmentDetails: {
                  recipient: {
                    displayName: input.customerName,
                    emailAddress: input.customerEmail,
                    phoneNumber: input.phone,
                  },
                },
              }),
        },
      ],
    },
    idempotencyKey: crypto.randomUUID(),
  });

  const order = orderResponse.order;
  if (!order?.id) {
    throw new Error("Square CreateOrder did not return an order id");
  }

  const paymentResponse = await client.payments.create({
    sourceId: input.sourceId,
    idempotencyKey: crypto.randomUUID(),
    amountMoney: {
      amount: BigInt(totalCents),
      currency: "USD",
    },
    orderId: order.id,
    locationId: input.locationId,
    buyerEmailAddress: input.customerEmail,
    note: input.note,
  });

  const payment = paymentResponse.payment;
  if (!payment?.id) {
    throw new Error("Square CreatePayment did not return a payment id");
  }

  return {
    squareOrderId: order.id,
    squarePaymentId: payment.id,
    totalCents,
  };
}
