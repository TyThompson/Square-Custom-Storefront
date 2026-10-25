"use client";

import { useEffect, useState } from "react";

type ConfigResponse = {
  mode: "mock" | "square";
  environment: "sandbox" | "production";
};

export function ModeBanner() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: ConfigResponse) => setConfig(data))
      .catch(() => setConfig({ mode: "mock", environment: "sandbox" }));
  }, []);

  if (!config) return null;

  if (config.mode === "square") {
    return (
      <div className="border-b border-emerald-800/20 bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-950">
        Connected to Square ({config.environment}). Checkout uses Web Payments
        SDK on this storefront — no Square Online site.
      </div>
    );
  }

  return (
    <div className="border-b border-amber-800/15 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
      Running in demo mode. Add Square sandbox credentials to process real
      sandbox payments while keeping the entire order flow on this site.
    </div>
  );
}
