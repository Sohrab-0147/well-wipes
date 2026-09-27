ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(16) NOT NULL DEFAULT 'ONLINE';

CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
