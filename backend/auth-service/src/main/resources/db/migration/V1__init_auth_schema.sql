-- ============================================================
-- Well-Wipes Auth Service Schema
-- V1: users + refresh_tokens
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(255),
    avatar_url      VARCHAR(512),
    provider        VARCHAR(32) NOT NULL,   -- GOOGLE, GITHUB, LOCAL
    provider_id     VARCHAR(255),           -- OAuth subject ID
    password_hash   VARCHAR(255),           -- null for OAuth-only users
    role            VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER',
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_users_provider_provider_id UNIQUE (provider, provider_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ------------------------------------------------------------
-- Refresh tokens (rotating, opaque, hashed)
-- ------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,   -- SHA-256 of the raw token
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    replaced_by     UUID,                            -- rotation chain
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ------------------------------------------------------------
-- Seed an admin user (dev only — remove for prod)
-- ------------------------------------------------------------
INSERT INTO users (email, full_name, provider, role, email_verified, enabled)
VALUES ('admin@wellwipes.local', 'Well-Wipes Admin', 'LOCAL', 'ADMIN', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;
