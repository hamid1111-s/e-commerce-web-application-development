/*
# Create storage buckets for receipts and product images

## Overview
This migration creates two public storage buckets:
1. **receipts** — For customer payment receipt screenshots uploaded during checkout
2. **products** — For product images uploaded by admin

## Security
- Both buckets are public (anyone can read files via public URL).
- Uploads are allowed for anon + authenticated (customers upload receipts, admin uploads product images).
- Deletes/updates are restricted to authenticated (admin only).

## Important Notes
1. The receipts bucket is public-read so the admin can view receipt screenshots in the dashboard.
2. The products bucket is public-read so product images display on the storefront.
3. File paths are randomized to avoid collisions.
*/

-- Insert the storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('receipts', 'receipts', true),
  ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- ==================== RECEIPTS BUCKET POLICIES ====================
-- Public read
DROP POLICY IF EXISTS "public_read_receipts" ON storage.objects;
CREATE POLICY "public_read_receipts" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'receipts');

-- Public upload (customers submit receipts without login)
DROP POLICY IF EXISTS "public_upload_receipts" ON storage.objects;
CREATE POLICY "public_upload_receipts" ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'receipts');

-- Admin delete receipts
DROP POLICY IF EXISTS "admin_delete_receipts" ON storage.objects;
CREATE POLICY "admin_delete_receipts" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'receipts');

-- ==================== PRODUCTS BUCKET POLICIES ====================
-- Public read
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'products');

-- Admin upload product images
DROP POLICY IF EXISTS "admin_upload_product_images" ON storage.objects;
CREATE POLICY "admin_upload_product_images" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Admin update product images
DROP POLICY IF EXISTS "admin_update_product_images" ON storage.objects;
CREATE POLICY "admin_update_product_images" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'products') WITH CHECK (bucket_id = 'products');

-- Admin delete product images
DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;
CREATE POLICY "admin_delete_product_images" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');
