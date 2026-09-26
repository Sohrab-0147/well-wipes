CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE payments (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                    UUID NOT NULL,
    user_id                     UUID NOT NULL,
    stripe_session_id           VARCHAR(255) UNIQUE,
    stripe_payment_intent_id    VARCHAR(255),
    amount_cents                BIGINT NOT NULL CHECK (amount_cents >= 0),
    currency                    VARCHAR(3) NOT NULL DEFAULT 'INR',
    status                      VARCHAR(32) NOT NULL,
    failure_reason              VARCHAR(500),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_session_id ON payments(stripe_session_id);

CREATE TABLE stripe_events (
    stripe_event_id     VARCHAR(255) PRIMARY KEY,
    event_type          VARCHAR(100) NOT NULL,
    processed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX idx_stripe_events_processed_at ON stripe_events(processed_at);
