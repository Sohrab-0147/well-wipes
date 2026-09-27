CREATE TABLE IF NOT EXISTS coupons (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(64) NOT NULL UNIQUE,
    description         VARCHAR(255),
    type                VARCHAR(16) NOT NULL,
    value               BIGINT NOT NULL CHECK (value > 0),
    min_order_cents     BIGINT NOT NULL DEFAULT 0,
    max_uses            INTEGER,
    used_count          INTEGER NOT NULL DEFAULT 0,
    expires_at          TIMESTAMPTZ,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);

INSERT INTO coupons (code, description, type, value, min_order_cents, max_uses, active)
VALUES ('WELCOME10', 'Welcome offer — 10% off your first order', 'PERCENT', 10, 0, NULL, TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO coupons (code, description, type, value, min_order_cents, max_uses, active)
VALUES ('FLAT50', 'Flat ₹50 off orders over ₹499', 'FIXED', 5000, 49900, 100, TRUE)
ON CONFLICT (code) DO NOTHING;
