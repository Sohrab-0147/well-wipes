-- ============================================================
-- Well-Wipes Product Service Schema
-- V1: categories + products
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Categories
-- ------------------------------------------------------------
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL UNIQUE,
    slug            VARCHAR(140) NOT NULL UNIQUE,
    description     TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(active);

-- ------------------------------------------------------------
-- Products
-- ------------------------------------------------------------
CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku                 VARCHAR(64) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(280) NOT NULL UNIQUE,
    short_description   VARCHAR(500),
    description         TEXT,
    category_id         UUID REFERENCES categories(id) ON DELETE SET NULL,
    price_cents         BIGINT NOT NULL CHECK (price_cents >= 0),
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    stock_quantity      INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url           VARCHAR(512),
    attributes          JSONB NOT NULL DEFAULT '{}'::jsonb,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    featured            BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_price_id     VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_price_cents ON products(price_cents);
CREATE INDEX idx_products_attributes ON products USING GIN(attributes);

-- ------------------------------------------------------------
-- Seed categories (dev only)
-- ------------------------------------------------------------
INSERT INTO categories (name, slug, description, display_order) VALUES
    ('Facial Tissue', 'facial-tissue', 'Soft facial tissues for daily use', 1),
    ('Kitchen Roll', 'kitchen-roll', 'Absorbent kitchen paper towels', 2),
    ('Wet Wipes', 'wet-wipes', 'Moist wipes for hands, face, and surfaces', 3),
    ('Toilet Paper', 'toilet-paper', 'Bathroom tissue rolls', 4),
    ('Napkins', 'napkins', 'Paper napkins for dining', 5)
ON CONFLICT (slug) DO NOTHING;
