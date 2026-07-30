-- Audit remediation migration (see pepnetcom-backend-audit-report.md).
-- Hand-written rather than `prisma migrate dev`-generated, since this sandbox
-- has no database connection available. Review against a real `prisma migrate
-- diff` (or just run `prisma migrate dev` locally, which will regenerate an
-- equivalent migration from the updated schema.prisma) before applying to any
-- shared environment.

-- ============================================================
-- §3.2 — Payment.orderId retry deadlock
-- ============================================================
-- Drop the hard unique constraint on orderId (an order needs to allow
-- multiple payment *attempts*, only ever one SUCCESS).
DROP INDEX IF EXISTS "payments_order_id_key";
CREATE INDEX IF NOT EXISTS "payments_order_id_idx" ON "payments"("order_id");

-- Enforce the real invariant instead: at most one SUCCESS payment per order.
CREATE UNIQUE INDEX IF NOT EXISTS "payments_order_id_success_unique"
  ON "payments"("order_id")
  WHERE "status" = 'SUCCESS' AND "order_id" IS NOT NULL;

-- ============================================================
-- §9.1 / §9.2 — new payment targets (strategy purchases, subscriptions)
-- ============================================================
ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "strategy_purchase_id" TEXT,
  ADD COLUMN IF NOT EXISTS "subscription_id" TEXT,
  ADD COLUMN IF NOT EXISTS "signal_subscription_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "payments_strategy_purchase_id_key" ON "payments"("strategy_purchase_id");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_subscription_id_key" ON "payments"("subscription_id");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_signal_subscription_id_key" ON "payments"("signal_subscription_id");

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_strategy_purchase_id_fkey" FOREIGN KEY ("strategy_purchase_id")
    REFERENCES "strategy_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id")
    REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "payments_signal_subscription_id_fkey" FOREIGN KEY ("signal_subscription_id")
    REFERENCES "signal_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Pre-existing gap (not one of the 15 audit items, found while fixing
-- Payment schema above): Payment.userId had no formal relation/FK at all,
-- even though the application code has always done
-- `user: { connect: { id: userId } }` when creating a Payment.
-- ============================================================
ALTER TABLE "payments"
  ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- §9.1 — StrategyPurchase gets a real pre-payment lifecycle
-- ============================================================
CREATE TYPE "StrategyPurchaseStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED', 'FAILED');

-- Existing rows (created under the old "row exists = purchased" model) are
-- backfilled as ACTIVE so nobody who already had access loses it; only new
-- rows go through the PENDING flow from here on.
ALTER TABLE "strategy_purchases"
  ADD COLUMN IF NOT EXISTS "status" "StrategyPurchaseStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "strategy_purchases" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "strategy_purchases" ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "strategy_purchases" ALTER COLUMN "purchased_at" DROP NOT NULL;

-- The old (strategy_id, user_id) unique constraint blocked retrying a failed
-- purchase attempt entirely — same problem as §3.2. Replace it with a partial
-- unique index so only one ACTIVE purchase per user/strategy is enforced.
DROP INDEX IF EXISTS "strategy_purchases_strategy_id_user_id_key";
CREATE UNIQUE INDEX IF NOT EXISTS "strategy_purchases_active_unique"
  ON "strategy_purchases"("strategy_id", "user_id")
  WHERE "status" = 'ACTIVE';

CREATE INDEX IF NOT EXISTS "strategy_purchases_status_idx" ON "strategy_purchases"("status");

-- ============================================================
-- §9.2 — Subscription / SignalSubscription real creation path
-- ============================================================
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'PENDING';

-- Same backfill reasoning as strategy_purchases above: existing rows keep
-- ACTIVE, new default is PENDING.
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "signal_subscriptions"
  ADD COLUMN IF NOT EXISTS "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE "signal_subscriptions" ALTER COLUMN "amount" DROP DEFAULT;
ALTER TABLE "signal_subscriptions" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- NOTE: the DEFAULT 0 on "amount" above only exists to satisfy NOT NULL for
-- any pre-existing rows during the ALTER; if this deploys to an environment
-- that already has signal_subscriptions rows, backfill their real historical
-- amount manually afterward (there's no authoritative source for what those
-- legacy rows actually cost, since no payment was ever captured for them).
