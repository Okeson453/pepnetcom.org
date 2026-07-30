// Matches the real backend's OrderStatus enum (prisma/schema.prisma) exactly
// — the old mock router only had 5 made-up values (PENDING/IN_PROGRESS/
// REVIEW/COMPLETED/CANCELLED); the real one has 10.
export type OrderStatus =
  | "DRAFT"
  | "PENDING_PAYMENT"
  | "PAID"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "DELIVERED"
  | "REVISION_REQUESTED"
  | "COMPLETED"
  | "CANCELLED";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  DRAFT: "Draft",
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  UNDER_REVIEW: "Under Review",
  DELIVERED: "Delivered",
  REVISION_REQUESTED: "Revision Requested",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, "neutral" | "warning" | "success" | "danger"> = {
  DRAFT: "neutral",
  PENDING_PAYMENT: "warning",
  PAID: "success",
  ASSIGNED: "warning",
  IN_PROGRESS: "warning",
  UNDER_REVIEW: "warning",
  DELIVERED: "success",
  REVISION_REQUESTED: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};
