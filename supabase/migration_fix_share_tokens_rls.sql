-- Fix share_tokens RLS policies to restrict revocation to admins only
-- Based on permission model:
-- - Members can generate share links (INSERT)
-- - Admins can revoke share links (UPDATE/DELETE)

-- Drop existing policies for UPDATE and DELETE
DROP POLICY IF EXISTS "Family members can update share tokens" ON share_tokens;
DROP POLICY IF EXISTS "Family members can delete share tokens" ON share_tokens;

-- Only admins can update tokens (for revocation via is_active flag)
CREATE POLICY "Admins can update share tokens"
  ON share_tokens
  FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND is_admin = true
      )
    )
  );

-- Only admins can delete tokens
CREATE POLICY "Admins can delete share tokens"
  ON share_tokens
  FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND is_admin = true
      )
    )
  );
