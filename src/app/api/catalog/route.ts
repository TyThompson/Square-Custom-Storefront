import { NextResponse } from "next/server";
import { loadCatalog } from "@/lib/square";

export async function GET() {
  const catalog = await loadCatalog();
  return NextResponse.json(catalog);
}
