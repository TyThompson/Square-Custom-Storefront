"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type SquareConfig = {
  mode: "mock" | "square";
  environment: "sandbox" | "production";
  applicationId: string | null;
  locationId: string | null;
  webPaymentsSdkUrl: string;
};

type PaymentFormProps = {
  amountLabel: string;
  disabled?: boolean;
  onToken: (sourceId: string) => Promise<void>;
};

declare global {
  interface Window {
    Square?: {
      payments: (
        applicationId: string,
        locationId: string,
      ) => Promise<{
        card: () => Promise<{
          attach: (selector: string) => Promise<void>;
          tokenize: () => Promise<{
            status: string;
            token?: string;
            errors?: { message: string }[];
          }>;
          destroy: () => Promise<void>;
        }>;
      }>;
    };
  }
}

export function PaymentForm({ amountLabel, disabled, onToken }: PaymentFormProps) {
  const [config, setConfig] = useState<SquareConfig | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<{ destroy: () => Promise<void>; tokenize: () => Promise<{
    status: string;
    token?: string;
    errors?: { message: string }[];
  }> } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const res = await fetch("/api/config");
      const data = (await res.json()) as SquareConfig;
      if (cancelled) return;
      setConfig(data);

      if (data.mode !== "square" || !data.applicationId || !data.locationId) {
        setReady(true);
        return;
      }

      await loadSquareScript(data.webPaymentsSdkUrl);
      if (cancelled || !window.Square) return;

      const payments = await window.Square.payments(
        data.applicationId,
        data.locationId,
      );
      const card = await payments.card();
      await card.attach("#card-container");
      cardRef.current = card;
      setReady(true);
    }

    setup().catch((err: Error) => {
      if (!cancelled) setError(err.message);
    });

    return () => {
      cancelled = true;
      const card = cardRef.current;
      cardRef.current = null;
      if (card) {
        void card.destroy();
      }
    };
  }, []);

  async function handlePay() {
    setError(null);
    setBusy(true);
    try {
      if (config?.mode === "mock") {
        await onToken(`cnon:card-nonce-ok`);
        return;
      }

      const card = cardRef.current;
      if (!card) {
        throw new Error("Payment form is not ready");
      }
      const result = await card.tokenize();
      if (result.status !== "OK" || !result.token) {
        throw new Error(
          result.errors?.[0]?.message ?? "Card tokenization failed",
        );
      }
      await onToken(result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
          Payment
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {config?.mode === "square"
            ? "Card details stay on Square’s Web Payments SDK — never touch your servers."
            : "Demo mode simulates a successful card nonce so you can exercise the full order + tracking path."}
        </p>
      </div>

      {config?.mode === "square" ? (
        <div
          id="card-container"
          className="min-h-[96px] rounded-xl border border-[var(--line)] bg-white p-3"
        />
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--wash)] px-4 py-5 text-sm text-[var(--muted)]">
          Mock card form — no real charge. Click pay to place the order on this
          storefront.
        </div>
      )}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        disabled={!ready || disabled || busy}
        onClick={handlePay}
        className="h-11 w-full bg-[var(--moss)] text-white hover:bg-[var(--ink)]"
      >
        {busy ? "Processing…" : `Pay ${amountLabel}`}
      </Button>
    </div>
  );
}

function loadSquareScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing && window.Square) {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Square Web Payments SDK")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Square Web Payments SDK"));
    document.head.appendChild(script);
  });
}
