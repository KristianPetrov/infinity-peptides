// Renders the order-confirmation email to /tmp/email-preview.html for a
// quick visual check. Run with: npx tsx scripts/preview-email.mts
import { writeFileSync } from "node:fs";
import { renderOrderConfirmationEmail } from "../lib/email/orders";
import type { OrderWithItems } from "../lib/orders/service";

const order = {
  id: "test-id",
  reference: "INF-8K2Q4B",
  email: "researcher@lab.com",
  status: "pending_payment",
  paymentMethod: "zelle",
  subtotalCents: 24500,
  shippingCents: 1500,
  totalCents: 26000,
  createdAt: new Date(),
  items: [
    {
      id: "1",
      name: "Retatrutide",
      slug: "retatrutide-30mg",
      quantity: 2,
      unitPriceCents: 6000,
    },
    {
      id: "2",
      name: "BPC-157",
      slug: "bpc-157-10mg",
      quantity: 1,
      unitPriceCents: 12500,
    },
  ],
} as unknown as OrderWithItems;

writeFileSync("/tmp/email-preview.html", renderOrderConfirmationEmail(order));
console.log("Wrote /tmp/email-preview.html");
