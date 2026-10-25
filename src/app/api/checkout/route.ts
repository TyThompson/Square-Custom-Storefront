import { NextResponse } from "next/server";
import { getCatalogItem } from "@/lib/catalog";
import { createLocalOrder } from "@/lib/orders-store";
import {
  createSquareOrderAndPayment,
  getSquareConfig,
} from "@/lib/square";

type CheckoutBody = {
  customerName?: string;
  customerEmail?: string;
  phone?: string;
  note?: string;
  fulfillment?: "PICKUP" | "SHIPPING";
  sourceId?: string;
  lines?: { itemId: string; quantity: number }[];
};

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const customerName = body.customerName?.trim();
  const customerEmail = body.customerEmail?.trim();
  const fulfillment = body.fulfillment ?? "PICKUP";
  const linesInput = body.lines ?? [];

  if (!customerName || !customerEmail) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 },
    );
  }

  if (linesInput.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const resolvedLines = [];
  for (const line of linesInput) {
    const item = getCatalogItem(line.itemId);
    if (!item || line.quantity < 1) {
      return NextResponse.json(
        { error: `Unknown item: ${line.itemId}` },
        { status: 400 },
      );
    }
    resolvedLines.push({ item, quantity: Math.min(line.quantity, 20) });
  }

  const config = getSquareConfig();

  try {
    if (config.mode === "square") {
      if (!body.sourceId) {
        return NextResponse.json(
          { error: "Payment token (sourceId) is required in Square mode" },
          { status: 400 },
        );
      }
      if (!config.locationId) {
        return NextResponse.json(
          { error: "SQUARE_LOCATION_ID is missing" },
          { status: 500 },
        );
      }

      const squareResult = await createSquareOrderAndPayment({
        locationId: config.locationId,
        sourceId: body.sourceId,
        customerName,
        customerEmail,
        phone: body.phone?.trim(),
        note: body.note?.trim(),
        fulfillment,
        lines: resolvedLines.map(({ item, quantity }) => ({
          name: item.name,
          quantity,
          unitPriceCents: item.priceCents,
        })),
      });

      const order = createLocalOrder({
        customerName,
        customerEmail,
        phone: body.phone?.trim(),
        fulfillment,
        note: body.note?.trim(),
        lines: resolvedLines,
        mode: "square",
        squareOrderId: squareResult.squareOrderId,
        squarePaymentId: squareResult.squarePaymentId,
      });

      return NextResponse.json({ order });
    }

    // Mock path: full storefront checkout without leaving your site.
    const order = createLocalOrder({
      customerName,
      customerEmail,
      phone: body.phone?.trim(),
      fulfillment,
      note: body.note?.trim(),
      lines: resolvedLines,
      mode: "mock",
      squarePaymentId: `mock_pay_${Date.now()}`,
    });

    return NextResponse.json({ order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed unexpectedly";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
