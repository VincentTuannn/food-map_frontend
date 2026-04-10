-- seed_accounts.sql
-- Run this script in your PostgreSQL database (e.g. foodtour_schema)
-- It uses the pgcrypto extension to generate bcrypt hashes securely.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create a Test Admin Account
INSERT INTO users (id, email, phone, password_hash, role, created_at)
VALUES (
    gen_random_uuid(),
    'admin@foodmap.vn',
    '0999999999',
    crypt('password123', gen_salt('bf', 12)),
    'admin',
    CURRENT_TIMESTAMP
);

-- 2. Create a Test Merchant Account
INSERT INTO merchants (id, email, password_hash, business_name, subscription_status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'merchant@foodmap.vn',
    crypt('password123', gen_salt('bf', 12)),
    'Test Merchant Food',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Note: The admin account uses the 'users' table with role='admin'
-- The merchant account uses the dedicated 'merchants' table.
