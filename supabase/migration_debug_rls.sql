-- Debug and fix RLS policies for families table

-- First, let's check if RLS is enabled
-- (This is just for information, the result will be shown)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('families', 'family_members');

-- Drop ALL policies on families
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'families') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON families';
    END LOOP;
END $$;

-- Recreate INSERT policy with explicit configuration
CREATE POLICY "Users can create families"
  ON families
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify the policy was created
SELECT
  policyname,
  cmd,
  roles::text[],
  with_check
FROM pg_policies
WHERE tablename = 'families' AND cmd = 'INSERT';

-- Also recreate the SELECT policy from migration_fix_rls_recursion.sql
CREATE POLICY "Users can view their families"
  ON families
  FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT get_user_family_ids(auth.uid()))
  );

-- Recreate UPDATE and DELETE policies
CREATE POLICY "Admins can update families"
  ON families
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete families"
  ON families
  FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Show all policies for families table
SELECT
  policyname,
  cmd,
  roles::text[] as roles,
  CASE
    WHEN with_check IS NOT NULL THEN 'WITH CHECK defined'
    ELSE 'No WITH CHECK'
  END as has_with_check,
  CASE
    WHEN qual IS NOT NULL THEN 'USING defined'
    ELSE 'No USING'
  END as has_using
FROM pg_policies
WHERE tablename = 'families'
ORDER BY cmd, policyname;
