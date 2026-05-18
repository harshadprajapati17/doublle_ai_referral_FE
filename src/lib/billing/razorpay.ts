const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${CHECKOUT_SCRIPT_SRC}"]`,
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Razorpay SDK failed to load.")),
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.src = CHECKOUT_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Razorpay SDK failed to load."));
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

export type OpenRazorpaySubscriptionOptions = {
  keyId: string;
  subscriptionId: string;
  planLabel: string;
  onSuccess: (response: RazorpaySubscriptionSuccessResponse) => void;
  onDismiss?: () => void;
  onFailed?: (error: unknown) => void;
};

export async function openRazorpaySubscriptionCheckout(
  options: OpenRazorpaySubscriptionOptions,
): Promise<void> {
  await loadRazorpayCheckoutScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay SDK not available after load.");
  }

  const rzp = new window.Razorpay({
    key: options.keyId,
    subscription_id: options.subscriptionId,
    name: "Doublle",
    description: `Plan: ${options.planLabel}`,
    handler: options.onSuccess,
    modal: {
      ondismiss: options.onDismiss,
    },
    theme: { color: "#0f172a" },
  });

  rzp.on("payment.failed", (resp) => {
    options.onFailed?.(resp);
  });

  rzp.open();
}
