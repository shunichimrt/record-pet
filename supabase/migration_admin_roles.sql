-- Create admin_users table to manage system administrators
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
-- Only admins can view admin list
CREATE POLICY "Admins can view admin list"
  ON admin_users
  FOR SELECT
  USING (
    user_id IN (SELECT user_id FROM admin_users)
  );

-- Only admins can create new admins
CREATE POLICY "Admins can create new admins"
  ON admin_users
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Only admins can delete admins
CREATE POLICY "Admins can delete admins"
  ON admin_users
  FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update pet_food_products RLS policies to allow admins to manage all products
-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own food products" ON pet_food_products;
DROP POLICY IF EXISTS "Users can update own food products" ON pet_food_products;
DROP POLICY IF EXISTS "Users can delete own food products" ON pet_food_products;

-- Create new policies that include admin access
CREATE POLICY "Users can create own food products"
  ON pet_food_products
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() OR is_admin(auth.uid())
  );

CREATE POLICY "Users and admins can update food products"
  ON pet_food_products
  FOR UPDATE
  USING (
    created_by = auth.uid() OR is_admin(auth.uid())
  );

CREATE POLICY "Users and admins can delete food products"
  ON pet_food_products
  FOR DELETE
  USING (
    created_by = auth.uid() OR is_admin(auth.uid())
  );

-- IMPORTANT: After running this migration, manually insert your admin user:
-- INSERT INTO admin_users (user_id) VALUES ('your-user-id-here');
-- You can get your user ID from the Supabase Auth dashboard or by logging in and checking auth.users table
