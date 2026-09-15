/*
# Create e-commerce schema for گوڵینە بۆ جوانکاری

## Overview
This migration creates the complete database schema for a Central Kurdish (Sorani) beauty
e-commerce store with an admin dashboard. The storefront is public (no customer login);
only the admin panel requires Supabase Auth.

## New Tables

1. **products** — Product catalog
   - `id` (uuid, primary key)
   - `title` (text, not null) — Product name in Sorani Kurdish
   - `category` (text, not null) — One of: چاودێری پێست, ماکیاژ, چاودێری قژ, عەتر و بۆن
   - `price_iqd` (integer, not null) — Price in Iraqi Dinars
   - `image_url` (text, nullable) — Public URL of product image in storage
   - `in_stock` (boolean, default true) — Whether the product is available
   - `shades` (text[], default '{}') — Array of shade/color names
   - `created_at` (timestamptz, default now())

2. **cities** — Delivery cities with fees
   - `id` (uuid, primary key)
   - `name` (text, not null) — City name in Sorani Kurdish
   - `delivery_fee_iqd` (integer, not null, default 0) — Delivery fee in IQD
   - `sort_order` (integer, not null, default 0) — Display ordering
   - `created_at` (timestamptz, default now())

3. **orders** — Customer orders
   - `id` (uuid, primary key)
   - `customer_name` (text, not null)
   - `customer_phone` (text, not null)
   - `city` (text, not null) — City name (denormalized for historical record)
   - `address_details` (text, not null)
   - `items` (jsonb, not null) — Array of {title, shade, quantity, price_iqd}
   - `delivery_fee_iqd` (integer, not null, default 0)
   - `total_price_iqd` (integer, not null)
   - `payment_method` (text, not null) — FIB, FastPay, QiCard, or کاش
   - `payment_receipt_url` (text, nullable) — Public URL of receipt screenshot
   - `status` (text, not null, default 'چاودێڕییە') — Order status in Sorani
   - `created_at` (timestamptz, default now())

## Security (RLS)

- **products**: Public read (anon + authenticated); write only for authenticated admin.
- **cities**: Public read (anon + authenticated); write only for authenticated admin.
- **orders**: Public insert (customers submit orders without login); read/update/delete
  only for authenticated admin.

## Important Notes

1. The storefront has NO customer authentication — customers browse and order anonymously.
2. The admin panel uses Supabase Auth (email/password) — only authenticated admins can
   manage products, cities, and orders.
3. Order status defaults to 'چاودێڕییە' (pending/under review).
4. The `items` column stores a snapshot of the cart at order time so historical orders
   remain accurate even if products are later edited or deleted.
5. Status values: 'چاودێڕییە' (pending), 'دراوە' (paid), 'نێردراوە' (shipped), 'تەواوبوو' (completed).
*/

-- ==================== PRODUCTS TABLE ====================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  price_iqd integer NOT NULL,
  image_url text,
  in_stock boolean NOT NULL DEFAULT true,
  shades text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- Admin write (insert)
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

-- Admin write (update)
DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Admin write (delete)
DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- ==================== CITIES TABLE ====================
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  delivery_fee_iqd integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "public_read_cities" ON cities;
CREATE POLICY "public_read_cities" ON cities FOR SELECT
  TO anon, authenticated USING (true);

-- Admin write (insert)
DROP POLICY IF EXISTS "admin_insert_cities" ON cities;
CREATE POLICY "admin_insert_cities" ON cities FOR INSERT
  TO authenticated WITH CHECK (true);

-- Admin write (update)
DROP POLICY IF EXISTS "admin_update_cities" ON cities;
CREATE POLICY "admin_update_cities" ON cities FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Admin write (delete)
DROP POLICY IF EXISTS "admin_delete_cities" ON cities;
CREATE POLICY "admin_delete_cities" ON cities FOR DELETE
  TO authenticated USING (true);

-- ==================== ORDERS TABLE ====================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  city text NOT NULL,
  address_details text NOT NULL,
  items jsonb NOT NULL,
  delivery_fee_iqd integer NOT NULL DEFAULT 0,
  total_price_iqd integer NOT NULL,
  payment_method text NOT NULL,
  payment_receipt_url text,
  status text NOT NULL DEFAULT 'چاودێڕییە',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public insert (customers submit orders without login)
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Admin read
DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders FOR SELECT
  TO authenticated USING (true);

-- Admin update (status changes)
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Admin delete
DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cities_sort_order ON cities(sort_order);

-- ==================== SEED DATA ====================
-- Insert default cities if none exist
INSERT INTO cities (name, delivery_fee_iqd, sort_order)
SELECT * FROM (VALUES
  ('هەولێر', 3000, 0),
  ('دهۆک', 3000, 1),
  ('سلێمانی', 3000, 2),
  ('کەرکووک', 3500, 3),
  ('بەغدا', 5000, 4),
  ('باسرە', 6000, 5),
  ('هەڵەبجە', 4000, 6),
  ('زاخۆ', 3000, 7)
) AS t(name, delivery_fee_iqd, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM cities LIMIT 1);

-- Insert sample products if none exist
INSERT INTO products (title, category, price_iqd, image_url, in_stock, shades)
SELECT * FROM (VALUES
  ('سیرەمی ڤیتامین سی', 'چاودێری پێست', 35000, '/vitamin-c-serum-bottle.png', true, ARRAY[]::text[]),
  ('شامپۆی ئارغان', 'چاودێری قژ', 28000, '/argan-shampoo-bottle.png', true, ARRAY[]::text[]),
  ('لیپستیکی سوور', 'ماکیاژ', 22000, '/red-lipstick.png', true, ARRAY['سوور', 'پەمەیی', 'ناسک']::text[]),
  ('فاونەدەیشنی مات', 'ماکیاژ', 30000, '/matte-foundation-makeup.png', true, ARRAY['سپی', 'ناوەند', 'تۆخ']::text[]),
  ('عەتری گوڵی', 'عەتر و بۆن', 45000, '/floral-perfume-bottle.png', true, ARRAY[]::text[]),
  ('کلێنزەری پێست', 'چاودێری پێست', 25000, '/gentle-facial-cleanser.png', true, ARRAY[]::text[])
) AS t(title, category, price_iqd, image_url, in_stock, shades)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
