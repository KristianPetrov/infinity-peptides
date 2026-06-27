"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateOrderStatusAction } from "../actions";
import {
  ORDER_STATUS_OPTIONS,
  SHIPPING_CARRIERS,
  type OrderStatus,
} from "@/lib/orders/config";

type OrderStatusFormProps = {
  orderId: string;
  status: OrderStatus;
  carrier?: string | null;
  trackingNumber?: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="card-cta card-cta-buy" disabled={pending}>
      {pending ? "Saving..." : "Update order"}
    </button>
  );
}

export function OrderStatusForm({
  orderId,
  status,
  carrier,
  trackingNumber,
}: OrderStatusFormProps) {
  const [nextStatus, setNextStatus] = useState<OrderStatus>(status);
  const [nextCarrier, setNextCarrier] = useState(carrier ?? "");
  const [nextTracking, setNextTracking] = useState(trackingNumber ?? "");
  const showShipping = nextStatus === "shipped";

  return (
    <form action={updateOrderStatusAction} className="order-status-form">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="order-status-grid">
        <label>
          Status
          <select
            name="status"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
          >
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {showShipping ? (
          <>
            <label>
              Carrier
              <select
                name="carrier"
                value={nextCarrier}
                required
                onChange={(event) => setNextCarrier(event.target.value)}
              >
                <option value="" disabled>
                  Select carrier
                </option>
                {SHIPPING_CARRIERS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tracking number
              <input
                name="trackingNumber"
                value={nextTracking}
                required
                placeholder="Tracking number"
                onChange={(event) => setNextTracking(event.target.value)}
              />
            </label>
          </>
        ) : (
          <>
            <input type="hidden" name="carrier" value="" />
            <input type="hidden" name="trackingNumber" value="" />
          </>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
