import { describe, it, expect } from "vitest";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/features/orders/api/order-status";

describe("order status helpers", () => {
  it("has a label for every status", () => {
    for (const status of Object.keys(ORDER_STATUS_LABEL)) {
      expect(ORDER_STATUS_LABEL[status as keyof typeof ORDER_STATUS_LABEL]).toBeTruthy();
    }
  });

  it("has a tone for every status", () => {
    for (const status of Object.keys(ORDER_STATUS_TONE)) {
      expect(ORDER_STATUS_TONE[status as keyof typeof ORDER_STATUS_TONE]).toBeTruthy();
    }
  });

  it("marks COMPLETED as success and CANCELLED as danger", () => {
    expect(ORDER_STATUS_TONE.COMPLETED).toBe("success");
    expect(ORDER_STATUS_TONE.CANCELLED).toBe("danger");
  });
});
