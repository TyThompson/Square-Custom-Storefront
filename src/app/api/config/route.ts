import { NextResponse } from "next/server";
import { getSquareConfig } from "@/lib/square";

export async function GET() {
  const config = getSquareConfig();
  return NextResponse.json({
    mode: config.mode,
    environment: config.environment,
    applicationId: config.applicationId,
    locationId: config.locationId,
    webPaymentsSdkUrl:
      config.environment === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js",
  });
}
