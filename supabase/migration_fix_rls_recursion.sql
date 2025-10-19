-- Fix infinite recursion in RLS policies
-- The issue: family_members SELECT policy references family_members table itself
-- Solution: Use SECURITY DEFINER function to bypass RLS and avoid recursion

-- Step 1: Create a helper function that runs with elevated privileges
CREATE OR REPLACE FUNCTION get_user_family_ids(user_uuid uuid)
RETURNS TABLE(family_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT family_id FROM family_members WHERE user_id = user_uuid;
$$;

-- Step 2: Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their family members" ON family_members;
DROP POLICY IF EXISTS "Users can view their families" ON families;

-- Step 3: Recreate policies using the helper function (no recursion)
CREATE POLICY "Users can view their family members"
  ON family_members
  FOR SELECT
  USING (
    family_id IN (SELECT get_user_family_ids(auth.uid()))
  );

CREATE POLICY "Users can view their families"
  ON families
  FOR SELECT
  USING (
    id IN (SELECT get_user_family_ids(auth.uid()))
  );
