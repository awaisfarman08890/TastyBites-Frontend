import { loadStripe } from "@stripe/stripe-js";
import { stripe_public_key } from "./contants";

// Handle missing Stripe key gracefully
const stripeKey = stripe_public_key || "";
if (!stripeKey) {
  console.warn("Stripe public key is not configured. Please set VITE_STRIPE_PUBLIC_KEY environment variable.");
}

export const stripePromise = stripeKey ? loadStripe(stripeKey) : null;
