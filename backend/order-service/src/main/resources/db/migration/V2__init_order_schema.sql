CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    status              VARCHAR(32) NOT NULL,
    total_cents         BIGINT NOT NULL CHECK (total_cents >= 0),
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    shipping_address    JSONB NOT NULL,
    stripe_session_id   VARCHAR(255),
    payment_id          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL,
    sku                 VARCHAR(64) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    unit_price_cents    BIGINT NOT NULL CHECK (unit_price_cents >= 0),
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    subtotal_cents      BIGINT NOT NULL CHECK (subtotal_cents >= 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE TABLE outbox_event (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id    UUID NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    attempts        INTEGER NOT NULL DEFAULT 0,
    last_error      VARCHAR(1000),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at         TIMESTAMPTZ
);

CREATE INDEX idx_outbox_status ON outbox_event(status);
CREATE INDEX idx_outbox_created_at ON outbox_event(created_at);
