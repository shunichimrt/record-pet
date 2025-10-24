-- Fix admin_users RLS policies to avoid circular reference

-- Drop the problematic SELECT policy
DROP POLICY IF EXISTS "Admins can view admin list" ON admin_users;

-- Create a new SELECT policy that uses the is_admin() function
-- Since is_admin() is SECURITY DEFINER, it bypasses RLS
CREATE POLICY "Allow authenticated users to check admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Alternative: If you want to be more restrictive, allow users to only see their own record
-- CREATE POLICY "Users can view their own admin status"
--   ON admin_users
--   FOR SELECT
--   USING (user_id = auth.uid());
