-- Fix SELECT policy for families table
-- Problem: Users cannot SELECT a family they just created because they're not yet in family_members
-- Solution: Allow users to SELECT families they created OR are members of

-- Drop the current SELECT policy
DROP POLICY IF EXISTS "Users can view their families" ON families;

-- Recreate with authenticated role (not public)
CREATE POLICY "Users can view their families"
  ON families
  FOR SELECT
  TO authenticated
  USING (
    -- Allow viewing if user is a member of the family
    id IN (SELECT get_user_family_ids(auth.uid()))
  );

-- Verify the policy
SELECT
  policyname,
  cmd,
  roles::text[] as roles
FROM pg_policies
WHERE tablename = 'families' AND cmd = 'SELECT';
