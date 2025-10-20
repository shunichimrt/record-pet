-- Fix UPDATE policy for share_tokens to allow admin to update is_active flag

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Admins can update share tokens" ON share_tokens;

-- Recreate with proper WITH CHECK clause
-- Admins can update tokens for their family pets
CREATE POLICY "Admins can update share tokens"
  ON share_tokens
  FOR UPDATE
  TO authenticated
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND is_admin = true
      )
    )
  )
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND is_admin = true
      )
    )
  );

-- Verify the policy was created
SELECT
  policyname,
  cmd,
  roles::text[] as roles,
  qual IS NOT NULL as has_using,
  with_check IS NOT NULL as has_with_check
FROM pg_policies
WHERE tablename = 'share_tokens' AND cmd = 'UPDATE';
