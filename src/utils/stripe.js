import { loadStripe } from "@stripe/stripe-js";
import { stripe_public_key } from "./contants";

export const stripePromise = loadStripe(stripe_public_key);
